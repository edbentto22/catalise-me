import {
  BufferGeometry, Color, DynamicDrawUsage, Float32BufferAttribute, Group, InstancedMesh, LineBasicMaterial, LineLoop,
  LineSegments, Mesh, MeshBasicMaterial, MeshPhysicalMaterial, Object3D, PerspectiveCamera, Points, PointsMaterial,
  QuadraticBezierCurve3, Quaternion, Scene, SphereGeometry, TorusGeometry, Vector3, type WebGLRenderer,
} from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { gsap } from 'gsap';
import { runScene } from './sceneLifecycle';
import { onThemeChange } from './theme';
import {
  LIME, SHAPE, gray, rethemeScene, themed, towardPaper, clamp01, createGlassRenderer, createShapeGeometries, createStudio, easeInOut, easeOut, glassMaterial,
  inkRingMaterial, isCoarsePointer, limeCoreMaterial, makeGlowTexture, obsidianMaterial, orientShape, seeded, srgb,
  tracker,
} from './glassKit';

/**
 * Cenas de vidro das páginas internas, no mesmo material da Home:
 * - thesis: objetos espalhados convergem numa esfera organizada em volta do núcleo lima ("será consultável").
 * - layer: pilares embaixo, a placa de vidro da camada no meio (com o trabalho visível dentro), a IA em cima;
 *   pulsos sobem (a empresa entendida pela IA) e descem (a IA trabalhando dentro dela).
 * - cycle: anel de vidro com os seis passos como formas do vocabulário; uma conta lima percorre o ciclo.
 * - stack (Sobre): quatro placas de vidro empilhadas, uma por pilar, com o trabalho de cada uma em cima;
 *   pulsos sobem pela pilha até o núcleo lima com órbitas. O que entregamos, camada por camada.
 * - orbit (Contato): o núcleo lima com órbitas e as seis formas de vidro girando como satélites.
 *   A conversa começa no centro.
 * Rótulos são HTML projetado sobre os pontos 3D (nítidos e traduzíveis).
 */
export type GlassVariant = 'thesis' | 'layer' | 'cycle' | 'stack' | 'orbit';

export interface GlassOptions {
  canvas: HTMLCanvasElement;
  container: HTMLElement;
  /** Seção que recebe o ponteiro (paralaxe) e, no ciclo, a lista de passos. */
  section?: HTMLElement | null;
}

type Dispose = () => void;

/* ── Palco comum ─────────────────────────────────────────────── */
function createStage(canvas: HTMLCanvasElement, container: HTMLElement, fov: number) {
  const isCoarse = isCoarsePointer();
  const renderer = createGlassRenderer(canvas, isCoarse);
  if (!renderer) { container.dataset.state = 'off'; return undefined; }
  const { track, disposeAll } = tracker();
  const scene = new Scene();
  const camera = new PerspectiveCamera(fov, 1, 0.1, 80);
  const root = new Group();
  scene.add(root);
  const { key } = createStudio(renderer, scene, track);
  return { renderer, scene, camera, root, track, disposeAll, isCoarse, transmissive: !isCoarse, key };
}

