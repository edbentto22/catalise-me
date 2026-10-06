import {
  BufferAttribute,
  BufferGeometry,
  Float32BufferAttribute,
  Group,
  LineBasicMaterial,
  LineLoop,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  TorusGeometry,
  Vector3,
  WebGLRenderer,
} from 'three';
import { runScene } from './sceneLifecycle';

/**
 * Cenas 3D ambientes e sutis para as páginas internas.
 *
 * - "converge" (Manifesto): pontos espalhados que se organizam em uma rede conectada.
 *   Traduz a tese: a inteligência da empresa está espalhada → a Catalise.me conecta.
 * - "strata" (Sobre): quatro camadas de pontos (conhecimento, processos, sistemas, agentes)
 *   atravessadas por conexões verticais e pulsos que sobem e descem entre elas.
 */
export type Ambient3DVariant = 'converge' | 'strata';

export interface Ambient3DOptions {
  canvas: HTMLCanvasElement;
  container: HTMLElement;
  variant: Ambient3DVariant;
}

const LIME = 0x8af334;
const INK = 0x18181b;
const GRAPHITE = 0xa1a1aa;

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Distribui N pontos uniformemente em uma esfera (espiral de Fibonacci). */
function fibonacciSphere(count: number, radius: number) {
  const points: Vector3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    points.push(new Vector3(Math.cos(theta) * r * radius, y * radius, Math.sin(theta) * r * radius));
  }
  return points;
}

