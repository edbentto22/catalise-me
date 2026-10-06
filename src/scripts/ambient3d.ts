import * as THREE from 'three';

/**
 * Cenas 3D ambientes e sutis para as páginas internas.
 *
 * - "converge" (Manifesto): pontos espalhados que se organizam em uma rede conectada.
 *   Traduz a tese: a inteligência da empresa está espalhada → a Catalise conecta.
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
  const points: THREE.Vector3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    points.push(new THREE.Vector3(Math.cos(theta) * r * radius, y * radius, Math.sin(theta) * r * radius));
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

  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isCoarse = matchMedia('(pointer: coarse)').matches;

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !isCoarse, powerPreference: 'low-power' });
  } catch {
    container.dataset.state = 'off';
    return undefined;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isCoarse ? 1.5 : 2));
  renderer.setSize(container.clientWidth, container.clientHeight, false);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, container.clientWidth / Math.max(container.clientHeight, 1), 0.1, 100);
  camera.position.set(0, 0, 9);

  const root = new THREE.Group();
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
    const origins = targets.map(() => new THREE.Vector3((rand() - 0.5) * 13, (rand() - 0.5) * 8, (rand() - 0.5) * 6));
    const drift = targets.map(() => ({ phase: rand() * Math.PI * 2, speed: 0.25 + rand() * 0.5 }));
    const current = new Float32Array(count * 3);

    const pointGeo = track(new THREE.BufferGeometry());
    pointGeo.setAttribute('position', new THREE.BufferAttribute(current, 3));
    const pointMat = track(new THREE.PointsMaterial({ color: INK, size: isCoarse ? 0.05 : 0.042, transparent: true, opacity: 0.32, sizeAttenuation: true }));
    root.add(new THREE.Points(pointGeo, pointMat));

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
    const lineGeo = track(new THREE.BufferGeometry());
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    const lineMat = track(new THREE.LineBasicMaterial({ color: GRAPHITE, transparent: true, opacity: 0 }));
    root.add(new THREE.LineSegments(lineGeo, lineMat));

    // Poucos nós em lima: a "camada" que liga o restante.
    const accentIdx = [3, 41, 77, 102, 140].filter((i) => i < count);
    const accentGeo = track(new THREE.BufferGeometry());
    const accentPositions = new Float32Array(accentIdx.length * 3);
    accentGeo.setAttribute('position', new THREE.BufferAttribute(accentPositions, 3));
    const accentMat = track(new THREE.PointsMaterial({ color: LIME, size: 0.11, transparent: true, opacity: 0.9 }));
    root.add(new THREE.Points(accentGeo, accentMat));

    const halo = new THREE.Mesh(
      track(new THREE.TorusGeometry(2.85, 0.004, 8, 160)),
      track(new THREE.MeshBasicMaterial({ color: INK, transparent: true, opacity: 0 })),
    );
    halo.rotation.x = Math.PI / 2.3;
    root.add(halo);

    const tmp = new THREE.Vector3();
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

      (halo.material as THREE.MeshBasicMaterial).opacity = Math.max(0, k - 0.7) * 0.5;
      halo.rotation.z = time * 0.05;
      root.rotation.y = time * 0.06 + pointer.x * 0.35;
      root.rotation.x = -pointer.y * 0.22;
    };
  } else {
    const layers = 4;
    const cols = isCoarse ? 9 : 12;
    const spacing = 0.42;
    const gap = 1.05;
    const layerGroups: THREE.Group[] = [];
    const nodes: THREE.Vector3[][] = [];

    for (let l = 0; l < layers; l++) {
      const group = new THREE.Group();
      group.position.y = (l - (layers - 1) / 2) * gap;
      const pts: number[] = [];
      const layerNodes: THREE.Vector3[] = [];
      for (let x = 0; x < cols; x++) {
        for (let z = 0; z < cols; z++) {
          const px = (x - (cols - 1) / 2) * spacing;
          const pz = (z - (cols - 1) / 2) * spacing;
          pts.push(px, 0, pz);
          layerNodes.push(new THREE.Vector3(px, group.position.y, pz));
        }
      }
      const geo = track(new THREE.BufferGeometry());
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
      const mat = track(new THREE.PointsMaterial({ color: INK, size: 0.034, transparent: true, opacity: 0.16 + l * 0.05 }));
      group.add(new THREE.Points(geo, mat));

      const half = ((cols - 1) / 2) * spacing + 0.2;
      const frame = new THREE.LineLoop(
        track(new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-half, 0, -half), new THREE.Vector3(half, 0, -half),
          new THREE.Vector3(half, 0, half), new THREE.Vector3(-half, 0, half),
        ])),
        track(new THREE.LineBasicMaterial({ color: l === 1 ? LIME : GRAPHITE, transparent: true, opacity: l === 1 ? 0.55 : 0.28 })),
      );
      group.add(frame);
      root.add(group);
      layerGroups.push(group);
      nodes.push(layerNodes);
    }

    // Conexões verticais entre camadas adjacentes
    const links: [THREE.Vector3, THREE.Vector3][] = [];
    for (let l = 0; l < layers - 1; l++) {
      for (let n = 0; n < 9; n++) {
        const idx = Math.floor(rand() * cols * cols);
        const jdx = Math.min(cols * cols - 1, Math.max(0, idx + Math.round((rand() - 0.5) * 4)));
        links.push([nodes[l][idx], nodes[l + 1][jdx]]);
      }
    }
    const linkPts: number[] = [];
    links.forEach(([a, b]) => linkPts.push(a.x, a.y, a.z, b.x, b.y, b.z));
    const linkGeo = track(new THREE.BufferGeometry());
    linkGeo.setAttribute('position', new THREE.Float32BufferAttribute(linkPts, 3));
    const linkMat = track(new THREE.LineBasicMaterial({ color: GRAPHITE, transparent: true, opacity: 0.3 }));
    root.add(new THREE.LineSegments(linkGeo, linkMat));

    // Pulsos: a empresa sendo entendida pela IA (sobe) e a IA trabalhando dentro dela (desce)
    const pulseCount = isCoarse ? 8 : 14;
    const pulsePositions = new Float32Array(pulseCount * 3);
    const pulseGeo = track(new THREE.BufferGeometry());
    pulseGeo.setAttribute('position', new THREE.BufferAttribute(pulsePositions, 3));
    const pulseMat = track(new THREE.PointsMaterial({ color: LIME, size: 0.09, transparent: true, opacity: 0.95 }));
    root.add(new THREE.Points(pulseGeo, pulseMat));
    const pulses = Array.from({ length: pulseCount }, (_, i) => ({
      link: Math.floor(rand() * links.length),
      offset: rand(),
      speed: 0.18 + rand() * 0.22,
      up: i % 2 === 0,
    }));

    root.rotation.set(0.42, -0.65, 0);
    const tmp = new THREE.Vector3();
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
  const resizeObserver = new ResizeObserver(onResize);
  resizeObserver.observe(container);

  // ── Loop: só renderiza quando visível; reduced motion recebe um quadro estático ──
  let raf = 0;
  let visible = true;
  let elapsed = 0;
  let last = performance.now();

  const frame = (now = performance.now()) => {
    raf = requestAnimationFrame(frame);
    elapsed += Math.min(0.05, (now - last) / 1000);
    last = now;
    pointer.x += (pointer.tx - pointer.x) * 0.04;
    pointer.y += (pointer.ty - pointer.y) * 0.04;
    update(elapsed, Math.min(1, elapsed / 4.6));
    renderer.render(scene, camera);
  };

  if (prefersReduced) {
    scrollProgress = 1;
    update(0, 1);
    renderer.render(scene, camera);
  } else {
    frame();
  }
  container.dataset.state = 'ready';

  const io = new IntersectionObserver(([entry]) => {
    if (prefersReduced) return;
    if (entry.isIntersecting && !visible) { visible = true; last = performance.now(); frame(); }
    else if (!entry.isIntersecting && visible) { visible = false; cancelAnimationFrame(raf); }
  });
  io.observe(container);

  return () => {
    cancelAnimationFrame(raf);
    io.disconnect();
    resizeObserver.disconnect();
    removeEventListener('pointermove', onPointer);
    removeEventListener('scroll', onScroll);
    disposables.forEach((item) => item.dispose());
    renderer.dispose();
  };
}
