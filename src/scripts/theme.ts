/**
 * Tema claro/escuro do site inteiro.
 * O <head> aplica a escolha salva antes do primeiro paint; aqui ficam o botão do menu,
 * a persistência e o aviso `cx:theme` para as cenas 3D trocarem de material.
 */
export type Theme = 'light' | 'dark';

const KEY = 'cx-theme';
const THEME_COLOR: Record<Theme, string> = { light: '#ffffff', dark: '#0b0b0d' };

export const getTheme = (): Theme => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');

/** Assina as trocas de tema; devolve a função que cancela a assinatura. */
export function onThemeChange(callback: (theme: Theme) => void) {
  const handler = (event: Event) => callback((event as CustomEvent<Theme>).detail);
  addEventListener('cx:theme', handler);
  return () => removeEventListener('cx:theme', handler);
}

function syncToggles(theme: Theme) {
  document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach((button) => {
    button.setAttribute('aria-checked', String(theme === 'dark'));
  });
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme]);
  syncToggles(theme);
  try { localStorage.setItem(KEY, theme); } catch { /* sem persistência: vale só nesta página */ }
  dispatchEvent(new CustomEvent<Theme>('cx:theme', { detail: theme }));
}

/** Troca o tema com o novo modo se abrindo em círculo a partir do botão. */
function switchTheme(origin: HTMLElement) {
  const next: Theme = getTheme() === 'dark' ? 'light' : 'dark';
  const root = document.documentElement;
  const reduced = root.dataset.motion === 'reduced' || matchMedia('(prefers-reduced-motion: reduce)').matches;
  const startViewTransition = (document as Document & { startViewTransition?: (update: () => void) => ViewTransition }).startViewTransition;
  if (reduced || !startViewTransition) {
    applyTheme(next);
    return;
  }

  const rect = origin.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  root.classList.add('cx-theme-switch');
  const transition = startViewTransition.call(document, () => applyTheme(next));
  transition.ready
    .then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 760, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', pseudoElement: '::view-transition-new(root)' },
      );
    })
    .catch(() => { /* transição cancelada: o tema já foi aplicado */ });
  transition.finished.finally(() => root.classList.remove('cx-theme-switch'));
}

export function initThemeToggle() {
  syncToggles(getTheme());
  document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach((button) => {
    button.addEventListener('click', () => switchTheme(button));
  });
}