/** Ponteiro normalizado (-1..1) sobre um elemento, só mouse. */
function bindPointer(target: HTMLElement) {
  const pointer = { x: 0, y: 0, tx: 0, ty: 0, px: -1e4, py: -1e4 };
  const move = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    const rect = target.getBoundingClientRect();
    pointer.tx = clamp01((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.ty = clamp01((event.clientY - rect.top) / rect.height) * 2 - 1;
  };
  const leave = () => { pointer.tx = 0; pointer.ty = 0; };
  target.addEventListener('pointermove', move);
  target.addEventListener('pointerleave', leave);
  return { pointer, unbind: () => { target.removeEventListener('pointermove', move); target.removeEventListener('pointerleave', leave); } };
}

const smooth = (current: number, target: number, delta: number, rate = 6) => current + (target - current) * (1 - Math.exp(-rate * delta));

function fibonacciSphere(count: number, radius: number) {
  const points: Vector3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / Math.max(1, count - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    points.push(new Vector3(Math.cos(golden * i) * r * radius, y * radius, Math.sin(golden * i) * r * radius));
  }
  return points;
}

/** Projeta um ponto do mundo para pixels do container. */
function toScreen(point: Vector3, camera: PerspectiveCamera, container: HTMLElement, out = { x: 0, y: 0, z: 0 }) {
  const v = point.clone().project(camera);
  out.x = (v.x * 0.5 + 0.5) * container.clientWidth;
  out.y = (-v.y * 0.5 + 0.5) * container.clientHeight;
  out.z = v.z;
  return out;
}

function fitRenderer(renderer: WebGLRenderer, camera: PerspectiveCamera, container: HTMLElement) {
  const width = Math.max(container.clientWidth, 1), height = Math.max(container.clientHeight, 1);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
  return { width, height };
}

/** Linhas opacas (aparecem refratadas no vidro); o "fade" é feito em direção ao branco. */
const toWhite = (value: number, reveal: number) => 1 - (1 - value) * clamp01(reveal);

/** Cinza de linha (valor do desenho claro) já no tema atual; setRGB sem espaço de cor = linear. */
const lineGray = (value: number) => gray(value, true);

/** Troca de tema: materiais e luzes mudam na hora; cores calculadas por quadro seguem no próximo. */
function watchTheme(scene: Scene, loop: ReturnType<typeof runScene>) {
  return onThemeChange(() => { rethemeScene(scene); loop.invalidate(); });
}

const UP = new Vector3(0, 1, 0);

/* ══════════════ TESE · espalhado → esfera consultável ══════════════ */
function initThesis({ canvas, container, section }: GlassOptions): Dispose | undefined {
  const stage = createStage(canvas, container, 34);
  if (!stage) return undefined;
  const { renderer, scene, camera, root, track, disposeAll, isCoarse, transmissive, key } = stage;
  const rand = seeded(7);
  const shapes = createShapeGeometries(track);
  const glowTex = track(makeGlowTexture());

  const count = isCoarse ? 130 : 240;
  const outerN = Math.round(count * 0.72);
  const outer = fibonacciSphere(outerN, 2.25);
  const inner = fibonacciSphere(count - outerN, 1.35);
  interface Item { kind: number; slot: number; target: Vector3; normal: Vector3; origin: Vector3; size: number; delay: number; shell: number; phase: number }
  const kindCount = shapes.map(() => 0);
  const items: Item[] = [...outer, ...inner].map((target, i) => {
    const isOuter = i < outerN;
    // Casca externa em faixas de forma (organizada como um globo); interna misturada.
    const kind = isOuter ? Math.min(5, Math.floor((i / outerN) * 6)) : i % 6;
    return {
      kind, slot: kindCount[kind]++, target, normal: target.clone().normalize(),
      origin: new Vector3((rand() - 0.6) * 15, (rand() - 0.5) * 8.5, (rand() - 0.5) * 7),
      size: (isOuter ? 0.21 : 0.16) * (0.86 + rand() * 0.28),
      delay: rand() * 0.38, shell: isOuter ? 0 : 1, phase: rand() * Math.PI * 2,
    };
  });
  const meshes = shapes.map((geo, kind) => {
    const mesh = new InstancedMesh(geo, track(glassMaterial(transmissive)), Math.max(1, kindCount[kind]));
    mesh.count = kindCount[kind];
    mesh.instanceMatrix.setUsage(DynamicDrawUsage);
    mesh.setColorAt(0, new Color(1, 1, 1));
    mesh.frustumCulled = false;
    root.add(mesh);
    return mesh;
  });

  // Treliça: cada objeto da casca externa liga-se aos dois vizinhos mais próximos.
  const pairs: [number, number][] = [];
  for (let i = 0; i < outerN; i++) {
    outer
      .map((p, j) => ({ j, d: j === i ? Infinity : p.distanceToSquared(outer[i]) }))
      .sort((a, b) => a.d - b.d).slice(0, 2)
      .forEach(({ j }) => { if (i < j) pairs.push([i, j]); });
  }
  const linePos = new Float32Array(pairs.length * 6);
  const lineGeo = track(new BufferGeometry());
  lineGeo.setAttribute('position', new Float32BufferAttribute(linePos, 3).setUsage(DynamicDrawUsage));
  const lineMat = track(new LineBasicMaterial({ color: 0xffffff }));
  root.add(new LineSegments(lineGeo, lineMat));

  const core = new Mesh(track(new SphereGeometry(1, 48, 32)), track(limeCoreMaterial()));
  root.add(core);
  const ring = new Mesh(track(new TorusGeometry(0.62, 0.016, 16, 128)), track(inkRingMaterial()));
  root.add(ring);
  const glowMat = track(new PointsMaterial({ size: 2.4, map: glowTex, color: LIME, transparent: true, opacity: 0, depthWrite: false }));
  root.add(new Points(track(new BufferGeometry().setFromPoints([new Vector3()])), glowMat));

  const state = { k: 0 };
  const intro = gsap.to(state, { k: 1, duration: 2.6, ease: 'power3.inOut', delay: 0.25, paused: true });
  const { pointer, unbind } = bindPointer(section || container);
  let wide = true;
  const resize = () => {
    const { width } = fitRenderer(renderer, camera, container);
    wide = width > 960;
    camera.position.set(0, 0, wide ? 12 : 8.4);
    camera.updateProjectionMatrix();
    // No desktop a esfera ocupa a metade direita; no celular, o centro do bloco.
    const half = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
    root.position.set(wide ? 0.42 * half * camera.aspect : 0, wide ? -0.1 : 0, 0);
  };

  const dummy = new Object3D();
  const tint = new Color();
  const align = new Quaternion();
  const spin = new Quaternion();
  const pos = new Vector3();
  const positions = new Float32Array(outerN * 3);
  let coreBeat = 0, beaten = false;

  const render = (time: number, delta: number, reduced: boolean) => {
    if (reduced) { state.k = 1; intro.pause(); }
    else if (!intro.isActive() && state.k < 1) intro.play();
    const k = state.k, dt = delta || 0.016;
    const rect = (section || container).getBoundingClientRect();
    const scroll = clamp01(-rect.top / Math.max(1, rect.height));

    pointer.x = smooth(pointer.x, pointer.tx, dt);
    pointer.y = smooth(pointer.y, pointer.ty, dt);
    root.rotation.y = (reduced ? 0.4 : time * 0.07 + 0.4) + pointer.x * 0.22 + scroll * 0.9;
    root.rotation.x = 0.18 - pointer.y * 0.14 + scroll * 0.35;
    key.position.set(-3 + pointer.x * 3, 4 - pointer.y * 2.5, 6);
    root.updateMatrixWorld();
    const m = root.matrixWorld.elements;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const e = reduced ? 1 : easeInOut((k - item.delay) / 0.62);
      pos.lerpVectors(item.origin, item.target, e);
      if (!reduced && e < 1) {
        pos.x += Math.sin(time * 0.6 + item.phase) * (1 - e) * 0.25;
        pos.y += Math.cos(time * 0.5 + item.phase) * (1 - e) * 0.25;
      }
      if (i < outerN) positions.set([pos.x, pos.y, pos.z], i * 3);
      dummy.position.copy(pos);
      const wave = (reduced ? 0 : time * 0.5) - item.target.y * 0.9;
      if (item.kind === SHAPE.EXECUTION || item.kind === SHAPE.PROCESS) {
        // Execuções e processos apontam para fora da esfera.
        align.setFromUnitVectors(UP, item.normal);
        dummy.quaternion.copy(align).multiply(spin.setFromAxisAngle(UP, wave));
      } else {
        orientShape(dummy, item.kind, wave, Math.atan2(item.normal.y, item.normal.x));
      }
      dummy.scale.setScalar(item.size * (0.55 + 0.45 * Math.max(e, 0.001)));
      dummy.updateMatrix();
      meshes[item.kind].setMatrixAt(item.slot, dummy.matrix);
      // Profundidade: o que está atrás clareia; a casca interna é mais escura.
      const wz = m[2] * pos.x + m[6] * pos.y + m[10] * pos.z;
      const fade = clamp01((item.shell ? 0.18 : 0.34) + (1 - clamp01((wz + 2.4) / 4.8)) * 0.34 + (1 - e) * 0.25);
      const base = item.shell ? 0.16 : 0.25;
      const v = base + (1 - base) * fade;
      meshes[item.kind].setColorAt(item.slot, srgb(gray(v), gray(v), gray(v + 0.008), tint));
    }
    meshes.forEach((mesh) => { mesh.instanceMatrix.needsUpdate = true; if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true; });

    pairs.forEach(([a, b], n) => {
      linePos.set(positions.subarray(a * 3, a * 3 + 3), n * 6);
      linePos.set(positions.subarray(b * 3, b * 3 + 3), n * 6 + 3);
    });
    lineGeo.attributes.position.needsUpdate = true;
    const shade = lineGray(toWhite(0.8, (k - 0.7) / 0.3));
    lineMat.color.setRGB(shade, shade, shade);

    if (!beaten && k > 0.9) { beaten = true; coreBeat = 1; }
    coreBeat = Math.max(0, coreBeat - dt * 1.2);
    const coreIn = easeOut((k - 0.45) / 0.4);
    core.scale.setScalar(0.34 * Math.max(0.001, coreIn) * (1 + coreBeat * 0.25 + (reduced ? 0 : Math.sin(time * 1.4) * 0.03)));
    ring.scale.setScalar(Math.max(0.001, easeOut((k - 0.55) / 0.35)));
    if (!reduced) { ring.rotation.set(1.15 + Math.sin(time * 0.4) * 0.12, 0.25, time * 0.35); }
    glowMat.opacity = coreIn * (0.42 + coreBeat * 0.45);

    renderer.render(scene, camera);
  };

  resize();
  renderer.compile(scene, camera);
  const stop = runScene({ container, resize, render, fps: isCoarse ? 30 : 60 });
  const offTheme = watchTheme(scene, stop);
  container.dataset.state = 'ready';
  return () => { stop(); offTheme(); intro.kill(); unbind(); meshes.forEach((mesh) => mesh.dispose()); disposeAll(); renderer.dispose(); };
}

