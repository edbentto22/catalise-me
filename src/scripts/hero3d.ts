import {
  BufferGeometry, Group, LineBasicMaterial, LineSegments, Mesh, MeshBasicMaterial,
  OrthographicCamera, Scene, SphereGeometry, TorusGeometry, Vector3, WebGLRenderer,
} from 'three';
import { runScene } from './sceneLifecycle';

export interface Hero3DOptions { canvas: HTMLCanvasElement; container: HTMLElement; }

/** A connected operation: information converges at the core, then becomes an action. */
export function initHero3D({ canvas, container }: Hero3DOptions): (() => void) | undefined {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch {
    container.dataset.state = 'off';
    return;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, matchMedia('(pointer: coarse)').matches ? 1.25 : 1.5));
  const scene = new Scene();
  const camera = new OrthographicCamera(-4, 4, 1.8, -1.8, 0.1, 30);
  camera.position.set(0, 0, 10);
  const network = new Group();
  scene.add(network);
  const assets: { dispose: () => void }[] = [];
  const track = <T extends { dispose: () => void }>(asset: T) => { assets.push(asset); return asset; };
  const ink = track(new MeshBasicMaterial({ color: 0x18181b }));
  const lime = track(new MeshBasicMaterial({ color: 0x8af334 }));
  const grey = track(new LineBasicMaterial({ color: 0x9ca39a, transparent: true, opacity: 0.55 }));
  const nodeGeometry = track(new SphereGeometry(0.095, 12, 8));
  const core = new Mesh(track(new TorusGeometry(0.38, 0.045, 8, 48)), ink);
  network.add(core);
  const coreDot = new Mesh(nodeGeometry, lime);
  coreDot.scale.setScalar(1.5);
  network.add(coreDot);
  const locations = [
    new Vector3(-2.5, 0.8, -0.2), new Vector3(-2.8, -0.6, 0.25), new Vector3(-1.3, -1.1, -0.15),
    new Vector3(2.5, -0.8, 0.2), new Vector3(2.8, 0.6, -0.25), new Vector3(1.3, 1.1, 0.15),
  ];
  const linePoints = locations.flatMap(point => [point, new Vector3()]);
  const lines = new LineSegments(track(new BufferGeometry().setFromPoints(linePoints)), grey);
  network.add(lines);
  const pulses = locations.map(point => {
    const node = new Mesh(nodeGeometry, ink);
    node.position.copy(point);
    network.add(node);
    const pulse = new Mesh(nodeGeometry, lime);
    pulse.scale.setScalar(0.8);
    pulse.visible = false;
    network.add(pulse);
    return pulse;
  });
  let queryAt = -Infinity;
  const query = () => { queryAt = performance.now(); };
  document.addEventListener('cx:query', query);
  const pointer = { x: 0, y: 0 };
  const move = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    const rect = container.getBoundingClientRect();
    pointer.x = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1));
    pointer.y = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1));
  };
  const leave = () => { pointer.x = pointer.y = 0; };
  const consoleEl = container.closest<HTMLElement>('[data-query-console]');
  consoleEl?.addEventListener('pointermove', move);
  consoleEl?.addEventListener('pointerleave', leave);
  const resize = () => {
    const width = Math.max(container.clientWidth, 1), height = Math.max(container.clientHeight, 1);
    const halfWidth = 1.55 * width / height;
    camera.left = -halfWidth; camera.right = halfWidth;
    camera.top = 1.55; camera.bottom = -1.55;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  };
  resize();
  const stop = runScene({ container, resize, render: (time, delta, reduced) => {
    const smoothing = 1 - Math.exp(-8 * delta);
    if (reduced) network.rotation.set(0, 0, 0);
    else {
      network.rotation.y += (pointer.x * 0.12 - network.rotation.y) * smoothing;
      network.rotation.x += (-pointer.y * 0.08 - network.rotation.x) * smoothing;
      core.rotation.z = Math.sin(time * 0.45) * 0.16;
    }
    const progress = (performance.now() - queryAt) / 1200;
    pulses.forEach((pulse, i) => {
      pulse.visible = !reduced && progress >= 0 && progress < 1;
      const p = Math.min(1, Math.max(0, progress * 2 - (i >= 3 ? 1 : 0)));
      pulse.position.lerpVectors(i < 3 ? locations[i] : new Vector3(), i < 3 ? new Vector3() : locations[i], p);
    });
    renderer.render(scene, camera);
  } });
  container.dataset.state = 'ready';
  return () => {
    stop();
    document.removeEventListener('cx:query', query);
    consoleEl?.removeEventListener('pointermove', move);
    consoleEl?.removeEventListener('pointerleave', leave);
    assets.forEach(asset => asset.dispose());
    renderer.dispose();
  };
}
