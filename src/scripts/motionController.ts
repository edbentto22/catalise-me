import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { animate } from 'motion';

gsap.registerPlugin(ScrollTrigger);

/**
 * Microinterações globais: cursor, botões magnéticos, títulos cinéticos, tilt e dock.
 * A coreografia específica das páginas fica em consultable.ts.
 */
export function initMotion() {
  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isCoarse = matchMedia('(pointer: coarse)').matches;
  const pointerFx = !prefersReduced && !isCoarse;

  // ── 1. Cursor (ponto + anel em difference) ──
  const cursor = document.getElementById('custom-cursor');
  const cursorLabel = document.getElementById('cursor-label');

  if (cursor && pointerFx) {
    const dot = cursor.querySelector<HTMLElement>('.cursor-dot');
    const ring = cursor.querySelector<HTMLElement>('.cursor-ring');
    const setDotX = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power2.out' });
    const setDotY = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power2.out' });
    const setRingX = gsap.quickTo(ring, 'x', { duration: 0.28, ease: 'power3.out' });
    const setRingY = gsap.quickTo(ring, 'y', { duration: 0.28, ease: 'power3.out' });

    addEventListener('mousemove', (e) => {
      setDotX(e.clientX);
      setDotY(e.clientY);
      setRingX(e.clientX);
      setRingY(e.clientY);
    }, { passive: true });

    addEventListener('mousedown', () => cursor.classList.add('is-down'));
    addEventListener('mouseup', () => cursor.classList.remove('is-down'));
    document.documentElement.addEventListener('mouseleave', () => cursor.classList.add('is-hidden'));
    document.documentElement.addEventListener('mouseenter', () => cursor.classList.remove('is-hidden'));

    const interactive = 'a, button, input, select, textarea, label, [data-cursor-text], [data-magnetic]';
    document.addEventListener('mouseover', (e) => {
      const target = (e.target as HTMLElement)?.closest<HTMLElement>(interactive);
      if (!target) return;
      const text = target.getAttribute('data-cursor-text');
      if (text && cursorLabel) {
        cursorLabel.textContent = text;
        cursor.classList.add('has-label');
        cursor.classList.remove('is-hover');
      } else {
        cursor.classList.add('is-hover');
        cursor.classList.remove('has-label');
      }
    });
    document.addEventListener('mouseout', (e) => {
      if ((e.target as HTMLElement)?.closest(interactive)) cursor.classList.remove('is-hover', 'has-label');
    });
  }

  // ── 2. Botões magnéticos (só onde marcado, para não brigar com outros transforms) ──
  if (pointerFx) {
    document.querySelectorAll<HTMLElement>('[data-magnetic], .nav-contact-btn').forEach((el) => {
      const toX = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' });
      const toY = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        toX((e.clientX - r.left - r.width / 2) * 0.28);
        toY((e.clientY - r.top - r.height / 2) * 0.32);
      });
      el.addEventListener('pointerleave', () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'expo.out', overwrite: 'auto' });
      });
    });
  }

  // ── 3. Títulos cinéticos: palavras sobem de máscaras ──
  if (!prefersReduced) {
    const splitIntoWords = (element: HTMLElement) => {
      if (element.dataset.splitDone) return;
      element.dataset.splitDone = 'true';
      const nodes = Array.from(element.childNodes);
      element.innerHTML = '';
      nodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          // Mantém os espaços originais como texto: evita o vão antes de pontuação após <em>.
          (node.textContent || '').split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) {
              element.appendChild(document.createTextNode(' '));
              return;
            }
            const wrap = document.createElement('span');
            wrap.className = 'kinetic-word-wrap';
            wrap.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:0.08em;margin-bottom:-0.08em';
            const inner = document.createElement('span');
            inner.className = 'kinetic-word-inner';
            inner.style.display = 'inline-block';
            inner.textContent = part;
            wrap.appendChild(inner);
            element.appendChild(wrap);
          });
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as HTMLElement;
          if (el.tagName === 'BR') element.appendChild(document.createElement('br'));
          else {
            splitIntoWords(el);
            element.appendChild(el);
          }
        }
      });
    };

    const heroHeading = document.querySelector<HTMLElement>('.hero-editorial-heading');
    if (heroHeading) {
      splitIntoWords(heroHeading);
      gsap.fromTo(heroHeading.querySelectorAll('.kinetic-word-inner'),
        { yPercent: 115, rotate: 2 },
        { yPercent: 0, rotate: 0, duration: 1.2, stagger: 0.05, ease: 'power4.out', delay: 0.1 });
    }

    document.querySelectorAll<HTMLElement>('.section-header h2').forEach((heading) => {
      splitIntoWords(heading);
      gsap.fromTo(heading.querySelectorAll('.kinetic-word-inner'),
        { yPercent: 110 },
        { yPercent: 0, duration: 0.95, stagger: 0.03, ease: 'power3.out', scrollTrigger: { trigger: heading, start: 'top 88%' } });
    });
  }

  // ── 4. Tilt 3D em cartões marcados ──
  if (pointerFx) {
    document.querySelectorAll<HTMLElement>('[data-tilt]').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        gsap.to(card, {
          rotateY: ((e.clientX - r.left) / r.width - 0.5) * 6,
          rotateX: -((e.clientY - r.top) / r.height - 0.5) * 6,
          transformPerspective: 950,
          duration: 0.3,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      });
      card.addEventListener('pointerleave', () => gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.6, ease: 'power3.out' }));
    });
  }

  // ── 5. Dock flutuante: aparece após o hero e some quando outro CTA de diagnóstico está à vista ──
  const dock = document.getElementById('floating-action-dock');
  if (dock) {
    let visible = false;
    let queued = false;
    const onScreen = new Set<Element>();
    const check = () => {
      queued = false;
      const end = document.querySelector<HTMLElement>('.site-footer, .cta-section');
      const endTop = end ? end.getBoundingClientRect().top : Infinity;
      const show = scrollY > 520 && endTop > innerHeight - 40 && onScreen.size === 0;
      if (show === visible) return;
      visible = show;
      dock.classList.toggle('is-visible', show);
      if (!prefersReduced) {
        animate(dock, show ? { y: [24, 0], opacity: [0, 1] } : { y: 24, opacity: 0 },
          { duration: show ? 0.45 : 0.2, ease: [0.22, 1, 0.36, 1] });
      }
    };
    const schedule = () => { if (!queued) { queued = true; requestAnimationFrame(check); } };
    const ctaObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => (entry.isIntersecting ? onScreen.add(entry.target) : onScreen.delete(entry.target)));
      schedule();
    });
    document.querySelectorAll('main [data-open-modal]').forEach((cta) => ctaObserver.observe(cta));
    addEventListener('scroll', schedule, { passive: true });
    check();
  }
}
