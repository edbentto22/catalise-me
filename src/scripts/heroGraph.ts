import {
  BufferAttribute, BufferGeometry, Color, DynamicDrawUsage, Euler, Group, InstancedMesh, LineBasicMaterial, LineLoop,
  LineSegments, Mesh, MeshBasicMaterial, Object3D, PerspectiveCamera, Points, PointsMaterial, Quaternion, Scene,
  ShaderMaterial, SphereGeometry, SRGBColorSpace, TorusGeometry, Vector3,
} from 'three';
import { gsap } from 'gsap';
import {
  LIME, SHAPE, clamp01, createGlassRenderer, createShapeGeometries, createStudio, easeOut, glassMaterial as makeGlass,
  gray, hexToRgb, inkRingMaterial, isCoarsePointer, limeCoreMaterial, makeGlowTexture, obsidianMaterial, orientShape,
  rethemeScene, seeded,
} from './glassKit';
import { runScene } from './sceneLifecycle';
import { onThemeChange } from './theme';

/**
 * Rede da empresa consultável (hero da Home) · árvore radial de objetos de vidro.
 *
 * Núcleo em vidro lima no centro. Nas diagonais, quatro hubs em vidro fumê (os pilares), cada um abrindo
 * uma cúpula 3D de objetos de vidro (duas camadas numa calota esférica), ligados ao hub como raios.
 * Mesma escala e material da esfera do Manifesto: objetos grandes o bastante para o vidro se ler.
 * As formas são um vocabulário: esfera = dados, cubo = tarefa, losango = decisão, pirâmide = execução,
 * anel = rotina, cápsula = processo. Cada pilar mistura as formas em setores do leque, com proporções
 * próprias (vindas do markup). Pulsos sobem dos objetos ao núcleo (pergunta) e descem às ações.
 *
 * - Objetos: InstancedMesh com vidro físico (transmissão, dispersão, iridescência) e ambiente de estúdio.
 *   Eles escrevem profundidade e as linhas ficam atrás: o vidro sempre aparece por cima.
 * - Linhas são opacas (fade feito em direção ao branco), por isso aparecem refratadas dentro do vidro.
 * - O hub em foco segue o título rotativo ou o mouse.
 * - Interação: clique num hub (ou no seu leque) e a câmera voa até ele; pinça, Ctrl/⌘ + rolagem e os
 *   botões dão zoom; arrastar gira a rede. Clique no núcleo, no mesmo hub ou Esc volta à visão geral.
 */
export interface HeroGraphOptions {
  canvas: HTMLCanvasElement;
  container: HTMLElement;
  /** Rótulos dos hubs: `data-tone` (cor hex) e `data-size` (nº de objetos) vêm do markup. */
  hubs: HTMLElement[];
  /** Sombras suaves desenhadas atrás do canvas, uma por hub. */
  shadows: HTMLElement[];
  /** Hub em foco para cada palavra do título rotativo (índice da palavra → índice do hub). */
  focusMap?: number[];
  rotator?: HTMLElement | null;
  pointerTarget?: HTMLElement | null;
}

const HUB_RADIUS = 1.85;
const HUB_R = 0.235;
const CORE_R = 0.27;
/**
 * Órbitas do núcleo: a empresa no centro, conectada a tudo o que precisa para funcionar.
 * Cada órbita tem raio, inclinação e material próprios; o plano precessa (gira e oscila) no seu ritmo
 * e quatro delas levam uma conta lima percorrendo o anel.
 */
const ORBITS = [
  { r: 0.4, tube: 0.012, tilt: [1.15, 0.25, 0], precess: 0.32, wobble: 0.14, tone: 'ink', bead: 1.15 },
  { r: 0.49, tube: 0.008, tilt: [0.35, 1.2, 0.4], precess: -0.24, wobble: 0.2, tone: 'graphite', bead: -0.8 },
  { r: 0.58, tube: 0.006, tilt: [1.55, -0.6, 0.2], precess: 0.19, wobble: 0.12, tone: 'lime', bead: 0 },
  { r: 0.67, tube: 0.01, tilt: [0.75, 0.3, -0.9], precess: -0.15, wobble: 0.18, tone: 'ink', bead: 0.62 },
  { r: 0.76, tube: 0.007, tilt: [1.25, -1.1, 0.6], precess: 0.11, wobble: 0.1, tone: 'graphite', bead: -0.48 },
] as const;
/** Raio da órbita mais externa: o rótulo "Sua empresa" fica abaixo dela. */
const CORE_RING = ORBITS[ORBITS.length - 1].r;
/** As linhas ficam um pouco atrás dos objetos que conectam. */
const LINE_BACK = 0.09;
const UP = new Vector3(0, 1, 0);
/** Distância mínima da câmera e quanto se afasta além da visão geral. */
const MIN_DIST = 3.2;
const MAX_DIST_FACTOR = 1.2;
/** Distância de voo até um hub, em fração da visão geral. */
const HUB_DIST_FACTOR = 0.55;

/* Pulsos: contas de luz desenhadas por shader (esfera simulada num ponto). */
const BEAD_VERT = /* glsl */ `
  uniform float uScale;
  attribute float aSize;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = max(1.0, aSize * uScale / -mv.z);
    vAlpha = 1.0;
  }
`;
const BEAD_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vAlpha;
  void main() {
    vec2 p = gl_PointCoord * 2.0 - 1.0;
    p.y = -p.y;
    float d = length(p);
    float aa = fwidth(d) * 1.25;
    float mask = 1.0 - smoothstep(1.0 - aa, 1.0, d);
    if (mask <= 0.0) discard;
    float z = sqrt(max(0.0, 1.0 - d * d));
    vec3 col = uColor * (0.75 + 0.35 * z);
    col = mix(col, vec3(1.0), (1.0 - smoothstep(0.02, 0.32, length((p - vec2(-0.3, 0.38)) * vec2(1.0, 1.6))) ) * 0.7);
    gl_FragColor = vec4(min(col, vec3(1.0)), uOpacity * mask * vAlpha);
  }