/* ══════════════ CAMADA · pilares → camada → IA ══════════════ */
function initLayer({ canvas, container, section }: GlassOptions): Dispose | undefined {
  const stage = createStage(canvas, container, 30);
  if (!stage) return undefined;
  const { renderer, scene, camera, root, track, disposeAll, isCoarse, transmissive, key } = stage;
  const shapes = createShapeGeometries(track);
  const glowTex = track(makeGlowTexture());
  const aiLabel = container.querySelector<HTMLElement>('[data-g-label="ai"]');
  const barLabel = container.querySelector<HTMLElement>('[data-g-label="bar"]');
  const hubLabels = [...container.querySelectorAll<HTMLElement>('[data-g-hub]')];

  const SLAB_W = 7.6, SLAB_H = 0.46, SLAB_D = 1.9;
  const HUB_Y = -2.05, CORE_Y = 2.2, HUB_R = 0.32;
  const hubX = hubLabels.map((_, i) => (i - (hubLabels.length - 1) / 2) * 2.05);

  // A camada: placa de vidro levemente lima, com o trabalho (formas escuras) visível dentro.
  const slabMat = track(new MeshPhysicalMaterial(transmissive
    // Placa fina e de índice baixo: o trabalho dentro dela aparece nítido, não deformado.
    ? { color: 0xe4f9cf, roughness: 0.015, metalness: 0, transmission: 1, thickness: 0.3, ior: 1.2, attenuationColor: 0xa9eb70, attenuationDistance: 1, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 1.5, iridescence: 0.25, iridescenceIOR: 1.25, specularIntensity: 1 }
    : { color: 0xeefbe2, roughness: 0.08, clearcoat: 1, envMapIntensity: 1.4, transparent: true, opacity: 0.78 }));
  // Sem transmissão (toque), a placa é um vidro opaco claro: no escuro vira grafite com reflexo lima.
  if (!transmissive) themed(slabMat, 0xeefbe2, 0x18221a);
  const slab = new Mesh(track(new RoundedBoxGeometry(SLAB_W, SLAB_H, SLAB_D, 5, 0.2)), slabMat);
  root.add(slab);
  const edgePts: Vector3[] = [];
  const hw = SLAB_W / 2 - 0.2, hd = SLAB_D / 2 - 0.2;
  for (let i = 0; i <= 160; i++) {
    // retângulo arredondado no topo da placa (contorno lima, como a borda acesa da camada)
    const t = (i / 160) * Math.PI * 2;
    const c = Math.cos(t), s = Math.sin(t);
    edgePts.push(new Vector3(Math.sign(c) * (hw + 0.2 * Math.abs(c) ** 0.2) * Math.min(1, Math.abs(c) * 6), SLAB_H / 2 + 0.002, Math.sign(s) * (hd + 0.2 * Math.abs(s) ** 0.2) * Math.min(1, Math.abs(s) * 6)));
  }
  const edgeMat = track(new LineBasicMaterial({ color: 0xffffff }));
  const edge = new LineLoop(track(new BufferGeometry().setFromPoints(edgePts)), edgeMat);
  root.add(edge);

  const innerKinds = shapes.map(() => 0);
  const cols = isCoarse ? 12 : 16, rows = 3;
  const inner: { kind: number; slot: number; x: number; z: number; phase: number }[] = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const kind = (c + r * 2) % 6;
    inner.push({ kind, slot: innerKinds[kind]++, x: (c - (cols - 1) / 2) * ((SLAB_W - 1) / (cols - 1)), z: (r - 1) * 0.52, phase: c * 0.35 + r });
  }
  const innerMat = track(obsidianMaterial(0x3f3f46));
  const innerMeshes = shapes.map((geo, kind) => {
    const mesh = new InstancedMesh(geo, innerMat, Math.max(1, innerKinds[kind]));
    mesh.count = innerKinds[kind];
    mesh.instanceMatrix.setUsage(DynamicDrawUsage);
    mesh.frustumCulled = false;
    root.add(mesh);
    return mesh;
  });

  const sphereGeo = track(new SphereGeometry(1, 48, 32));
  const hubs = hubLabels.map((el, i) => {
    const mesh = new Mesh(sphereGeo, track(obsidianMaterial(parseInt((el.dataset.tone || '#18181b').replace('#', ''), 16))));
    mesh.position.set(hubX[i], HUB_Y, 0);
    root.add(mesh);
    return mesh;
  });
  const core = new Mesh(sphereGeo, track(limeCoreMaterial()));
  core.position.set(0, CORE_Y, 0);
  root.add(core);
  const coreRing = new Mesh(track(new TorusGeometry(0.56, 0.015, 16, 128)), track(inkRingMaterial()));
  coreRing.position.copy(core.position);
  root.add(coreRing);
  const glowMat = track(new PointsMaterial({ size: 2, map: glowTex, color: LIME, transparent: true, opacity: 0, depthWrite: false }));
  const glow = new Points(track(new BufferGeometry().setFromPoints([new Vector3()])), glowMat);
  glow.position.copy(core.position);
  root.add(glow);

  // Rotas: pilar → placa (reta) e placa → IA (curva). Os pulsos seguem a rota inteira.
  const routes = hubX.map((x) => ({
    lower: [new Vector3(x, HUB_Y + HUB_R, 0), new Vector3(x, -SLAB_H / 2, 0)] as [Vector3, Vector3],
    curve: new QuadraticBezierCurve3(new Vector3(x, SLAB_H / 2, 0), new Vector3(x, 1.4, 0), new Vector3(0, CORE_Y - 0.3, 0)),
  }));
  const linePts: Vector3[] = [];
  routes.forEach(({ lower, curve }) => {
    linePts.push(lower[0], lower[1]);
    const pts = curve.getPoints(24);
    for (let i = 0; i < pts.length - 1; i++) linePts.push(pts[i], pts[i + 1]);
  });
  const lineMat = track(new LineBasicMaterial({ color: 0xffffff }));
  root.add(new LineSegments(track(new BufferGeometry().setFromPoints(linePts)), lineMat));
  const routePoint = (route: typeof routes[number], t: number, out: Vector3) => {
    // 0–0.35: pilar → placa · 0.35–0.45: atravessa a placa · 0.45–1: curva até a IA
    if (t < 0.35) return out.lerpVectors(route.lower[0], route.lower[1], easeInOut(t / 0.35));
    if (t < 0.45) return out.set(route.lower[1].x, -SLAB_H / 2 + SLAB_H * ((t - 0.35) / 0.1), 0);
    return route.curve.getPoint(easeInOut((t - 0.45) / 0.55), out);
  };
  const pulseGeo = track(new SphereGeometry(0.075, 20, 14));
  const upMat = track(new MeshBasicMaterial({ color: LIME }));
  const downMat = track(themed(new MeshBasicMaterial(), 0x18181b));
  const pulses = routes.flatMap((_, i) => [
    { route: i, up: true, t: i * 0.25, mesh: new Mesh(pulseGeo, upMat) },
    { route: i, up: false, t: 0.5 + i * 0.25, mesh: new Mesh(pulseGeo, downMat) },
  ]);
  pulses.forEach((p) => root.add(p.mesh));

  const state = { k: 0 };
  const intro = gsap.to(state, { k: 1, duration: 2.4, ease: 'power2.out', paused: true });
  const { pointer, unbind } = bindPointer(section || container);
  const resize = () => {
    const { width } = fitRenderer(renderer, camera, container);
    // Enquadra a largura da placa com folga; telas estreitas afastam a câmera.
    const fitZ = (SLAB_W * (width < 640 ? 0.54 : 0.62)) / (Math.tan((camera.fov * Math.PI) / 360) * camera.aspect);
    // Câmera elevada: a placa aparece como plataforma, com as fileiras de trabalho à vista.
    camera.position.set(0, 3.1, Math.max(width > 760 ? 11.2 : 9, fitZ));
    camera.lookAt(0, 0.05, 0);
    container.dataset.compact = width < 640 ? '1' : '0';
  };

  const dummy = new Object3D();
  const tmp = new Vector3();
  const screen = { x: 0, y: 0, z: 0 };
  const place = (el: HTMLElement | null, point: Vector3, reveal: number) => {
    if (!el) return;
    toScreen(point, camera, container, screen);
    el.style.transform = `translate(${screen.x.toFixed(1)}px, ${screen.y.toFixed(1)}px)`;
    el.style.opacity = reveal.toFixed(3);
  };

  const render = (time: number, delta: number, reduced: boolean) => {
    if (reduced) { state.k = 1; intro.pause(); }
    else if (!intro.isActive() && state.k < 1) intro.play();
    const k = state.k, dt = delta || 0.016;
    pointer.x = smooth(pointer.x, pointer.tx, dt);
    pointer.y = smooth(pointer.y, pointer.ty, dt);
    root.rotation.y = pointer.x * 0.16 + (reduced ? 0 : Math.sin(time * 0.25) * 0.04);
    root.rotation.x = -pointer.y * 0.06;
    key.position.set(-3 + pointer.x * 3, 4 - pointer.y * 2, 6);

    // Entrada: pilares sobem, a placa assenta, a IA acende, as linhas aparecem, os pulsos começam.
    hubs.forEach((hub, i) => {
      const e = easeOut((k - i * 0.06) / 0.4);
      hub.position.y = HUB_Y - (1 - e) * 0.6;
      hub.scale.setScalar(HUB_R * Math.max(0.001, e));
    });
    const slabIn = easeOut((k - 0.2) / 0.45);
    slab.position.y = (1 - slabIn) * -0.5;
    slab.scale.set(0.7 + 0.3 * slabIn, Math.max(0.001, slabIn), 0.7 + 0.3 * slabIn);
    edge.position.y = slab.position.y;
    edge.scale.copy(slab.scale);
    const edgeShade = 1 - slabIn;
    edgeMat.color.setRGB(towardPaper(0.54, edgeShade, true), towardPaper(0.95, edgeShade, true), towardPaper(0.2, edgeShade, true));
    inner.forEach((item) => {
      dummy.position.set(item.x, slab.position.y, item.z);
      orientShape(dummy, item.kind, (reduced ? 0 : time * 0.6) + item.phase, 0);
      dummy.scale.setScalar(0.2 * Math.max(0.001, easeOut((slabIn - 0.3) / 0.7)));
      dummy.updateMatrix();
      innerMeshes[item.kind].setMatrixAt(item.slot, dummy.matrix);
    });
    innerMeshes.forEach((mesh) => { mesh.instanceMatrix.needsUpdate = true; });
    const coreIn = easeOut((k - 0.45) / 0.35);
    core.scale.setScalar(0.3 * Math.max(0.001, coreIn) * (1 + (reduced ? 0 : Math.sin(time * 1.5) * 0.04)));
    coreRing.scale.setScalar(Math.max(0.001, coreIn));
    if (!reduced) coreRing.rotation.set(1.15 + Math.sin(time * 0.4) * 0.12, 0.25, time * 0.35);
    else coreRing.rotation.set(1.15, 0.25, 0);
    glowMat.opacity = coreIn * 0.5;
    const shade = lineGray(toWhite(0.55, (k - 0.35) / 0.4));
    lineMat.color.setRGB(shade, shade, shade);

    const pulseIn = reduced ? 0 : clamp01((k - 0.8) / 0.2);
    pulses.forEach((p) => {
      if (!reduced) p.t = (p.t + dt / (p.up ? 2.8 : 3.2)) % 1;
      routePoint(routes[p.route], p.up ? p.t : 1 - p.t, tmp);
      p.mesh.position.copy(tmp);
      p.mesh.scale.setScalar(Math.max(0.001, pulseIn));
    });

    root.updateMatrixWorld();
    camera.updateMatrixWorld();
    place(aiLabel, tmp.copy(core.position).add(new Vector3(0, 0.78, 0)).applyMatrix4(root.matrixWorld), coreIn);
    place(barLabel, tmp.set(0, slab.position.y - 0.02, SLAB_D / 2 + 0.02).applyMatrix4(root.matrixWorld), slabIn);
    hubs.forEach((hub, i) => place(hubLabels[i], tmp.copy(hub.position).applyMatrix4(root.matrixWorld), easeOut((k - 0.15 - i * 0.06) / 0.3)));

    renderer.render(scene, camera);
  };

  resize();
  renderer.compile(scene, camera);
  const stop = runScene({ container, resize, render, fps: isCoarse ? 30 : 60 });
  const offTheme = watchTheme(scene, stop);
  container.dataset.state = 'ready';
  return () => {
    stop(); offTheme(); intro.kill(); unbind();
    [aiLabel, barLabel, ...hubLabels].forEach((el) => { if (el) { el.style.transform = ''; el.style.opacity = ''; } });
    innerMeshes.forEach((mesh) => mesh.dispose());
    disposeAll(); renderer.dispose();
  };
}