/** Gerador pseudoaleatório determinístico: a cena é sempre igual entre visitas. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function initAmbient3D({ canvas, container, variant }: Ambient3DOptions): (() => void) | undefined {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (connection?.saveData) {
    container.dataset.state = 'off';
    return undefined;
  }

  const isCoarse = matchMedia('(pointer: coarse)').matches;

  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, alpha: true, antialias: !isCoarse, powerPreference: 'low-power' });
  } catch {
    container.dataset.state = 'off';
    return undefined;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isCoarse ? 1.5 : 2));
  renderer.setSize(container.clientWidth, container.clientHeight, false);

  const scene = new Scene();
  const camera = new PerspectiveCamera(40, container.clientWidth / Math.max(container.clientHeight, 1), 0.1, 100);
  camera.position.set(0, 0, 9);

  const root = new Group();
  scene.add(root);

  const rand = seeded(variant === 'converge' ? 7 : 19);
  const disposables: { dispose: () => void }[] = [];
  const track = <T extends { dispose: () => void }>(item: T) => {
    disposables.push(item);
    return item;
  };

  // Estado compartilhado entre variantes
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  let scrollProgress = 0;
  let update: (time: number, intro: number) => void = () => {};

  const layout = () => {
    const wide = container.clientWidth > 960;
    if (variant === 'converge') {
      root.position.set(wide ? 2.6 : 0, wide ? 0 : 0.4, 0);
      root.scale.setScalar(wide ? 1 : 0.78);
    } else {
      root.position.set(wide ? 3.1 : 0, wide ? -0.15 : 0.2, 0);
      root.scale.setScalar(wide ? 0.74 : 0.6);
    }
  };

  if (variant === 'converge') {
    const count = isCoarse ? 110 : 170;
    const targets = fibonacciSphere(count, 2.25);
    const origins = targets.map(() => new Vector3((rand() - 0.5) * 13, (rand() - 0.5) * 8, (rand() - 0.5) * 6));
    const drift = targets.map(() => ({ phase: rand() * Math.PI * 2, speed: 0.25 + rand() * 0.5 }));
    const current = new Float32Array(count * 3);

    const pointGeo = track(new BufferGeometry());
    pointGeo.setAttribute('position', new BufferAttribute(current, 3));
    const pointMat = track(new PointsMaterial({ color: INK, size: isCoarse ? 0.05 : 0.042, transparent: true, opacity: 0.32, sizeAttenuation: true }));
    root.add(new Points(pointGeo, pointMat));

    // Pares de vizinhos na esfera final: as conexões que "acendem" ao convergir.
    const pairs: [number, number][] = [];
    for (let i = 0; i < count; i++) {
      const nearest = targets
        .map((p, j) => ({ j, d: j === i ? Infinity : p.distanceToSquared(targets[i]) }))
        .sort((a, b) => a.d - b.d)
        .slice(0, 2);
      nearest.forEach(({ j }) => { if (i < j) pairs.push([i, j]); });
    }
    const linePositions = new Float32Array(pairs.length * 6);
    const lineGeo = track(new BufferGeometry());
    lineGeo.setAttribute('position', new BufferAttribute(linePositions, 3));
    const lineMat = track(new LineBasicMaterial({ color: GRAPHITE, transparent: true, opacity: 0 }));
    root.add(new LineSegments(lineGeo, lineMat));

    // Poucos nós em lima: a "camada" que liga o restante.
    const accentIdx = [3, 41, 77, 102, 140].filter((i) => i < count);
    const accentGeo = track(new BufferGeometry());
    const accentPositions = new Float32Array(accentIdx.length * 3);
    accentGeo.setAttribute('position', new BufferAttribute(accentPositions, 3));
    const accentMat = track(new PointsMaterial({ color: LIME, size: 0.11, transparent: true, opacity: 0.9 }));
    root.add(new Points(accentGeo, accentMat));

    const halo = new Mesh(
      track(new TorusGeometry(2.85, 0.004, 8, 160)),
      track(new MeshBasicMaterial({ color: INK, transparent: true, opacity: 0 })),
    );
    halo.rotation.x = Math.PI / 2.3;
    root.add(halo);

    const tmp = new Vector3();
    update = (time, intro) => {
      // Converge parcialmente na entrada; o scroll completa a organização.
      const k = easeInOut(Math.min(1, intro * 0.86 + scrollProgress * 0.6));
      for (let i = 0; i < count; i++) {
        const d = drift[i];
        const wobble = (1 - k) * 0.35;
        tmp.lerpVectors(origins[i], targets[i], k);
        current[i * 3] = tmp.x + Math.sin(time * d.speed + d.phase) * wobble;
        current[i * 3 + 1] = tmp.y + Math.cos(time * d.speed * 0.8 + d.phase) * wobble;
        current[i * 3 + 2] = tmp.z;
      }
      pointGeo.attributes.position.needsUpdate = true;

      pairs.forEach(([a, b], n) => {
        linePositions.set(current.subarray(a * 3, a * 3 + 3), n * 6);
        linePositions.set(current.subarray(b * 3, b * 3 + 3), n * 6 + 3);
      });
      lineGeo.attributes.position.needsUpdate = true;
      lineMat.opacity = Math.max(0, (k - 0.74) / 0.26) * 0.38;

      accentIdx.forEach((idx, n) => accentPositions.set(current.subarray(idx * 3, idx * 3 + 3), n * 3));
      accentGeo.attributes.position.needsUpdate = true;
      accentMat.size = 0.08 + Math.sin(time * 2) * 0.02;

      (halo.material as MeshBasicMaterial).opacity = Math.max(0, k - 0.7) * 0.5;
      halo.rotation.z = time * 0.05;
      root.rotation.y = time * 0.06 + pointer.x * 0.35;
      root.rotation.x = -pointer.y * 0.22;
    };
  } else {
    const layers = 4;
    const cols = isCoarse ? 9 : 12;
    const spacing = 0.42;
    const gap = 1.05;
    const layerGroups: Group[] = [];
    const nodes: Vector3[][] = [];

    for (let l = 0; l < layers; l++) {
      const group = new Group();
      group.position.y = (l - (layers - 1) / 2) * gap;
      const pts: number[] = [];
      const layerNodes: Vector3[] = [];
      for (let x = 0; x < cols; x++) {
        for (let z = 0; z < cols; z++) {
          const px = (x - (cols - 1) / 2) * spacing;
          const pz = (z - (cols - 1) / 2) * spacing;
          pts.push(px, 0, pz);
          layerNodes.push(new Vector3(px, group.position.y, pz));
        }
      }
      const geo = track(new BufferGeometry());
      geo.setAttribute('position', new Float32BufferAttribute(pts, 3));
      const mat = track(new PointsMaterial({ color: INK, size: 0.034, transparent: true, opacity: 0.16 + l * 0.05 }));
      group.add(new Points(geo, mat));

      const half = ((cols - 1) / 2) * spacing + 0.2;
      const frame = new LineLoop(
        track(new BufferGeometry().setFromPoints([
          new Vector3(-half, 0, -half), new Vector3(half, 0, -half),
          new Vector3(half, 0, half), new Vector3(-half, 0, half),
        ])),
        track(new LineBasicMaterial({ color: l === 1 ? LIME : GRAPHITE, transparent: true, opacity: l === 1 ? 0.55 : 0.28 })),
      );
      group.add(frame);
      root.add(group);
      layerGroups.push(group);
      nodes.push(layerNodes);
    }

    // Conexões verticais entre camadas adjacentes
    const links: [Vector3, Vector3][] = [];
    for (let l = 0; l < layers - 1; l++) {
      for (let n = 0; n < 9; n++) {
        const idx = Math.floor(rand() * cols * cols);
        const jdx = Math.min(cols * cols - 1, Math.max(0, idx + Math.round((rand() - 0.5) * 4)));
        links.push([nodes[l][idx], nodes[l + 1][jdx]]);
      }
    }
    const linkPts: number[] = [];
    links.forEach(([a, b]) => linkPts.push(a.x, a.y, a.z, b.x, b.y, b.z));
    const linkGeo = track(new BufferGeometry());
    linkGeo.setAttribute('position', new Float32BufferAttribute(linkPts, 3));
    const linkMat = track(new LineBasicMaterial({ color: GRAPHITE, transparent: true, opacity: 0.3 }));
    root.add(new LineSegments(linkGeo, linkMat));

    // Pulsos: a empresa sendo entendida pela IA (sobe) e a IA trabalhando dentro dela (desce)
    const pulseCount = isCoarse ? 8 : 14;
    const pulsePositions = new Float32Array(pulseCount * 3);
    const pulseGeo = track(new BufferGeometry());
    pulseGeo.setAttribute('position', new BufferAttribute(pulsePositions, 3));
    const pulseMat = track(new PointsMaterial({ color: LIME, size: 0.09, transparent: true, opacity: 0.95 }));
    root.add(new Points(pulseGeo, pulseMat));
    const pulses = Array.from({ length: pulseCount }, (_, i) => ({
      link: Math.floor(rand() * links.length),
      offset: rand(),
      speed: 0.18 + rand() * 0.22,
      up: i % 2 === 0,
    }));

    root.rotation.set(0.42, -0.65, 0);
    const tmp = new Vector3();
    update = (time, intro) => {
      const spread = 0.35 + easeInOut(Math.min(1, intro)) * 0.65;
      layerGroups.forEach((group, l) => {
        group.position.y = (l - (layers - 1) / 2) * gap * spread + Math.sin(time * 0.6 + l) * 0.03;
      });
      pulses.forEach((p, i) => {
        const [a, b] = links[p.link];
        let t = (time * p.speed + p.offset) % 1;
        if (!p.up) t = 1 - t;
        tmp.lerpVectors(a, b, t);
        pulsePositions[i * 3] = tmp.x;
        pulsePositions[i * 3 + 1] = tmp.y * spread;
        pulsePositions[i * 3 + 2] = tmp.z;
      });
      pulseGeo.attributes.position.needsUpdate = true;
      root.rotation.y = -0.65 + time * 0.04 + pointer.x * 0.25 + scrollProgress * 0.6;
      root.rotation.x = 0.42 - pointer.y * 0.12;
    };
  }

  layout();

  // ── Interação: ponteiro (parallax) e scroll (progresso do container) ──
  const onPointer = (event: PointerEvent) => {
    pointer.tx = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.ty = -((event.clientY / window.innerHeight) * 2 - 1);
  };
  const onScroll = () => {
    const rect = container.getBoundingClientRect();
    scrollProgress = Math.min(1, Math.max(0, -rect.top / Math.max(rect.height * 0.8, 1)));
  };
  if (!isCoarse) addEventListener('pointermove', onPointer, { passive: true });
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const onResize = () => {
    const w = container.clientWidth, h = Math.max(container.clientHeight, 1);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    layout();
  };
  const stop = runScene({ container, resize: onResize, render: (elapsed, delta, reduced) => {
    const smoothing = 1 - Math.exp(-6 * delta);
    pointer.x += (pointer.tx - pointer.x) * smoothing;
    pointer.y += (pointer.ty - pointer.y) * smoothing;
    if (reduced) {
      const progress = scrollProgress;
      scrollProgress = 1;
      pointer.x = pointer.y = 0;
      update(0, 1);
      scrollProgress = progress;
    } else {
      update(elapsed, Math.min(1, elapsed / 1.4));
    }
    renderer.render(scene, camera);
  } });
  container.dataset.state = 'ready';

  return () => {
    stop();
    removeEventListener('pointermove', onPointer);
    removeEventListener('scroll', onScroll);
    disposables.forEach((item) => item.dispose());
    renderer.dispose();
  };
}