`;

export function initHeroGraph({ canvas, container, hubs, shadows, focusMap = [], rotator, pointerTarget }: HeroGraphOptions): (() => void) | undefined {
  const isCoarse = isCoarsePointer();
  const renderer = createGlassRenderer(canvas, isCoarse);
  if (!renderer) {
    container.dataset.state = 'off';
    return undefined;
  }

  const scene = new Scene();
  const camera = new PerspectiveCamera(34, 1, 0.1, 80);
  camera.position.set(0, 0, 10.2);
  const root = new Group();
  scene.add(root);

  // Câmera: `view` é o estado atual, `goal` o alvo; a cada quadro `view` se aproxima de `goal`.
  let baseDist = 10.2;
  const view = { x: 0, y: 0, dist: baseDist, yaw: 0, pitch: 0 };
  const goal = { x: 0, y: 0, dist: baseDist, yaw: 0, pitch: 0 };
  let zoomHub = -1;
  const coreLabel = container.querySelector<HTMLElement>('.hero-graph-core');
  const coreShadow = container.querySelector<HTMLElement>('.hero-graph-shadow-core');
  const hint = container.querySelector<HTMLElement>('[data-graph-hint]');

  const disposables: { dispose: () => void }[] = [];
  const track = <T extends { dispose: () => void }>(item: T) => { disposables.push(item); return item; };

  // Estúdio de luz compartilhado: reflexos de janelas de luz, luz principal e de contorno.
  const { key } = createStudio(renderer, scene, track);

  const rand = seeded(41);
  const glowTex = track(makeGlowTexture());

  /* ── Hubs: esferas de vidro fumê ────────────────────────────── */
  const hubCount = hubs.length;
  const hubTargets: Vector3[] = [];
  const hubDirs: Vector3[] = [];
  const hubTones: [number, number, number][] = [];
  const hubSizes: number[] = [];
  /** Setores do leque: cada forma ocupa uma fatia angular proporcional ao seu peso. */
  const hubMixes: { kind: number; until: number }[][] = [];
  hubs.forEach((el, i) => {
    // Diagonais, começando no alto à esquerda e seguindo em sentido horário.
    const angle = Math.PI * 0.75 - (i / hubCount) * Math.PI * 2;
    const dir = new Vector3(Math.cos(angle), Math.sin(angle), 0);
    hubDirs.push(dir);
    hubTargets.push(new Vector3(dir.x * HUB_RADIUS, dir.y * HUB_RADIUS, i % 2 ? -0.24 : 0.24));
    hubTones.push(hexToRgb(parseInt((el.dataset.tone || '#18181b').replace('#', ''), 16)));
    hubSizes.push(Math.max(8, Math.round(parseInt(el.dataset.size || '60', 10) * (isCoarse ? 0.55 : 1))));
    let mix: [number, number][] = [[0, 1]];
    try { mix = JSON.parse(el.dataset.mix || '[[0,1]]'); } catch { /* mantém esferas */ }
    const total = mix.reduce((sum, [, weight]) => sum + weight, 0) || 1;
    let acc = 0;
    hubMixes.push(mix.map(([kind, weight]) => { acc += weight / total; return { kind, until: acc }; }));
    // O nome fica do lado voltado ao centro e se estende para fora: nunca cobre o próprio leque nem o núcleo.
    el.dataset.side = `${dir.y > 0 ? 'below' : 'above'}-${dir.x < 0 ? 'left' : 'right'}`;
  });

  const sphereGeo = track(new SphereGeometry(1, 64, 48));
  const hubMeshes = hubTones.map((tone) => {
    const material = track(obsidianMaterial((Math.round(tone[0] * 255) << 16) | (Math.round(tone[1] * 255) << 8) | Math.round(tone[2] * 255)));
    const mesh = new Mesh(sphereGeo, material);
    mesh.scale.setScalar(HUB_R);
    root.add(mesh);
    return mesh;
  });

  // Anel de foco em lima ao redor do hub destacado.
  const haloGeo = track(new TorusGeometry(1, 0.035, 12, 96));
  const halos = hubMeshes.map(() => {
    const mat = track(new MeshBasicMaterial({ color: LIME, transparent: true, opacity: 0, depthWrite: false }));
    const halo = new Mesh(haloGeo, mat);
    root.add(halo);
    return halo;
  });

  /* ── Objetos de vidro: seis formas, um vocabulário de trabalho ── */
  // 0 dados · 1 tarefa · 2 decisão · 3 execução · 4 rotina · 5 processo
  const SHAPES = createShapeGeometries(track);
  const transmissive = !isCoarse;
  const glassMaterial = () => track(makeGlass(transmissive));

  interface Item {
    kind: number; slot: number; size: number;
    // objeto da cúpula: direção a partir do hub, raio, camada e ângulo polar (0 no centro da cúpula)
    hub: number; row: number; angle: number; r: number; normal: Vector3; theta: number; phase: number; tint: number;
    // nó de anel
    ring: number; ringAngle: number;
  }
  const items: Item[] = [];
  const kindCount = SHAPES.map(() => 0);
  const addItem = (partial: Partial<Item> & { kind: number; size: number }) => {
    const item: Item = {
      slot: kindCount[partial.kind]++,
      hub: -1, row: 0, angle: 0, r: 0, normal: UP, theta: 0, phase: rand() * Math.PI * 2, tint: 0.4, ring: -1, ringAngle: 0,
      ...partial,
    };
    items.push(item);
    return item;
  };

  /* Cúpulas: cada pilar abre uma calota esférica de objetos, voltada para fora e um pouco para a câmera. */
  const hubLeafStart: number[] = [];
  const hubLeafCount: number[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  const SHELLS = [
    { share: 0.68, radius: 1.16, cap: 1.2, size: 0.23, tint: 0.28 }, // camada externa
    { share: 0.32, radius: 0.74, cap: 1.0, size: 0.17, tint: 0.16 }, // camada interna, mais escura
  ];
  hubDirs.forEach((dir, i) => {
    const count = hubSizes[i];
    const axis = new Vector3(dir.x, dir.y, 0.55).normalize();
    // Base ortonormal da cúpula (u, v, eixo) para distribuir em espiral de Fibonacci na calota.
    const u = new Vector3().crossVectors(axis, new Vector3(0, 0, 1)).normalize();
    const v = new Vector3().crossVectors(axis, u).normalize();
    hubLeafStart[i] = items.length;
    SHELLS.forEach((shell, shellIndex) => {
      const n = shellIndex === 0 ? Math.round(count * shell.share) : count - Math.round(count * SHELLS[0].share);
      const cosCap = Math.cos(shell.cap);
      for (let j = 0; j < n; j++) {
        const cosT = 1 - (1 - cosCap) * ((j + 0.5) / n);
        const sinT = Math.sqrt(Math.max(0, 1 - cosT * cosT));
        const phi = j * golden + shellIndex * 0.9;
        const normal = new Vector3()
          .addScaledVector(u, Math.cos(phi) * sinT)
          .addScaledVector(v, Math.sin(phi) * sinT)
          .addScaledVector(axis, cosT)
          .normalize();
        const theta = Math.acos(cosT);
        // Faixas concêntricas (do centro da cúpula para a borda): cada forma ocupa uma faixa de área proporcional ao peso.
        const fraction = (j + 0.5) / n;
        const kind = (hubMixes[i].find((sector) => fraction <= sector.until) ?? hubMixes[i][hubMixes[i].length - 1]).kind;
        const edge = theta / shell.cap;
        addItem({
          kind, hub: i, row: shellIndex, normal, theta,
          angle: Math.atan2(normal.y, normal.x),
          r: shell.radius * (0.97 + rand() * 0.06),
          size: shell.size * (1 - edge * 0.22) * (0.92 + rand() * 0.16),
          tint: Math.min(0.7, shell.tint + edge * 0.24),
        });
      }
    });
    hubLeafCount[i] = items.length - hubLeafStart[i];
  });
  const leafCount = items.length;

  /* Anéis externos: objetos das quatro formas orbitando devagar. */
  const RINGS = [
    { r: 2.6, nodes: isCoarse ? 10 : 14, tilt: new Euler(0.16, 0, 0), speed: 0.03, opacity: 0.85, size: 0.17 },
    { r: 2.92, nodes: isCoarse ? 8 : 11, tilt: new Euler(-0.1, 0.12, 0), speed: -0.02, opacity: 0.9, size: 0.14 },
    { r: 3.22, nodes: isCoarse ? 6 : 8, tilt: new Euler(0.07, -0.16, 0), speed: 0.014, opacity: 0.93, size: 0.12 },
  ];
  RINGS.forEach((spec, ringIndex) => {
    for (let i = 0; i < spec.nodes; i++) {
      addItem({ kind: (i + ringIndex * 2) % SHAPES.length, ring: ringIndex, ringAngle: (i / spec.nodes) * Math.PI * 2 + ringIndex * 0.4, size: spec.size * (0.85 + rand() * 0.3), tint: 0.32 + ringIndex * 0.12 });
    }
  });

  const meshes = SHAPES.map((geo, kind) => {
    const mesh = new InstancedMesh(geo, glassMaterial(), Math.max(1, kindCount[kind]));
    mesh.count = kindCount[kind];
    mesh.instanceMatrix.setUsage(DynamicDrawUsage);
    mesh.setColorAt(0, new Color(1, 1, 1));
    mesh.instanceColor!.setUsage(DynamicDrawUsage);
    mesh.frustumCulled = false;
    root.add(mesh);
    return mesh;
  });
  const itemPos = new Float32Array(items.length * 3);

  /* ── Linhas (opacas: aparecem refratadas dentro do vidro) ───── */
  const leafLinePos = new Float32Array(leafCount * 6);
  const leafLineCol = new Float32Array(leafCount * 6);
  const leafLineGeo = track(new BufferGeometry());
  leafLineGeo.setAttribute('position', new BufferAttribute(leafLinePos, 3).setUsage(DynamicDrawUsage));
  leafLineGeo.setAttribute('color', new BufferAttribute(leafLineCol, 3).setUsage(DynamicDrawUsage));
  root.add(new LineSegments(leafLineGeo, track(new LineBasicMaterial({ vertexColors: true }))));

  const hubLinePos = new Float32Array(hubCount * 6);
  const hubLineCol = new Float32Array(hubCount * 6);
  const hubLineGeo = track(new BufferGeometry());
  hubLineGeo.setAttribute('position', new BufferAttribute(hubLinePos, 3));
  hubLineGeo.setAttribute('color', new BufferAttribute(hubLineCol, 3));
  root.add(new LineSegments(hubLineGeo, track(new LineBasicMaterial({ vertexColors: true }))));

  const spokePts: Vector3[] = [];
  hubDirs.forEach((dir, i) => spokePts.push(
    hubTargets[i].clone().setZ(hubTargets[i].z - LINE_BACK),
    new Vector3(dir.x * RINGS[0].r, dir.y * RINGS[0].r, -LINE_BACK),
  ));
  const spokeMat = track(new LineBasicMaterial({ color: 0xffffff }));
  root.add(new LineSegments(track(new BufferGeometry().setFromPoints(spokePts)), spokeMat));

  const ringLines = RINGS.map((spec) => {
    const pts: Vector3[] = [];
    for (let i = 0; i < 180; i++) { const a = (i / 180) * Math.PI * 2; pts.push(new Vector3(Math.cos(a) * spec.r, Math.sin(a) * spec.r, -LINE_BACK)); }
    const mat = track(new LineBasicMaterial({ color: 0xffffff }));
    const loop = new LineLoop(track(new BufferGeometry().setFromPoints(pts)), mat);
    loop.rotation.copy(spec.tilt);
    root.add(loop);
    return { loop, mat, spec };
  });

  /* ── Núcleo: vidro lima maior, cercado por órbitas em movimento ── */
  const coreMat = track(limeCoreMaterial());
  const core = new Mesh(sphereGeo, coreMat);
  core.scale.setScalar(CORE_R);
  root.add(core);
  const orbitMaterials = {
    ink: track(inkRingMaterial()),
    graphite: track(obsidianMaterial(0x71717a)),
    lime: track(limeCoreMaterial()),
  };
  const beadMat = track(limeCoreMaterial());
  beadMat.emissiveIntensity = 0.6;
  const beadGeo = track(new SphereGeometry(1, 20, 14));
  const orbits = ORBITS.map((spec) => {
    const pivot = new Group();
    pivot.rotation.set(spec.tilt[0], spec.tilt[1], spec.tilt[2]);
    const ring = new Mesh(track(new TorusGeometry(spec.r, spec.tube, 12, 160)), orbitMaterials[spec.tone]);
    pivot.add(ring);
    let bead: Mesh | null = null;
    if (spec.bead) {
      bead = new Mesh(beadGeo, beadMat);
      bead.scale.setScalar(0.034);
      pivot.add(bead);
    }
    root.add(pivot);
    return { pivot, bead, spec, phase: spec.r * 9 };
  });
  const coreGeo = track(new BufferGeometry().setFromPoints([new Vector3()]));
  const coreGlowMat = track(new PointsMaterial({ size: 3, map: glowTex, color: LIME, transparent: true, opacity: 0, depthWrite: false }));
  root.add(new Points(coreGeo, coreGlowMat));

  /* ── Pulsos: objeto → hub → núcleo (pergunta) e o caminho inverso (ação) ── */
  const pulseCount = isCoarse ? 8 : 16;
  const pulsePos = new Float32Array(pulseCount * 3);
  const pulseGeo = track(new BufferGeometry());
  pulseGeo.setAttribute('position', new BufferAttribute(pulsePos, 3).setUsage(DynamicDrawUsage));
  pulseGeo.setAttribute('aSize', new BufferAttribute(new Float32Array(pulseCount).fill(0.1), 1));
  const pixelScale = { value: 1 };
  const pulseMat = track(new ShaderMaterial({
    uniforms: { uScale: pixelScale, uColor: { value: new Color(LIME) }, uOpacity: { value: 0 } },
    vertexShader: BEAD_VERT, fragmentShader: BEAD_FRAG, transparent: true, depthWrite: false,
  }));
  root.add(new Points(pulseGeo, pulseMat));
  const pulseGlowMat = track(new PointsMaterial({ size: 0.42, map: glowTex, color: LIME, transparent: true, opacity: 0, depthWrite: false }));
  root.add(new Points(pulseGeo, pulseGlowMat));
  const pulses = Array.from({ length: pulseCount }, (_, i) => ({
    leaf: Math.floor(rand() * leafCount), t: rand(), speed: 0.3 + rand() * 0.22, inward: i % 3 !== 2,
  }));
  let coreBeat = 0;

  /* ── Foco: título rotativo e mouse ─────────────────────────────── */
  let rotatorIndex = Number(rotator?.dataset.index ?? 0);
  const onRotator = (event: Event) => { rotatorIndex = (event as CustomEvent<{ index: number }>).detail?.index ?? 0; };
  document.addEventListener('cx:rotator', onRotator);
  const emphasis = new Float32Array(hubCount);
  let focusMix = 0;
  let focus = -1;

  /* ── Entrada (GSAP) e ponteiro ─────────────────────────────────── */
  const state = { k: 0 };
  const intro = gsap.to(state, { k: 1, duration: 3.2, ease: 'power2.out', delay: 0.1, paused: true });
  const pointer = { x: 0, y: 0, tx: 0, ty: 0, px: -1e4, py: -1e4 };
  const onMove = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    const rect = container.getBoundingClientRect();
    pointer.px = event.clientX - rect.left;
    pointer.py = event.clientY - rect.top;
    pointer.tx = Math.max(-1, Math.min(1, (pointer.px / rect.width) * 2 - 1));
    pointer.ty = Math.max(-1, Math.min(1, (pointer.py / rect.height) * 2 - 1));
  };
  const onLeave = () => { pointer.tx = 0; pointer.ty = 0; pointer.px = pointer.py = -1e4; };
  const pointerEl = pointerTarget || container;
  if (!isCoarse) {
    pointerEl.addEventListener('pointermove', onMove);
    pointerEl.addEventListener('pointerleave', onLeave);
  }

  let focalPx = 400;
  const resize = () => {
    const width = Math.max(container.clientWidth, 1), height = Math.max(container.clientHeight, 1);
    camera.aspect = width / height;
    // Em telas estreitas a câmera se aproxima: a rede cresce junto com os rótulos, que têm tamanho fixo.
    const nextBase = width < 520 ? 10.6 : 10.2;
    // Telas estreitas: só o nome do pilar em foco aparece; as letras nas esferas identificam os demais.
    container.dataset.compact = width < 520 ? '1' : '0';
    if (nextBase !== baseDist) {
      const ratio = nextBase / baseDist;
      baseDist = nextBase;
      goal.dist *= ratio; view.dist *= ratio;
    }
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    root.scale.setScalar(width < 420 ? 0.94 : 1);
    const focal = height / (2 * Math.tan((camera.fov * Math.PI) / 360));
    pixelScale.value = focal * renderer.getPixelRatio();
    focalPx = focal;
    const pxPerWorld = (focal / baseDist) * root.scale.x;
    container.style.setProperty('--hub-r', `${(HUB_R * pxPerWorld).toFixed(1)}px`);
    container.style.setProperty('--core-r', `${((CORE_RING + 0.02) * pxPerWorld).toFixed(1)}px`);
  };

  /* ── Rótulos e sombras HTML projetados sobre os hubs e o núcleo ── */
  const projected = new Vector3();
  const world = new Vector3();
  const screen = hubs.map(() => ({ x: 0, y: 0, r: 16 }));
  const coreScreen = { x: 0, y: 0, r: 20 };
  const lastR = new Float32Array(hubCount + 1).fill(-1);
  const setRadius = (index: number, el: HTMLElement[], name: string, px: number) => {
    if (Math.abs(lastR[index] - px) < 0.25) return;
    lastR[index] = px;
    el.forEach((node) => node?.style.setProperty(name, `${px.toFixed(1)}px`));
  };
  const placeHubs = (k: number) => {
    const width = container.clientWidth, height = container.clientHeight;
    hubMeshes.forEach((mesh, i) => {
      mesh.getWorldPosition(world);
      projected.copy(world).project(camera);
      const x = (projected.x * 0.5 + 0.5) * width;
      const y = (-projected.y * 0.5 + 0.5) * height;
      const radius = (focalPx * mesh.scale.x * root.scale.x) / Math.max(0.5, camera.position.z - world.z);
      screen[i].x = x; screen[i].y = y; screen[i].r = radius;
      setRadius(i, [hubs[i], shadows[i]], '--hub-r', radius);
      const reveal = easeOut((k - 0.2 - i * 0.05) / 0.3);
      const dim = 1 - focusMix * (1 - emphasis[i]) * 0.3;
      hubs[i].style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      hubs[i].style.opacity = (reveal * dim).toFixed(3);
      const shadow = shadows[i];
      if (shadow) {
        shadow.style.transform = `translate(${x.toFixed(1)}px, ${(y + radius * 1.05).toFixed(1)}px)`;
        shadow.style.opacity = (easeOut((k - 0.1 - i * 0.045) / 0.4) * (0.75 + emphasis[i] * 0.25)).toFixed(3);
      }
    });
    core.getWorldPosition(world);
    projected.copy(world).project(camera);
    coreScreen.x = (projected.x * 0.5 + 0.5) * width;
    coreScreen.y = (-projected.y * 0.5 + 0.5) * height;
    coreScreen.r = (focalPx * (CORE_RING + 0.02) * root.scale.x) / Math.max(0.5, camera.position.z - world.z);
    setRadius(hubCount, [coreLabel, coreShadow].filter(Boolean) as HTMLElement[], '--core-r', coreScreen.r);
    const at = `translate(${coreScreen.x.toFixed(1)}px, ${coreScreen.y.toFixed(1)}px)`;
    if (coreLabel) coreLabel.style.transform = at;
    if (coreShadow) coreShadow.style.transform = at;
  };

  const smooth = (current: number, target: number, delta: number, rate = 6) => current + (target - current) * (1 - Math.exp(-rate * delta));
  const dummy = new Object3D();
  const align = new Quaternion();
  const spin = new Quaternion();
  const tint = new Color();
  const tmp = new Vector3();
  const ringPoint = new Vector3();
  /** Linha que "aparece" do branco: opaca, com a cor puxada para o branco enquanto não revelada. */
  const shadeToward = (value: number, reveal: number) => 1 - (1 - value) * reveal;

  const render = (time: number, delta: number, reduced: boolean) => {
    if (reduced) { state.k = 1; intro.pause(); }
    else if (!intro.isActive() && state.k < 1) intro.play();
    const k = state.k;
    const dt = delta || 0.016;

    // Câmera: segue o hub em foco; zoom, pan e giro do usuário se aproximam do alvo com suavidade.
    if (zoomHub >= 0) {
      hubMeshes[zoomHub].getWorldPosition(world);
      goal.x = world.x; goal.y = world.y;
    }
    const camRate = reduced ? 1e6 : 4.2;
    view.x = smooth(view.x, goal.x, dt, camRate);
    view.y = smooth(view.y, goal.y, dt, camRate);
    view.dist = smooth(view.dist, goal.dist, dt, camRate);
    view.yaw = smooth(view.yaw, goal.yaw, dt, reduced ? 1e6 : 6);
    view.pitch = smooth(view.pitch, goal.pitch, dt, reduced ? 1e6 : 6);
    camera.position.set(view.x, view.y, view.dist);
    camera.updateMatrixWorld();
    const engagedMix = clamp01((baseDist - view.dist) / (baseDist * 0.35));
    const engaged = zoomHub >= 0 || goal.dist < baseDist - 0.05 || Math.abs(goal.yaw) > 0.01 || Math.abs(goal.pitch) > 0.01;
    if ((container.dataset.engaged === '1') !== engaged) container.dataset.engaged = engaged ? '1' : '0';

    // Ponteiro: paralaxe da cena e direção da luz principal (mais contida com zoom).
    pointer.x = smooth(pointer.x, pointer.tx, dt);
    pointer.y = smooth(pointer.y, pointer.ty, dt);
    const sway = (reduced ? 0 : 1) * (1 - engagedMix);
    const parallax = 1 - engagedMix * 0.7;
    root.rotation.y = Math.sin(time * 0.21) * 0.12 * sway + pointer.x * 0.26 * parallax + view.yaw;
    root.rotation.x = Math.sin(time * 0.16) * 0.06 * sway - pointer.y * 0.18 * parallax + view.pitch;
    root.updateMatrixWorld();
    key.position.set(-3 + pointer.x * 3, 4 - pointer.y * 2.5, 6);
    const m = root.matrixWorld.elements;
    const front = (x: number, y: number, z: number) => clamp01((m[2] * x + m[6] * y + m[10] * z + 1.6) / 3.2);

    // Foco: hub aproximado > mouse sobre um hub > palavra do título.
    const hover = hubAt(pointer.px, pointer.py, 2.4);
    if ((container.dataset.hover === '1') !== (hover >= 0)) container.dataset.hover = hover >= 0 ? '1' : '0';
    const rotatorFocus = focusMap.length ? focusMap[rotatorIndex % focusMap.length] ?? -1 : -1;
    const nextFocus = zoomHub >= 0 ? zoomHub : reduced ? rotatorFocus : (hover >= 0 ? hover : rotatorFocus);
    if (nextFocus !== focus) {
      focus = nextFocus;
      hubs.forEach((el, i) => el.classList.toggle('is-focus', i === focus));
    }
    hubs.forEach((el, i) => {
      const pressed = i === zoomHub ? 'true' : 'false';
      if (el.getAttribute('aria-pressed') !== pressed) el.setAttribute('aria-pressed', pressed);
    });
    focusMix = reduced ? (focus >= 0 ? 1 : 0) : smooth(focusMix, focus >= 0 ? 1 : 0, dt, 4);
    for (let i = 0; i < hubCount; i++) emphasis[i] = reduced ? (i === focus ? 1 : 0) : smooth(emphasis[i], i === focus ? 1 : 0, dt, 5);

    // Hubs saem do núcleo até a sua posição, um após o outro.
    const lineReveal = clamp01((k - 0.12) / 0.5);
    for (let i = 0; i < hubCount; i++) {
      const h = easeOut((k - 0.06 - i * 0.045) / 0.4);
      const mesh = hubMeshes[i];
      mesh.position.copy(hubTargets[i]).multiplyScalar(h);
      mesh.scale.setScalar(HUB_R * Math.max(0.001, easeOut((k - 0.04 - i * 0.045) / 0.25)) * (1 + emphasis[i] * 0.14));
      const halo = halos[i];
      halo.position.copy(mesh.position);
      halo.scale.setScalar(HUB_R * (1.42 + emphasis[i] * 0.1));
      (halo.material as MeshBasicMaterial).opacity = emphasis[i] * 0.95 * h;
      hubLinePos.set([0, 0, -LINE_BACK, mesh.position.x, mesh.position.y, mesh.position.z - LINE_BACK], i * 6);
      // Caminho em foco: escuro; demais: grafite claro.
      const shade = gray(shadeToward(0.66 - emphasis[i] * 0.56 + focusMix * (1 - emphasis[i]) * 0.12, lineReveal), true);
      hubLineCol.set([shade, shade, shade, shade, shade, shade], i * 6);
    }
    hubLineGeo.attributes.position.needsUpdate = true;
    hubLineGeo.attributes.color.needsUpdate = true;

    // Objetos: leques florescem para fora do hub e se curvam para trás; anéis orbitam.
    const leafLineReveal = clamp01((k - 0.3) / 0.6);
    const ringReveal = clamp01((k - 0.45) / 0.55);
    for (let n = 0; n < items.length; n++) {
      const item = items[n];
      let x: number, y: number, z: number, scale: number, fade: number;
      const tone = item.hub >= 0 ? hubTones[item.hub] : hexToRgb(0x52525b);
      if (item.hub >= 0) {
        const e = emphasis[item.hub];
        // A cúpula floresce do centro para a borda e da camada interna para a externa.
        const bloom = easeOut((k - 0.28 - item.hub * 0.045 - item.theta * 0.12 - item.row * 0.04) / 0.45);
        const breathe = reduced ? 0 : Math.sin(time * 0.7 + item.phase) * 0.012;
        const r = item.r * bloom * (1 + breathe + e * 0.05);
        const hub = hubMeshes[item.hub].position;
        x = hub.x + item.normal.x * r;
        y = hub.y + item.normal.y * r;
        z = hub.z + item.normal.z * r;
        scale = item.size * Math.max(0.001, bloom) * (1 + e * 0.12);
        fade = clamp01(item.tint * (1 - e * 0.35) + (1 - front(x, y, z)) * 0.26 + focusMix * (1 - e) * 0.16);

        // Linha hub → objeto: escura junto ao hub, dissolve rumo ao objeto.
        leafLinePos.set([hub.x, hub.y, hub.z - LINE_BACK, x, y, z - LINE_BACK], n * 6);
        const near = shadeToward(clamp01(0.5 + fade * 0.35 - e * 0.25), leafLineReveal);
        const far = shadeToward(clamp01(0.8 + fade * 0.16 - e * 0.18), leafLineReveal);
        leafLineCol.set([
          gray(tone[0] + (1 - tone[0]) * near, true), gray(tone[1] + (1 - tone[1]) * near, true), gray(tone[2] + (1 - tone[2]) * near, true),
          gray(tone[0] + (1 - tone[0]) * far, true), gray(tone[1] + (1 - tone[1]) * far, true), gray(tone[2] + (1 - tone[2]) * far, true),
        ], n * 6);
      } else {
        const spec = RINGS[item.ring];
        const a = item.ringAngle + (reduced ? 0 : time * spec.speed);
        ringPoint.set(Math.cos(a) * spec.r, Math.sin(a) * spec.r, -LINE_BACK * 0.5).applyEuler(spec.tilt);
        x = ringPoint.x; y = ringPoint.y; z = ringPoint.z;
        scale = item.size * Math.max(0.001, easeOut((ringReveal - item.ringAngle * 0.04) / 0.6));
        fade = clamp01(item.tint + (1 - front(x, y, z)) * 0.25);
      }
      itemPos[n * 3] = x; itemPos[n * 3 + 1] = y; itemPos[n * 3 + 2] = z;

      dummy.position.set(x, y, z);
      // Postura por forma + giro em onda que sai do hub fileira por fileira: a luz varre as facetas.
      const wave = (reduced ? 0 : time * 0.55) - item.theta * 3 - item.row * 0.6 - (item.hub >= 0 ? item.hub * 0.8 : item.ringAngle * 2);
      if (item.hub >= 0 && (item.kind === SHAPE.EXECUTION || item.kind === SHAPE.PROCESS)) {
        // Execuções e processos apontam para fora da cúpula, como raios.
        dummy.quaternion.copy(align.setFromUnitVectors(UP, item.normal)).multiply(spin.setFromAxisAngle(UP, wave));
      } else {
        orientShape(dummy, item.kind, wave, item.hub >= 0 ? item.angle : item.ringAngle);
      }
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      const mesh = meshes[item.kind];
      mesh.setMatrixAt(item.slot, dummy.matrix);
      // Vidro fumê tingido pelo tom do pilar; o que está atrás ou fora de foco clareia.
      mesh.setColorAt(item.slot, tint.setRGB(
        gray(tone[0] + (1 - tone[0]) * fade), gray(tone[1] + (1 - tone[1]) * fade), gray(tone[2] + (1 - tone[2]) * fade), SRGBColorSpace,
      ));
    }
    meshes.forEach((mesh) => {
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    });
    leafLineGeo.attributes.position.needsUpdate = true;
    leafLineGeo.attributes.color.needsUpdate = true;

    const spokeShade = gray(shadeToward(0.86, clamp01((k - 0.55) / 0.45)));
    spokeMat.color.setRGB(spokeShade, spokeShade, spokeShade, SRGBColorSpace);
    ringLines.forEach(({ loop, mat, spec }) => {
      const shade = gray(shadeToward(spec.opacity, ringReveal));
      mat.color.setRGB(shade, shade, shade, SRGBColorSpace);
      if (!reduced) loop.rotation.z = time * spec.speed;
    });

    // Pulsos em dois trechos: objeto ↔ hub e hub ↔ núcleo; preferem o caminho em foco.
    coreBeat = Math.max(0, coreBeat - dt * 1.6);
    pulses.forEach((pulse, n) => {
      if (!reduced) {
        pulse.t += pulse.speed * dt;
        if (pulse.t >= 1) {
          pulse.t = 0;
          pulse.leaf = focus >= 0 && rand() < 0.7
            ? hubLeafStart[focus] + Math.floor(rand() * hubLeafCount[focus])
            : Math.floor(rand() * leafCount);
          if (pulse.inward) coreBeat = 1;
        }
      }
      const hub = hubMeshes[items[pulse.leaf].hub].position;
      const lx = itemPos[pulse.leaf * 3], ly = itemPos[pulse.leaf * 3 + 1], lz = itemPos[pulse.leaf * 3 + 2];
      const t = pulse.inward ? pulse.t : 1 - pulse.t;
      if (t < 0.5) { const u = easeOut(t * 2); tmp.set(lx + (hub.x - lx) * u, ly + (hub.y - ly) * u, lz + (hub.z - lz) * u); }
      else { const u = (t - 0.5) * 2; tmp.copy(hub).multiplyScalar(1 - u); }
      pulsePos.set([tmp.x, tmp.y, tmp.z - LINE_BACK * 0.5], n * 3);
    });
    pulseGeo.attributes.position.needsUpdate = true;
    const pulseReveal = reduced ? 0 : clamp01((k - 0.8) / 0.2);
    pulseMat.uniforms.uOpacity.value = pulseReveal;
    pulseGlowMat.opacity = pulseReveal * 0.55;

    // Núcleo: entra primeiro, pulsa a cada pergunta que chega.
    const coreIn = easeOut(k / 0.2);
    const beat = 1 + coreBeat * 0.22 + (reduced ? 0 : Math.sin(time * 1.5) * 0.03);
    core.scale.setScalar(CORE_R * Math.max(0.001, coreIn) * beat);
    coreMat.emissiveIntensity = 0.32 + coreBeat * 0.4;
    // Órbitas entram uma a uma; o plano de cada uma precessa e oscila, e as contas percorrem os anéis.
    orbits.forEach(({ pivot, bead, spec, phase }, i) => {
      pivot.scale.setScalar(Math.max(0.001, easeOut((k - 0.05 - i * 0.06) / 0.3)));
      if (!reduced) {
        pivot.rotation.x = spec.tilt[0] + Math.sin(time * 0.5 + phase) * spec.wobble;
        pivot.rotation.y = spec.tilt[1] + time * spec.precess;
        pivot.rotation.z = spec.tilt[2] + Math.cos(time * 0.37 + phase) * spec.wobble * 0.6;
      }
      if (bead) {
        const a = phase + (reduced ? 0 : time * spec.bead);
        bead.position.set(Math.cos(a) * spec.r, Math.sin(a) * spec.r, 0);
      }
    });
    coreGlowMat.size = 3 * (1 + coreBeat * 0.3);
    coreGlowMat.opacity = Math.min(1, k * 2) * (0.42 + coreBeat * 0.4);

    placeHubs(k);
    renderer.render(scene, camera);
  };

  /* ── Interação: clique para aproximar, zoom, giro ─────────────── */
  function hubAt(px: number, py: number, reach: number) {
    let index = -1;
    screen.forEach((p, i) => {
      const limit = Math.max(p.r * reach, 22) ** 2;
      const d = (p.x - px) ** 2 + (p.y - py) ** 2;
      if (d < limit && (index < 0 || d < (screen[index].x - px) ** 2 + (screen[index].y - py) ** 2)) index = i;
    });
    return index;
  }
  const nearestHub = (px: number, py: number) => {
    let index = 0, best = Infinity;
    screen.forEach((p, i) => { const d = (p.x - px) ** 2 + (p.y - py) ** 2; if (d < best) { best = d; index = i; } });
    return index;
  };
  const clampPan = () => {
    goal.x = Math.max(-3.2, Math.min(3.2, goal.x));
    goal.y = Math.max(-3.2, Math.min(3.2, goal.y));
  };
  let sceneLoop: (ReturnType<typeof runScene>) | null = null;
  const redraw = () => sceneLoop?.invalidate();

  const flyTo = (index: number) => {
    zoomHub = index;
    goal.dist = baseDist * HUB_DIST_FACTOR;
    // Um leve giro em direção ao hub revela a curvatura das pétalas.
    goal.yaw = -hubDirs[index].x * 0.38;
    goal.pitch = hubDirs[index].y * 0.26;
    redraw();
  };
  const overview = () => {
    zoomHub = -1;
    goal.x = 0; goal.y = 0; goal.dist = baseDist; goal.yaw = 0; goal.pitch = 0;
    redraw();
  };
  /** Zoom mantendo fixo o ponto sob o cursor (ou o hub em foco). */
  const zoomAt = (px: number, py: number, factor: number) => {
    const next = Math.max(MIN_DIST, Math.min(baseDist * MAX_DIST_FACTOR, goal.dist * factor));
    if (zoomHub >= 0) {
      if (next > baseDist * 0.9) { overview(); return; } // afastar o bastante solta o hub
    } else {
      const width = container.clientWidth || 1, height = container.clientHeight || 1;
      const half = Math.tan((camera.fov * Math.PI) / 360);
      const nx = (px / width) * 2 - 1, ny = -((py / height) * 2 - 1);
      const wx = goal.x + nx * half * camera.aspect * goal.dist, wy = goal.y + ny * half * goal.dist;
      goal.x = wx - nx * half * camera.aspect * next;
      goal.y = wy - ny * half * next;
      if (next >= baseDist - 0.05) { goal.x = 0; goal.y = 0; }
      clampPan();
    }
    goal.dist = next;
    redraw();
  };
  const local = (event: { clientX: number; clientY: number }) => {
    const rect = container.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };
  const select = (px: number, py: number) => {
    if ((px - coreScreen.x) ** 2 + (py - coreScreen.y) ** 2 < Math.max(coreScreen.r * 1.3, 22) ** 2) { overview(); return; }
    const index = nearestHub(px, py);
    if (index === zoomHub) {
      // No hub já aproximado: só o próprio hub devolve à visão geral.
      if (hubAt(px, py, 1.6) === index) overview();
      return;
    }
    flyTo(index);
  };

  let hintTimer = 0;
  const showHint = () => {
    if (!hint) return;
    hint.dataset.visible = '1';
    window.clearTimeout(hintTimer);
    hintTimer = window.setTimeout(() => { hint.dataset.visible = '0'; }, 1800);
  };
  const onWheel = (event: WheelEvent) => {
    const engaged = zoomHub >= 0 || goal.dist < baseDist - 0.05;
    // Rolagem simples continua rolando a página até a rede estar com zoom.
    if (!event.ctrlKey && !event.metaKey && !engaged) { showHint(); return; }
    event.preventDefault();
    event.stopPropagation(); // a rolagem suave da página não deve andar junto
    const delta = Math.max(-60, Math.min(60, event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY));
    const p = local(event);
    zoomAt(p.x, p.y, Math.exp(delta * 0.0045));
  };

  // Ponteiros: um arrasta (gira), dois fazem pinça (zoom); toque sem arrastar seleciona.
  const pointers = new Map<number, { x: number; y: number }>();
  let press: { x: number; y: number; moved: boolean } | null = null;
  let pinch = 0;
  const onDown = (event: PointerEvent) => {
    if ((event.target as HTMLElement).closest('button')) return;
    const p = local(event);
    pointers.set(event.pointerId, p);
    container.setPointerCapture?.(event.pointerId);
    if (pointers.size === 1) press = { x: p.x, y: p.y, moved: false };
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinch = Math.hypot(a.x - b.x, a.y - b.y);
      if (press) press.moved = true;
    }
  };
  const onDrag = (event: PointerEvent) => {
    const previous = pointers.get(event.pointerId);
    if (!previous) return;
    const p = local(event);
    pointers.set(event.pointerId, p);
    if (pointers.size >= 2) {
      const [a, b] = [...pointers.values()];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinch > 0 && distance > 0) zoomAt((a.x + b.x) / 2, (a.y + b.y) / 2, pinch / distance);
      pinch = distance;
      return;
    }
    if (!press) return;
    if (!press.moved && Math.hypot(p.x - press.x, p.y - press.y) > 5) {
      press.moved = true;
      container.dataset.dragging = '1';
    }
    if (press.moved) {
      goal.yaw = Math.max(-1.1, Math.min(1.1, goal.yaw + (p.x - previous.x) * 0.006));
      goal.pitch = Math.max(-0.7, Math.min(0.7, goal.pitch + (p.y - previous.y) * 0.0045));
      redraw();
    }
  };
  const onUp = (event: PointerEvent) => {
    if (!pointers.has(event.pointerId)) return;
    pointers.delete(event.pointerId);
    if (pointers.size < 2) pinch = 0;
    if (pointers.size === 0) {
      if (press && !press.moved && event.type === 'pointerup') {
        const p = local(event);
        select(p.x, p.y);
      }
      press = null;
      container.dataset.dragging = '0';
    }
  };
  const onKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') { overview(); return; }
    const cx = container.clientWidth / 2, cy = container.clientHeight / 2;
    if (event.key === '+' || event.key === '=') { event.preventDefault(); zoomAt(cx, cy, 0.72); }
    if (event.key === '-' || event.key === '_') { event.preventDefault(); zoomAt(cx, cy, 1 / 0.72); }
  };
  const hubClicks = hubs.map((el, i) => {
    const onClick = () => { if (zoomHub === i) overview(); else flyTo(i); };
    el.addEventListener('click', onClick);
    return onClick;
  });
  const zoomIn = container.querySelector<HTMLButtonElement>('[data-graph-zoom="in"]');
  const zoomOut = container.querySelector<HTMLButtonElement>('[data-graph-zoom="out"]');
  const reset = container.querySelector<HTMLButtonElement>('[data-graph-reset]');
  const onZoomIn = () => zoomAt(container.clientWidth / 2, container.clientHeight / 2, 0.72);
  const onZoomOut = () => zoomAt(container.clientWidth / 2, container.clientHeight / 2, 1 / 0.72);
  zoomIn?.addEventListener('click', onZoomIn);
  zoomOut?.addEventListener('click', onZoomOut);
  reset?.addEventListener('click', overview);
  container.addEventListener('wheel', onWheel, { passive: false });
  container.addEventListener('pointerdown', onDown);
  container.addEventListener('pointermove', onDrag);
  container.addEventListener('pointerup', onUp);
  container.addEventListener('pointercancel', onUp);
  container.addEventListener('keydown', onKey);
  container.dataset.interactive = '1';

  resize();
  renderer.compile(scene, camera);
  const stop = runScene({ container, resize, render, fps: isCoarse ? 30 : 60 });
  sceneLoop = stop;
  container.dataset.state = 'ready';
  // Troca de tema: materiais e luzes mudam na hora; as cores de linha e vidro seguem no próximo quadro.
  const offTheme = onThemeChange(() => { rethemeScene(scene); redraw(); });

  return () => {
    stop();
    offTheme();
    intro.kill();
    document.removeEventListener('cx:rotator', onRotator);
    window.clearTimeout(hintTimer);
    if (!isCoarse) {
      pointerEl.removeEventListener('pointermove', onMove);
      pointerEl.removeEventListener('pointerleave', onLeave);
    }
    hubs.forEach((el, i) => el.removeEventListener('click', hubClicks[i]));
    zoomIn?.removeEventListener('click', onZoomIn);
    zoomOut?.removeEventListener('click', onZoomOut);
    reset?.removeEventListener('click', overview);
    container.removeEventListener('wheel', onWheel);
    container.removeEventListener('pointerdown', onDown);
    container.removeEventListener('pointermove', onDrag);
    container.removeEventListener('pointerup', onUp);
    container.removeEventListener('pointercancel', onUp);
    container.removeEventListener('keydown', onKey);
    delete container.dataset.interactive;
    hubs.forEach((el) => { el.style.transform = ''; el.style.opacity = ''; el.classList.remove('is-focus'); });
    shadows.forEach((el) => { el.style.transform = ''; el.style.opacity = ''; });
    meshes.forEach((mesh) => mesh.dispose());
    disposables.forEach((item) => item.dispose());
    renderer.dispose();
  };
}