/* ══════════════ CICLO · seis passos num anel de vidro ══════════════ */
const STEP_SHAPES = [SHAPE.DATA, SHAPE.DECISION, SHAPE.EXECUTION, SHAPE.TASK, SHAPE.ROUTINE, SHAPE.PROCESS];

function initCycle({ canvas, container, section }: GlassOptions): Dispose | undefined {
  const stage = createStage(canvas, container, 32);
  if (!stage) return undefined;
  const { renderer, scene, camera, root, track, disposeAll, isCoarse, transmissive, key } = stage;
  const shapes = createShapeGeometries(track);
  const glowTex = track(makeGlowTexture());
  const host = section || container;
  const items = [...host.querySelectorAll<HTMLElement>('[data-loop-item]')];
  const stepLabels = [...container.querySelectorAll<HTMLElement>('[data-g-step]')];
  const word = container.querySelector<HTMLElement>('[data-loop-word]');
  const countEl = container.querySelector<HTMLElement>('[data-loop-count]');
  const steps = items.length || stepLabels.length || 6;

  const R = 1.75;
  const ringGroup = new Group();
  ringGroup.rotation.x = -1.02; // anel deitado, visto em perspectiva
  root.add(ringGroup);
  // Anel em metal escuro polido (o mesmo das órbitas): legível sobre o fundo claro.
  const torus = new Mesh(track(new TorusGeometry(R, 0.012, 16, 240)), track(inkRingMaterial()));
  ringGroup.add(torus);

  // Passo 0 na frente, embaixo; os demais seguem o anel.
  const angleOf = (i: number) => -Math.PI / 2 + (i / steps) * Math.PI * 2;
  const nodes = Array.from({ length: steps }, (_, i) => {
    const material = track(glassMaterial(transmissive));
    const mesh = new Mesh(shapes[STEP_SHAPES[i % STEP_SHAPES.length]], material);
    const a = angleOf(i);
    mesh.position.set(Math.cos(a) * R, Math.sin(a) * R, 0);
    ringGroup.add(mesh);
    return { mesh, material, kind: STEP_SHAPES[i % STEP_SHAPES.length], angle: a, emphasis: 0 };
  });
  const halo = new Mesh(track(new TorusGeometry(1, 0.03, 12, 96)), track(new MeshBasicMaterial({ color: LIME, transparent: true, opacity: 0, depthWrite: false })));
  root.add(halo);

  const traveler = new Mesh(track(new SphereGeometry(1, 32, 24)), track(limeCoreMaterial()));
  traveler.scale.setScalar(0.11);
  ringGroup.add(traveler);
  const glowMat = track(new PointsMaterial({ size: 0.9, map: glowTex, color: LIME, transparent: true, opacity: 0, depthWrite: false }));
  const glow = new Points(track(new BufferGeometry().setFromPoints([new Vector3()])), glowMat);
  ringGroup.add(glow);

  const state = { k: 0 };
  const intro = gsap.to(state, { k: 1, duration: 2, ease: 'power2.out', paused: true });
  const { pointer, unbind } = bindPointer(host);
  let focal = 400;
  const resize = () => {
    const { width, height } = fitRenderer(renderer, camera, container);
    // Telas estreitas: a câmera recua para o anel e os rótulos caberem inteiros.
    camera.position.set(0, 0.35, width < 480 ? 10.4 : 8.2);
    camera.lookAt(0, 0, 0);
    focal = height / (2 * Math.tan((camera.fov * Math.PI) / 360));
  };

  // Passo ativo: segue a conta lima; passar o mouse (ou focar) num item fixa o passo.
  let pinned = -1;
  let current = -1;
  let travel = -Math.PI / 2;
  const setActive = (index: number) => {
    if (index === current) return;
    current = index;
    items.forEach((item, i) => item.classList.toggle('is-active', i === index));
    stepLabels.forEach((label, i) => label.classList.toggle('is-active', i === index));
    const next = items[index]?.dataset.word || stepLabels[index]?.textContent || '';
    if (countEl) countEl.textContent = String(index + 1).padStart(2, '0');
    if (word) {
      word.textContent = next;
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
        word.animate([{ opacity: 0, transform: 'translateY(8px)', filter: 'blur(6px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }], { duration: 420, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' });
      }
    }
  };
  let loop: ReturnType<typeof runScene> | null = null;
  const pin = (i: number) => { pinned = i; setActive(i); loop?.invalidate(); };
  const unpin = () => { pinned = -1; loop?.invalidate(); };
  const handlers = items.map((item, i) => {
    const enter = () => pin(i);
    item.addEventListener('mouseenter', enter);
    item.addEventListener('focus', enter);
    item.addEventListener('mouseleave', unpin);
    item.addEventListener('blur', unpin);
    return enter;
  });

  const dummy = new Object3D();
  const world = new Vector3();
  const center = { x: 0, y: 0, z: 0 };
  const screen = { x: 0, y: 0, z: 0 };
  const glassTint = new Color();
  const LAP = 12; // segundos por volta, como antes

  const render = (time: number, delta: number, reduced: boolean) => {
    if (reduced) { state.k = 1; intro.pause(); }
    else if (!intro.isActive() && state.k < 1) intro.play();
    const k = state.k, dt = delta || 0.016;
    pointer.x = smooth(pointer.x, pointer.tx, dt);
    pointer.y = smooth(pointer.y, pointer.ty, dt);
    root.rotation.y = pointer.x * 0.2;
    root.rotation.x = -pointer.y * 0.1;
    key.position.set(-3 + pointer.x * 3, 4 - pointer.y * 2, 6);

    // A conta lima percorre o anel; fixada, ela desliza até o passo escolhido.
    if (pinned >= 0) {
      let target = angleOf(pinned);
      while (target - travel > Math.PI) target -= Math.PI * 2;
      while (travel - target > Math.PI) target += Math.PI * 2;
      travel = reduced ? target : smooth(travel, target, dt, 6);
    } else if (!reduced && k >= 1) {
      travel += (dt / LAP) * Math.PI * 2;
    } else if (reduced) {
      travel = angleOf(Math.max(0, current));
    }
    traveler.position.set(Math.cos(travel) * R, Math.sin(travel) * R, 0);
    glow.position.copy(traveler.position);
    traveler.scale.setScalar(0.11 * Math.max(0.001, easeOut((k - 0.5) / 0.4)));
    glowMat.opacity = clamp01((k - 0.5) / 0.4) * 0.6;
    if (pinned < 0) {
      const lap = (((travel + Math.PI / 2) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      setActive(Math.round((lap / (Math.PI * 2)) * steps) % steps);
    }

    // Anel e nós entram; o nó ativo cresce, escurece e ganha o halo lima.
    torus.scale.setScalar(Math.max(0.001, easeOut(k / 0.5)));
    ringGroup.updateMatrixWorld();
    nodes.forEach((node, i) => {
      node.emphasis = reduced ? (i === current ? 1 : 0) : smooth(node.emphasis, i === current ? 1 : 0, dt, 6);
      const e = easeOut((k - 0.2 - i * 0.06) / 0.4);
      dummy.position.copy(node.mesh.position);
      orientShape(dummy, node.kind, (reduced ? 0 : time * 0.5) + i, node.angle + Math.PI / 2);
      node.mesh.rotation.copy(dummy.rotation);
      node.mesh.scale.setScalar(0.5 * Math.max(0.001, e) * (1 + node.emphasis * 0.4));
      const v = 0.62 - node.emphasis * 0.46;
      node.material.color.copy(srgb(gray(v), gray(v), gray(v + 0.01), glassTint));
    });
    if (current >= 0) {
      nodes[current].mesh.getWorldPosition(world);
      halo.position.copy(world).applyMatrix4(root.matrixWorld.clone().invert());
      halo.lookAt(camera.position);
      halo.scale.setScalar(0.38 * (1 + nodes[current].emphasis * 0.4));
      (halo.material as MeshBasicMaterial).opacity = nodes[current].emphasis * clamp01((k - 0.5) / 0.4);
    }

    root.updateMatrixWorld();
    camera.updateMatrixWorld();
    toScreen(world.set(0, 0, 0).applyMatrix4(ringGroup.matrixWorld), camera, container, center);
    nodes.forEach((node, i) => {
      const label = stepLabels[i];
      if (!label) return;
      node.mesh.getWorldPosition(world);
      toScreen(world, camera, container, screen);
      // Rótulo afastado do centro do anel, na direção do nó, além do halo.
      const dx = screen.x - center.x, dy = screen.y - center.y;
      const len = Math.hypot(dx, dy) || 1;
      const depth = Math.max(0.5, camera.position.distanceTo(world));
      const nodePx = (focal * 0.5 * (1 + node.emphasis * 0.4)) / depth;
      const offset = 20 + nodePx * 1.15;
      label.style.transform = `translate(${(screen.x + (dx / len) * offset).toFixed(1)}px, ${(screen.y + (dy / len) * offset).toFixed(1)}px)`;
      label.style.opacity = easeOut((k - 0.4 - i * 0.05) / 0.3).toFixed(3);
    });

    renderer.render(scene, camera);
  };

  resize();
  renderer.compile(scene, camera);
  setActive(0);
  const stop = runScene({ container, resize, render, fps: isCoarse ? 30 : 60 });
  loop = stop;
  const offTheme = watchTheme(scene, stop);
  container.dataset.state = 'ready';
  return () => {
    stop(); offTheme(); intro.kill(); unbind();
    items.forEach((item, i) => {
      item.removeEventListener('mouseenter', handlers[i]);
      item.removeEventListener('focus', handlers[i]);
      item.removeEventListener('mouseleave', unpin);
      item.removeEventListener('blur', unpin);
    });
    stepLabels.forEach((el) => { el.style.transform = ''; el.style.opacity = ''; });
    disposeAll(); renderer.dispose();
  };
}

/* ══════════════ PILHA · as quatro camadas entregues (Sobre) ══════════════ */
/** Formas típicas de cada pilar (mesmo vocabulário e proporções da Home). */
const STACK_MIX = [
  [SHAPE.DATA, SHAPE.DATA, SHAPE.PROCESS, SHAPE.DECISION],
  [SHAPE.PROCESS, SHAPE.ROUTINE, SHAPE.TASK, SHAPE.DECISION],
  [SHAPE.TASK, SHAPE.DATA, SHAPE.ROUTINE, SHAPE.PROCESS],
  [SHAPE.EXECUTION, SHAPE.EXECUTION, SHAPE.ROUTINE, SHAPE.TASK],
];

function initStack({ canvas, container, section }: GlassOptions): Dispose | undefined {
  const stage = createStage(canvas, container, 30);
  if (!stage) return undefined;
  const { renderer, scene, camera, root, track, disposeAll, isCoarse, transmissive, key } = stage;
  const shapes = createShapeGeometries(track);
  const glowTex = track(makeGlowTexture());
  const labels = [...container.querySelectorAll<HTMLElement>('[data-g-stack]')];

  const PLATE_W = 3.3, PLATE_D = 2.2, PLATE_H = 0.12, GAP = 0.82;
  const layers = STACK_MIX.length;
  const plateY = (i: number) => (i - (layers - 1) / 2) * GAP - 0.35;
  const CORE_Y = plateY(layers - 1) + 1.15;

  // Placas: vidro fino e neutro; a de cima (agentes) leva um toque lima.
  const plateGeo = track(new RoundedBoxGeometry(PLATE_W, PLATE_H, PLATE_D, 4, 0.06));
  const plates = Array.from({ length: layers }, (_, i) => {
    const top = i === layers - 1;
    const material = track(new MeshPhysicalMaterial(transmissive
      ? { color: top ? 0xeefbe2 : 0xf7f7f8, roughness: 0.02, metalness: 0, transmission: 1, thickness: 0.25, ior: 1.2, attenuationColor: top ? 0xb7ef85 : 0xd4d4d8, attenuationDistance: 1.2, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 1.5, iridescence: 0.3, iridescenceIOR: 1.25, specularIntensity: 1 }
      : { color: top ? 0xeefbe2 : 0xf1f1f3, roughness: 0.08, clearcoat: 1, envMapIntensity: 1.4, transparent: true, opacity: 0.8 }));
    if (!transmissive) themed(material, top ? 0xeefbe2 : 0xf1f1f3, top ? 0x18221a : 0x1c1c20);
    const mesh = new Mesh(plateGeo, material);
    root.add(mesh);
    return mesh;
  });
  const edgeMats = plates.map((_, i) => track(new LineBasicMaterial({ color: 0xffffff })));
  const edgePts: Vector3[] = [];
  const hw = PLATE_W / 2, hd = PLATE_D / 2;
  [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]].forEach(([x, z]) => edgePts.push(new Vector3(x, PLATE_H / 2 + 0.002, z)));
  const edges = plates.map((_, i) => {
    const loop = new LineLoop(track(new BufferGeometry().setFromPoints(edgePts)), edgeMats[i]);
    root.add(loop);
    return loop;
  });

  // O trabalho de cada camada: formas escuras assentadas sobre a placa.
  const cols = isCoarse ? 4 : 5, rows = 3;
  const kindCount = shapes.map(() => 0);
  const objects: { kind: number; slot: number; layer: number; x: number; z: number; phase: number }[] = [];
  for (let l = 0; l < layers; l++) for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const mix = STACK_MIX[l];
    const kind = mix[(c + r * 2) % mix.length];
    objects.push({ kind, slot: kindCount[kind]++, layer: l, x: (c - (cols - 1) / 2) * ((PLATE_W - 0.9) / (cols - 1)), z: (r - 1) * 0.62, phase: c * 0.4 + r * 0.7 + l });
  }
  const objectMat = track(obsidianMaterial(0x3f3f46));
  const objectMeshes = shapes.map((geo, kind) => {
    const mesh = new InstancedMesh(geo, objectMat, Math.max(1, kindCount[kind]));
    mesh.count = kindCount[kind];
    mesh.instanceMatrix.setUsage(DynamicDrawUsage);
    mesh.frustumCulled = false;
    root.add(mesh);
    return mesh;
  });

  // Colunas que atravessam a pilha até o núcleo; os pulsos sobem por elas.
  const posts = [[-hw + 0.25, -hd + 0.25], [hw - 0.25, -hd + 0.25], [hw - 0.25, hd - 0.25], [-hw + 0.25, hd - 0.25]];
  const postPts: Vector3[] = [];
  posts.forEach(([x, z]) => {
    postPts.push(new Vector3(x, plateY(0), z), new Vector3(x, plateY(layers - 1), z));
    postPts.push(new Vector3(x, plateY(layers - 1), z), new Vector3(0, CORE_Y, 0));
  });
  const postMat = track(new LineBasicMaterial({ color: 0xffffff }));
  root.add(new LineSegments(track(new BufferGeometry().setFromPoints(postPts)), postMat));

  // Núcleo lima com órbitas, como na Home.
  const sphereGeo = track(new SphereGeometry(1, 48, 32));
  const core = new Mesh(sphereGeo, track(limeCoreMaterial()));
  core.position.set(0, CORE_Y, 0);
  root.add(core);
  const ORB = [
    { r: 0.42, tube: 0.011, tilt: [1.15, 0.25, 0], precess: 0.3, tone: 'ink' as const },
    { r: 0.52, tube: 0.008, tilt: [0.4, 1.1, 0.4], precess: -0.22, tone: 'graphite' as const },
    { r: 0.62, tube: 0.007, tilt: [1.5, -0.6, 0.2], precess: 0.16, tone: 'lime' as const },
  ];
  const orbMats = { ink: track(inkRingMaterial()), graphite: track(obsidianMaterial(0x71717a)), lime: track(limeCoreMaterial()) };
  const orbits = ORB.map((spec) => {
    const pivot = new Group();
    pivot.position.copy(core.position);
    pivot.add(new Mesh(track(new TorusGeometry(spec.r, spec.tube, 12, 140)), orbMats[spec.tone]));
    root.add(pivot);
    return { pivot, spec };
  });
  const glowMat = track(new PointsMaterial({ size: 2.2, map: glowTex, color: LIME, transparent: true, opacity: 0, depthWrite: false }));
  const glow = new Points(track(new BufferGeometry().setFromPoints([new Vector3()])), glowMat);
  glow.position.copy(core.position);
  root.add(glow);

  const pulseGeo = track(new SphereGeometry(0.055, 16, 12));
  const pulseMat = track(new MeshBasicMaterial({ color: LIME }));
  const pulses = posts.flatMap((_, i) => [0, 0.5].map((offset) => ({ post: i, t: (i * 0.23 + offset) % 1, mesh: new Mesh(pulseGeo, pulseMat) })));
  pulses.forEach((p) => root.add(p.mesh));

  const state = { k: 0 };
  const intro = gsap.to(state, { k: 1, duration: 2.6, ease: 'power2.out', delay: 0.15, paused: true });
  const { pointer, unbind } = bindPointer(section || container);
  let wide = true;
  const resize = () => {
    const { width } = fitRenderer(renderer, camera, container);
    wide = width > 960;
    camera.position.set(0, 3.2, wide ? 10.8 : 9.4);
    camera.lookAt(0, 0.4, 0);
    const half = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
    // A pilha fica à direita e um pouco abaixo do centro: o núcleo não encosta no menu.
    root.position.set(wide ? 0.44 * half * camera.aspect : 0, wide ? -0.35 : -0.1, 0);
  };

  const dummy = new Object3D();
  const tmp = new Vector3();
  const screen = { x: 0, y: 0, z: 0 };
  const render = (time: number, delta: number, reduced: boolean) => {
    if (reduced) { state.k = 1; intro.pause(); }
    else if (!intro.isActive() && state.k < 1) intro.play();
    const k = state.k, dt = delta || 0.016;
    pointer.x = smooth(pointer.x, pointer.tx, dt);
    pointer.y = smooth(pointer.y, pointer.ty, dt);
    root.rotation.y = -0.62 + (reduced ? 0 : Math.sin(time * 0.2) * 0.14) + pointer.x * 0.22;
    root.rotation.x = -pointer.y * 0.06;
    key.position.set(-3 + pointer.x * 3, 4 - pointer.y * 2, 6);

    // Entrada: cada camada sobe para o seu lugar, de baixo para cima; o trabalho pousa sobre ela.
    const layerIn = plates.map((_, i) => easeOut((k - i * 0.1) / 0.45));
    plates.forEach((plate, i) => {
      const e = layerIn[i];
      const float = reduced ? 0 : Math.sin(time * 0.8 + i * 0.9) * 0.025;
      plate.position.set(0, plateY(i) - (1 - e) * 0.9 + float, 0);
      plate.scale.setScalar(Math.max(0.001, 0.85 + 0.15 * e));
      edges[i].position.copy(plate.position);
      edges[i].scale.copy(plate.scale);
      const shade = lineGray(toWhite(i === layers - 1 ? 0.55 : 0.62, e));
      if (i === layers - 1) edgeMats[i].color.setRGB(towardPaper(0.54, 1 - e, true), towardPaper(0.95, 1 - e, true), towardPaper(0.2, 1 - e, true));
      else edgeMats[i].color.setRGB(shade, shade, shade);
    });
    objects.forEach((o) => {
      const plate = plates[o.layer];
      const e = easeOut((layerIn[o.layer] - 0.35) / 0.65);
      dummy.position.set(o.x, plate.position.y + PLATE_H / 2 + 0.15, o.z);
      orientShape(dummy, o.kind, (reduced ? 0 : time * 0.55) + o.phase, 0);
      dummy.scale.setScalar(0.26 * Math.max(0.001, e));
      dummy.updateMatrix();
      objectMeshes[o.kind].setMatrixAt(o.slot, dummy.matrix);
    });
    objectMeshes.forEach((mesh) => { mesh.instanceMatrix.needsUpdate = true; });

    const postShade = lineGray(toWhite(0.7, (k - 0.35) / 0.4));
    postMat.color.setRGB(postShade, postShade, postShade);
    const coreIn = easeOut((k - 0.45) / 0.35);
    core.scale.setScalar(0.3 * Math.max(0.001, coreIn) * (1 + (reduced ? 0 : Math.sin(time * 1.5) * 0.04)));
    glowMat.opacity = coreIn * 0.5;
    orbits.forEach(({ pivot, spec }, i) => {
      pivot.scale.setScalar(Math.max(0.001, easeOut((k - 0.5 - i * 0.06) / 0.3)));
      pivot.rotation.set(
        spec.tilt[0] + (reduced ? 0 : Math.sin(time * 0.5 + i) * 0.14),
        spec.tilt[1] + (reduced ? 0 : time * spec.precess),
        spec.tilt[2],
      );
    });

    // Pulsos: sobem pelas colunas, atravessam as camadas e chegam ao núcleo.
    const pulseIn = reduced ? 0 : clamp01((k - 0.8) / 0.2);
    pulses.forEach((p) => {
      if (!reduced) p.t = (p.t + dt / 3.2) % 1;
      const [x, z] = posts[p.post];
      const low = plateY(0), high = plateY(layers - 1);
      if (p.t < 0.7) tmp.set(x, low + (high - low) * easeInOut(p.t / 0.7), z);
      else { const u = easeInOut((p.t - 0.7) / 0.3); tmp.set(x * (1 - u), high + (CORE_Y - high) * u, z * (1 - u)); }
      p.mesh.position.copy(tmp);
      p.mesh.scale.setScalar(Math.max(0.001, pulseIn));
    });

    // Rótulos à direita de cada camada.
    root.updateMatrixWorld();
    camera.updateMatrixWorld();
    labels.forEach((label, i) => {
      const plate = plates[i];
      if (!plate) return;
      tmp.set(hw + 0.12, plate.position.y, hd - 0.1).applyMatrix4(root.matrixWorld);
      toScreen(tmp, camera, container, screen);
      label.style.transform = `translate(${screen.x.toFixed(1)}px, ${screen.y.toFixed(1)}px)`;
      label.style.opacity = easeOut((layerIn[i] - 0.5) / 0.5).toFixed(3);
    });

    renderer.render(scene, camera);
  };

  resize();
  renderer.compile(scene, camera);
  const stop = runScene({ container, resize, render, fps: isCoarse ? 30 : 60 });
  const offTheme = watchTheme(scene, stop);
  container.dataset.state = 'ready';
  return () => {
    stop(); offTheme(); intro.kill(); unbind();
    labels.forEach((el) => { el.style.transform = ''; el.style.opacity = ''; });
    objectMeshes.forEach((mesh) => mesh.dispose());
    disposeAll(); renderer.dispose();
  };
}

