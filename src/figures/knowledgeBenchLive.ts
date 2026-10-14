/**
 * Vida da bancada de arquivo: um único número de progresso p (0…7) move tudo.
 * Quem manda no alvo é a página (scroll no desktop, passeio automático no celular, setas do teclado);
 * aqui o progresso segue o alvo com suavização exponencial, e cada quadro só escreve atributos.
 */
import { translateAlong } from './iso-kit.ts';
import { P, SOURCES, benchState, heldOffset, readoutOf, rodsOf, type BenchCopy, type BenchState } from './knowledgeBench.ts';

export interface BenchHandle {
  setTarget: (p: number) => void;
  tour: (on: boolean) => void;
  dispose: () => void;
}

export function mountBench(stage: HTMLElement, copy: BenchCopy): BenchHandle | null {
  const svg = stage.querySelector('svg');
  if (!svg) return null;
  const q = (name: string) => [...svg.querySelectorAll<SVGGElement>(`[data-bench="${name}"]`)];
  const byIndex = (name: string) => q(name).sort((a, b) => Number(a.dataset.i) - Number(b.dataset.i));
  const parts = {
    legs: [...q('leg-back'), ...q('leg-front'), ...q('crossbar')],
    carriage: q('carriage'),
    gripper: q('gripper'),
    trayPackets: byIndex('tray-packet'),
    drawerPackets: byIndex('drawer-packet'),
    heldPackets: byIndex('held-packet'),
    reader: q('reader'),
    rodsLow: q('rods-low')[0],
    rodsHigh: q('rods-high')[0],
  };
  const readout = stage.querySelector<HTMLElement>('[data-bench-readout]');
  const still = matchMedia('(prefers-reduced-motion: reduce)');

  let current = 0;
  let target = 0;
  let touring = false;
  let tourClock = 0;
  let visible = false;
  let frame = 0;
  let last = 0;
  let drawn = '';

  const show = (el: SVGGElement, on: boolean) => {
    if (on) el.removeAttribute('display');
    else if (el.getAttribute('display') !== 'none') el.setAttribute('display', 'none');
  };
  const move = (el: SVGGElement, by: [number, number, number]) => el.setAttribute('transform', translateAlong(P, by));

  function draw(s: BenchState) {
    parts.legs.forEach((el) => move(el, [s.bx, 0, 0]));
    parts.carriage.forEach((el) => move(el, [s.bx, s.cy, 0]));
    parts.gripper.forEach((el) => move(el, [s.bx, s.cy, s.pb]));
    parts.reader.forEach((el) => move(el, [s.rx, 0, 0]));
    for (let i = 0; i < SOURCES; i++) {
      show(parts.trayPackets[i], s.held !== i && s.inDrawer !== i && i >= s.filed);
      const inDrawer = i < s.filed || s.inDrawer === i;
      show(parts.drawerPackets[i], inDrawer);
      if (inDrawer) move(parts.drawerPackets[i], [0, 0, s.inDrawer === i ? s.drawerZ : 0]);
      show(parts.heldPackets[i], s.held === i);
      if (s.held === i) move(parts.heldPackets[i], heldOffset(s, i));
    }
    parts.rodsLow.innerHTML = rodsOf(s, 'low');
    parts.rodsHigh.innerHTML = rodsOf(s, 'high');
    const text = readoutOf(s, copy);
    if (readout && text !== drawn) {
      drawn = text;
      readout.textContent = text;
      stage.setAttribute('aria-valuetext', text);
    }
    stage.setAttribute('aria-valuenow', current.toFixed(2));
  }

  /** Passeio: arquiva tudo, segura, desfaz devagar e recomeça. */
  const tourAt = (t: number) => {
    const cycle = 26;
    const u = t % cycle;
    if (u < 18) return (u / 18) * (SOURCES + 1);
    if (u < 22) return SOURCES + 1;
    return 0;
  };

  function tick(now: number) {
    const dt = last ? Math.min((now - last) / 1000, 1 / 20) : 1 / 60;
    last = now;
    if (touring) { tourClock += dt; target = tourAt(tourClock); }
    const calm = still.matches;
    const jump = Math.abs(target - current) > 3 && touring; // a volta do passeio não refaz tudo de trás para frente
    current = calm || jump ? target : current + (target - current) * (1 - Math.exp(-dt / 0.22));
    if (Math.abs(target - current) < 0.0005) current = target;
    draw(benchState(current));
    const settled = !touring && current === target;
    frame = visible && !settled ? requestAnimationFrame(tick) : 0;
  }

  const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
  const observer = new IntersectionObserver((entries) => {
    visible = entries[entries.length - 1].isIntersecting;
    if (visible) run();
  }, { rootMargin: '160px 0px' });
  observer.observe(stage);

  const onKey = (event: KeyboardEvent) => {
    let to: number | null = null;
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') to = Math.min(SOURCES + 1, Math.floor(target + 1e-6) + 1);
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') to = Math.max(0, Math.ceil(target - 1e-6) - 1);
    if (event.key === 'Home') to = 0;
    if (event.key === 'End') to = SOURCES + 1;
    if (to === null) return;
    event.preventDefault();
    touring = false;
    target = to;
    run();
  };
  stage.addEventListener('keydown', onKey);

  draw(benchState(0));
  return {
    setTarget(p) { touring = false; target = Math.max(0, Math.min(SOURCES + 1, p)); run(); },
    tour(on) { touring = on && !still.matches; if (touring) tourClock = 0; else if (still.matches && on) target = SOURCES + 1; run(); },
    dispose() { cancelAnimationFrame(frame); observer.disconnect(); stage.removeEventListener('keydown', onKey); },
  };
}
