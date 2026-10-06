/** Shared canvas lifecycle: frame budget, visibility, resize and a static reduced-motion state. */
export function runScene({ container, render, resize }: {
  container: HTMLElement;
  render: (elapsed: number, delta: number, reduced: boolean) => void;
  resize: () => void;
}) {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false;
  let raf = 0;
  let elapsed = 0;
  let last = 0;
  let disposed = false;
  const reduced = () => preference.matches || document.documentElement.dataset.motion === 'reduced';
  const stop = () => { cancelAnimationFrame(raf); raf = 0; last = 0; };
  const frame = (now: number) => {
    raf = 0;
    if (disposed || !visible || document.hidden || reduced()) return;
    // 30 fps is enough for an ambient scene, independent of display refresh rate.
    if (!last || now - last >= 1000 / 30) {
      const delta = last ? Math.min((now - last) / 1000, 0.06) : 0;
      elapsed += delta;
      last = now;
      render(elapsed, delta, false);
    }
    raf = requestAnimationFrame(frame);
  };
  const sync = () => {
    stop();
    if (disposed || !visible || document.hidden) return;
    if (reduced()) render(0, 0, true);
    else raf = requestAnimationFrame(frame);
  };
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  });
  observer.observe(container);
  const sizeObserver = new ResizeObserver(() => {
    resize();
    if (visible && !document.hidden) render(elapsed, 0, reduced());
  });
  sizeObserver.observe(container);
  document.addEventListener('visibilitychange', sync);
  preference.addEventListener('change', sync);
  return () => {
    disposed = true;
    stop();
    observer.disconnect();
    sizeObserver.disconnect();
    document.removeEventListener('visibilitychange', sync);
    preference.removeEventListener('change', sync);
  };
}