/* ══════════════ ÓRBITA · o núcleo e as seis formas (Contato) ══════════════ */
function initOrbit({ canvas, container, section }: GlassOptions): Dispose | undefined {
  const stage = createStage(canvas, container, 30);
  if (!stage) return undefined;
  const { renderer, scene, camera, root, track, disposeAll, isCoarse, transmissive, key } = stage;
  const shapes = createShapeGeometries(track);
  const glowTex = track(makeGlowTexture());

  const core = new Mesh(track(new SphereGeometry(1, 48, 32)), track(limeCoreMaterial()));
  root.add(core);
  const glowMat = track(new PointsMaterial({ size: 3.2, map: glowTex, color: LIME, transparent: true, opacity: 0, depthWrite: false }));
  root.add(new Points(track(new BufferGeometry().setFromPoints([new Vector3()])), glowMat));

  // Órbitas com raio, inclinação e material próprios; o plano de cada uma precessa no seu ritmo.
  const ORB = [
    { r: 0.78, tube: 0.012, tilt: [1.15, 0.25, 0], precess: 0.3, wobble: 0.14, tone: 'ink' as const },
    { r: 0.96, tube: 0.008, tilt: [0.35, 1.2, 0.4], precess: -0.22, wobble: 0.18, tone: 'graphite' as const },
    { r: 1.14, tube: 0.007, tilt: [1.55, -0.6, 0.2], precess: 0.17, wobble: 0.12, tone: 'lime' as const },
    { r: 1.32, tube: 0.01, tilt: [0.75, 0.3, -0.9], precess: -0.13, wobble: 0.16, tone: 'ink' as const },
  ];
  const mats = { ink: track(inkRingMaterial()), graphite: track(obsidianMaterial(0x71717a)), lime: track(limeCoreMaterial()) };
  const glass = track(glassMaterial(transmissive));
  const orbits = ORB.map((spec, i) => {
    const pivot = new Group();
    pivot.add(new Mesh(track(new TorusGeometry(spec.r, spec.tube, 12, 160)), mats[spec.tone]));
    root.add(pivot);
    return { pivot, spec, phase: i * 1.7 };
  });

  // As seis formas do vocabulário como satélites, distribuídas pelas órbitas.
  const satellites = shapes.map((geo, kind) => {
    const mesh = new Mesh(geo, glass);
    const orbit = orbits[kind % orbits.length];
    orbit.pivot.add(mesh);
    return { mesh, kind, orbit, angle: (kind / shapes.length) * Math.PI * 2, speed: (kind % 2 ? -1 : 1) * (0.35 + (kind % 3) * 0.12) };
  });

  const state = { k: 0 };
  const intro = gsap.to(state, { k: 1, duration: 2.2, ease: 'power2.out', delay: 0.2, paused: true });
  const { pointer, unbind } = bindPointer(section || container);
  const resize = () => {
    fitRenderer(renderer, camera, container);
    camera.position.set(0, 0, 7.2);
    camera.lookAt(0, 0, 0);
  };

  const render = (time: number, delta: number, reduced: boolean) => {
    if (reduced) { state.k = 1; intro.pause(); }
    else if (!intro.isActive() && state.k < 1) intro.play();
    const k = state.k, dt = delta || 0.016;
    pointer.x = smooth(pointer.x, pointer.tx, dt);
    pointer.y = smooth(pointer.y, pointer.ty, dt);
    root.rotation.y = pointer.x * 0.35;
    root.rotation.x = -pointer.y * 0.25;
    key.position.set(-3 + pointer.x * 3, 4 - pointer.y * 2.5, 6);

    const coreIn = easeOut(k / 0.35);
    core.scale.setScalar(0.42 * Math.max(0.001, coreIn) * (1 + (reduced ? 0 : Math.sin(time * 1.5) * 0.035)));
    glowMat.opacity = coreIn * 0.5;
    orbits.forEach(({ pivot, spec, phase }, i) => {
      pivot.scale.setScalar(Math.max(0.001, easeOut((k - 0.1 - i * 0.08) / 0.35)));
      pivot.rotation.set(
        spec.tilt[0] + (reduced ? 0 : Math.sin(time * 0.5 + phase) * spec.wobble),
        spec.tilt[1] + (reduced ? 0 : time * spec.precess),
        spec.tilt[2] + (reduced ? 0 : Math.cos(time * 0.37 + phase) * spec.wobble * 0.6),
      );
    });
    satellites.forEach((sat) => {
      const a = sat.angle + (reduced ? 0 : time * sat.speed);
      sat.mesh.position.set(Math.cos(a) * sat.orbit.spec.r, Math.sin(a) * sat.orbit.spec.r, 0);
      orientShape(sat.mesh, sat.kind, (reduced ? 0 : time * 0.8) + sat.angle, a);
      sat.mesh.scale.setScalar(0.22 * Math.max(0.001, easeOut((k - 0.45 - sat.kind * 0.05) / 0.35)));
    });

    renderer.render(scene, camera);
  };

  resize();
  renderer.compile(scene, camera);
  const stop = runScene({ container, resize, render, fps: isCoarse ? 30 : 60 });
  const offTheme = watchTheme(scene, stop);
  container.dataset.state = 'ready';
  return () => { stop(); offTheme(); intro.kill(); unbind(); disposeAll(); renderer.dispose(); };
}

export function initGlassScene(variant: GlassVariant, options: GlassOptions): Dispose | undefined {
  if (variant === 'thesis') return initThesis(options);
  if (variant === 'layer') return initLayer(options);
  if (variant === 'stack') return initStack(options);
  if (variant === 'orbit') return initOrbit(options);
  return initCycle(options);
}
