import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { animate as motionAnimate, inView, stagger as motionStagger } from 'motion';
import { animate, createDrawable, createMotionPath, createTimeline, scrambleText, stagger } from 'animejs';

gsap.registerPlugin(ScrollTrigger);

/**
 * Coreografia "Empresas consultáveis".
 *
 * Divisão de responsabilidades entre as bibliotecas:
 * - GSAP + ScrollTrigger: tudo que é amarrado ao scroll (scrub, pin, leitura progressiva).
 * - anime.js: SVG (desenho de linhas, trajetórias de pulsos) e texto embaralhado.
 * - motion.dev: física de mola em revelações por viewport e micro-interações.
 *
 * O conteúdo é sempre visível sem JS; os estados iniciais só são aplicados aqui.
 */
export interface ConsultableFlags {
  /** Animações de entrada e scroll (falso com reduced motion ou economia de dados). */
  motion: boolean;
  /** Efeitos de ponteiro fino (hover, tilt). */
  pointer: boolean;
  /** Instância do Lenis, quando o scroll suave está ativo. */
  lenis?: { velocity: number } | null;
}

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/** Quebra o texto em palavras preservando elementos internos (em, strong, mark). */
function splitWords(el: HTMLElement, { mask = false } = {}): HTMLElement[] {
  if (el.dataset.cxSplit) return [...el.querySelectorAll<HTMLElement>('.cx-w')];
  el.dataset.cxSplit = 'true';
  const words: HTMLElement[] = [];

  const walk = (node: Node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const fragment = document.createDocumentFragment();
        (child.textContent || '').split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            fragment.appendChild(document.createTextNode(part));
            return;
          }
          const word = document.createElement('span');
          word.className = 'cx-w';
          word.textContent = part;
          words.push(word);
          if (mask) {
            const wrap = document.createElement('span');
            wrap.className = 'cx-mask';
            wrap.appendChild(word);
            fragment.appendChild(wrap);
          } else {
            fragment.appendChild(word);
          }
        });
        child.replaceWith(fragment);
      } else if (child instanceof HTMLElement && !child.matches('br, svg, [data-no-split]')) {
        walk(child);
      }
    });
  };

  walk(el);
  return words;
}

/* ──────────────────────────────────────────────────────────
   HOME · Console "Pergunte à sua empresa"
────────────────────────────────────────────────────────── */
interface Query { q: string; a: string; act: string; }

function initQueryConsole(flags: ConsultableFlags) {
  const consoleEl = document.querySelector<HTMLElement>('[data-query-console]');
  if (!consoleEl) return;
  let queries: Query[];
  try { queries = JSON.parse(consoleEl.dataset.queries || '[]'); } catch { return; }
  const question = consoleEl.querySelector<HTMLElement>('[data-query-q]');
  const answer = consoleEl.querySelector<HTMLElement>('[data-query-a]');
  const action = consoleEl.querySelector<HTMLElement>('[data-query-act]');
  const rows = [...consoleEl.querySelectorAll<HTMLElement>('[data-query-answer], [data-query-action]')];
  const counter = consoleEl.querySelector<HTMLElement>('[data-query-index]');
  const announcement = consoleEl.querySelector<HTMLElement>('[data-query-announcement]');
  const status = consoleEl.querySelector<HTMLElement>('[data-query-status]');
  const controls = consoleEl.querySelector<HTMLElement>('[data-query-controls]');
  const buttons = [...consoleEl.querySelectorAll<HTMLButtonElement>('[data-query-prev], [data-query-next]')];
  const check = consoleEl.querySelector<SVGPathElement>('[data-query-check]');
  if (!question || !answer || !action || queries.length < 2) return;
  const [drawable] = check ? createDrawable(check) : [];
  if (drawable) animate(drawable, { draw: '0 1', duration: 0 });
  if (controls) controls.hidden = false;
  let index = 0;
  let busy = false;
  const select = async (direction: number) => {
    if (busy) return;
    busy = true;
    buttons.forEach(button => { button.disabled = true; });
    const motion = flags.motion && !matchMedia('(prefers-reduced-motion: reduce)').matches;
    try {
      index = (index + direction + queries.length) % queries.length;
      const item = queries[index];
      if (motion) await motionAnimate(rows, { opacity: 0, y: 4 }, { duration: 0.12 });
      question.textContent = item.q;
      answer.textContent = item.a;
      action.textContent = item.act;
      if (counter) counter.textContent = String(index + 1).padStart(2, '0');
      if (motion) {
        if (status) status.textContent = consoleEl.dataset.busy || '';
        document.dispatchEvent(new CustomEvent('cx:query'));
        const networkPath = consoleEl.querySelector<SVGPathElement>('[data-network-link]');
        if (networkPath) {
          animate(createDrawable(networkPath), { draw: ['0 0', '0 1'], duration: 650, ease: 'outQuad' });
        }
        await motionAnimate(rows, { opacity: [0, 1], y: [6, 0] }, { duration: 0.3, delay: motionStagger(0.16), ease: EASE_OUT });
        if (drawable) await animate(drawable, { draw: ['0 0', '0 1'], duration: 220, ease: 'outQuad' });
      }
      if (status) status.textContent = consoleEl.dataset.done || '';
      if (announcement) announcement.textContent = `${item.q} ${item.a}. ${item.act}.`;
    } finally {
      // Interrupted motion must never leave the simulated answers invisible.
      rows.forEach(row => { row.style.opacity = '1'; row.style.transform = ''; });
      buttons.forEach(button => { button.disabled = false; });
      busy = false;
    }
  };
  buttons.forEach(button => button.addEventListener('click', () => {
    void select(button.hasAttribute('data-query-prev') ? -1 : 1);
  }));
}

/* ──────────────────────────────────────────────────────────
   HERO DO MANIFESTO · título em máscara, "digital" riscado, "consultável" emerge
────────────────────────────────────────────────────────── */
function initManifestoHero() {
  const hero = document.querySelector<HTMLElement>('[data-mf-hero]');
  if (!hero) return;

  const title = hero.querySelector<HTMLElement>('[data-mf-title]');
  const fades = hero.querySelectorAll<HTMLElement>('[data-cx-fade]');
  const strike = hero.querySelector<HTMLElement>('[data-strike]');
  const strikeLine = strike?.querySelector<HTMLElement>('[data-strike-line]');
  const scramble = hero.querySelector<HTMLElement>('[data-scramble]');

  const tl = gsap.timeline({ defaults: { ease: 'expo.out' }, delay: 0.1 });
  if (title) {
    const words = splitWords(title, { mask: true });
    tl.fromTo(words, { yPercent: 115, rotate: 4 }, { yPercent: 0, rotate: 0, duration: 0.65, stagger: { amount: 0.2 } }, 0);
  }
  if (fades.length) tl.fromTo(fades, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.12 }, 0.45);
  if (strike && strikeLine) {
    tl.fromTo(strikeLine, { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: 'power3.inOut' }, 1.35)
      .to(strike, { color: '#7c7c85', duration: 0.5, ease: 'power1.out' }, 1.75);
  }
  if (scramble) {
    tl.add(() => {
      animate(scramble, { opacity: [0.65, 1], duration: 350, ease: 'outQuad' });
    }, 1.9);
  }

  // Indicador de leitura (barra fina no topo)
  const bar = document.querySelector<HTMLElement>('[data-read-progress]');
  if (bar) {
    gsap.fromTo(bar, { scaleX: 0 }, {
      scaleX: 1, ease: 'none',
      scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.3 },
    });
  }
}

/* ──────────────────────────────────────────────────────────
   LEITURA PROGRESSIVA · palavras acendem conforme o scroll
────────────────────────────────────────────────────────── */
function initScrubText() {
  document.querySelectorAll<HTMLElement>('[data-scrub]').forEach((el) => {
    const words = splitWords(el);
    // Cinza → preto (não opacidade): o texto grande mantém contraste mínimo de 3:1 desde o início.
    gsap.fromTo(words, { color: '#8e8e96' }, {
      color: '#09090b', ease: 'none', stagger: 0.12,
      scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 42%', scrub: 0.5 },
    });
    const marks = el.querySelectorAll('mark');
    if (marks.length) {
      gsap.fromTo(marks, { backgroundSize: '0% 34%' }, {
        backgroundSize: '100% 34%', ease: 'none', stagger: 0.3,
        scrollTrigger: { trigger: el, start: 'top 70%', end: 'bottom 40%', scrub: 0.5 },
      });
    }
  });

  document.querySelectorAll<HTMLElement>('[data-punch]').forEach((el) => {
    const words = splitWords(el, { mask: true });
    const underline = el.querySelector<SVGPathElement>('[data-underline]');
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 80%' } });
    tl.fromTo(words, { yPercent: 110 }, { yPercent: 0, duration: 1.1, stagger: 0.06, ease: 'expo.out' });
    if (underline) {
      const [drawable] = createDrawable(underline);
      animate(drawable, { draw: '0 0', duration: 0 });
      tl.add(() => { animate(drawable, { draw: ['0 0', '0 1'], duration: 900, ease: 'inOutQuart' }); }, 0.5);
    }
  });
}

/* ──────────────────────────────────────────────────────────
   CENA "ESPALHADA" · fragmentos isolados → conectados à camada
────────────────────────────────────────────────────────── */
function initScatterScene() {
  const section = document.querySelector<HTMLElement>('[data-scatter]');
  if (!section) return;

  const stage = section.querySelector<HTMLElement>('[data-stage]');
  const frags = [...section.querySelectorAll<HTMLElement>('[data-frag]')];
  const dots = frags.map((frag) => frag.querySelector<HTMLElement>('.mf-frag-dot'));
  const steps = [...section.querySelectorAll<HTMLElement>('[data-step]')];
  const core = section.querySelector<HTMLElement>('[data-core]');
  const lines = [...section.querySelectorAll<SVGLineElement>('[data-link]')];
  const progressBar = section.querySelector<HTMLElement>('[data-scatter-progress]');
  if (!stage || frags.length === 0) return;

  const drawables = lines.flatMap((line) => createDrawable(line));
  // Linhas controladas pelo scroll: anime.js desenha, GSAP comanda o tempo.
  const linesTimeline = createTimeline({ autoplay: false, defaults: { ease: 'inOutSine' } })
    .add(drawables, { draw: ['0 0', '0 1'], duration: 600, delay: stagger(90) });

  const setStep = (active: number) => steps.forEach((step, i) => step.classList.toggle('is-active', i === active));

  const mm = gsap.matchMedia();

  mm.add('(min-width: 961px)', () => {
    const scatter = (frag: HTMLElement, axis: 'sx' | 'sy') =>
      parseFloat(frag.dataset[axis] || '0') * (axis === 'sx' ? stage.offsetWidth : stage.offsetHeight);

    const proxy = { p: 0 };
    const tl = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: '+=240%',
        pin: true,
        scrub: 0.8,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          setStep(self.progress < 0.36 ? 0 : self.progress < 0.62 ? 1 : 2);
          if (progressBar) progressBar.style.transform = `scaleX(${self.progress})`;
        },
      },
    });

    // 1 · Os fragmentos surgem espalhados
    tl.fromTo(frags,
      { x: (_i, el) => scatter(el, 'sx'), y: (_i, el) => scatter(el, 'sy'), rotate: (_i, el) => parseFloat(el.dataset.sr || '0'), opacity: 0, scale: 0.9, filter: 'blur(6px)' },
      { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1, stagger: 0.12, ease: 'power3.out' }, 0);

    // 2 · "Mas não conversa": isolamento (pontos cinza, leve tremor)
    tl.to(frags, { opacity: 0.55, duration: 0.6, stagger: 0.04 }, 1.4)
      .to(dots, { backgroundColor: '#d4d4d8', duration: 0.4 }, 1.4)
      .to(frags, { y: (_i, el) => scatter(el, 'sy') + 10, duration: 0.6, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 1.4);

    // 3 · A Catalise.me conecta: tudo converge para a camada
    tl.to(frags, { x: 0, y: 0, rotate: 0, opacity: 1, duration: 1.3, stagger: 0.05, ease: 'expo.inOut' }, 2.8)
      .fromTo(core, { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, ease: 'expo.out' }, 3.3)
      .to(dots, { backgroundColor: '#8af334', duration: 0.3, stagger: 0.05 }, 3.7)
      .fromTo(proxy, { p: 0 }, { p: 1, duration: 1.1, ease: 'none', onUpdate: () => { linesTimeline.seek(linesTimeline.duration * proxy.p); } }, 3.6)
      .to({}, { duration: 0.6 });

    return () => { linesTimeline.seek(linesTimeline.duration); };
  });

  mm.add('(max-width: 960px)', () => {
    setStep(2);
    steps.forEach((step) => step.classList.add('is-active'));
    inView(stage, () => {
      motionAnimate(frags, { opacity: [0, 1], y: [16, 0] }, { delay: motionStagger(0.08), duration: 0.7, ease: EASE_OUT });
      if (core) motionAnimate(core, { opacity: [0, 1], scale: [0.6, 1] }, { duration: 0.7, ease: EASE_OUT, delay: 0.3 });
      animate(drawables, { draw: ['0 0', '0 1'], duration: 700, delay: stagger(80, { start: 500 }), ease: 'inOutSine' });
      motionAnimate(dots.filter(Boolean) as HTMLElement[], { backgroundColor: '#8af334' }, { delay: motionStagger(0.08, { startDelay: 0.8 }) });
    }, { amount: 0.3 });
  });
}

/* ──────────────────────────────────────────────────────────
   DIAGRAMA DA CAMADA · linhas desenhadas e pulsos em duas direções
────────────────────────────────────────────────────────── */
function initLayerDiagram() {
  document.querySelectorAll<HTMLElement>('[data-layer]').forEach((diagram) => {
    const paths = [...diagram.querySelectorAll<SVGPathElement>('[data-layer-path]')];
    const nodes = [...diagram.querySelectorAll<HTMLElement>('[data-layer-node]')];
    const bar = diagram.querySelector<HTMLElement>('[data-layer-bar]');
    const upPulses = [...diagram.querySelectorAll<SVGCircleElement>('[data-pulse-up]')];
    const downPulses = [...diagram.querySelectorAll<SVGCircleElement>('[data-pulse-down]')];
    const routesUp = [...diagram.querySelectorAll<SVGPathElement>('[data-route-up]')];
    const routesDown = [...diagram.querySelectorAll<SVGPathElement>('[data-route-down]')];

    const drawables = paths.flatMap((path) => createDrawable(path));
    animate(drawables, { draw: '0 0', duration: 0 });
    nodes.forEach((node) => { node.style.opacity = '0'; });
    if (bar) bar.style.opacity = '0';
    [...upPulses, ...downPulses].forEach((pulse) => { pulse.style.opacity = '0'; });

    const loops: ReturnType<typeof animate>[] = [];
    let started = false;

    inView(diagram, () => {
      if (!started) {
        started = true;
        motionAnimate(nodes, { opacity: [0, 1], y: [14, 0] }, { delay: motionStagger(0.08), duration: 0.8, ease: EASE_OUT });
        if (bar) motionAnimate(bar, { opacity: [0, 1], scaleX: [0.6, 1] }, { duration: 1, delay: 0.35, ease: EASE_OUT });
        createTimeline({ defaults: { ease: 'inOutQuart' } })
          .add(drawables, { draw: ['0 0', '0 1'], duration: 1100, delay: stagger(110) }, 300)
          .call(() => {
            const travel = (pulse: SVGCircleElement, route: SVGPathElement | undefined, i: number, duration: number) => {
              if (!route) return;
              pulse.style.opacity = '1';
              loops.push(animate(pulse, { ...createMotionPath(route), duration, delay: i * 420, loop: true, ease: 'inOutSine' }));
            };
            upPulses.forEach((pulse, i) => travel(pulse, routesUp[i], i, 2600));
            downPulses.forEach((pulse, i) => travel(pulse, routesDown[i], i + 0.5, 3000));
          });
      } else {
        loops.forEach((loop) => loop.play());
      }
      return () => loops.forEach((loop) => loop.pause());
    }, { amount: 0.35 });
  });
}

/* ──────────────────────────────────────────────────────────
   CRENÇAS · a negação é riscada, a afirmação sobe com mola
────────────────────────────────────────────────────────── */
function initBeliefs() {
  document.querySelectorAll<HTMLElement>('[data-belief]').forEach((row) => {
    const not = row.querySelector<HTMLElement>('[data-belief-not]');
    const yes = row.querySelector<HTMLElement>('[data-belief-yes]');
    const num = row.querySelector<HTMLElement>('[data-belief-num]');
    const yesWords = yes ? splitWords(yes, { mask: true }) : [];

    gsap.set(yesWords, { yPercent: 110 });

    const tl = gsap.timeline({ paused: true });
    if (num) tl.fromTo(num, { opacity: 0, x: -12 }, { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out' }, 0);
    if (not) tl.fromTo(not, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0);
    if (not) {
      tl.add(() => { not.classList.add('is-struck'); }, 0.5)
        .to(not, { color: '#62626b', duration: 0.3 }, 0.5);
    }
    tl.to(yesWords, { yPercent: 0, duration: 1, stagger: 0.07, ease: 'expo.out' }, 0.9);

    ScrollTrigger.create({ trigger: row, start: 'top 78%', once: true, onEnter: () => tl.play() });
  });
}

/* ──────────────────────────────────────────────────────────
   CICLO · entender → decidir → executar → medir → aprender → evoluir
────────────────────────────────────────────────────────── */
function initLoop() {
  const loop = document.querySelector<HTMLElement>('[data-loop]');
  if (!loop) return;

  const ring = loop.querySelector<SVGPathElement>('[data-loop-ring]');
  const traveler = loop.querySelector<SVGCircleElement>('[data-loop-traveler]');
  const items = [...loop.querySelectorAll<HTMLElement>('[data-loop-item]')];
  const nodes = [...loop.querySelectorAll<SVGCircleElement>('[data-loop-node]')];
  const labels = [...loop.querySelectorAll<HTMLElement>('[data-loop-label]')];
  const word = loop.querySelector<HTMLElement>('[data-loop-word]');
  const count = loop.querySelector<HTMLElement>('[data-loop-count]');
  if (!ring || !traveler || items.length === 0) return;

  const [ringDrawable] = createDrawable(ring);
  animate(ringDrawable, { draw: '0 0', duration: 0 });
  traveler.style.opacity = '0';

  let current = -1;
  const activate = (index: number) => {
    if (index === current) return;
    current = index;
    items.forEach((item, i) => item.classList.toggle('is-active', i === index));
    nodes.forEach((node, i) => node.classList.toggle('is-active', i === index));
    labels.forEach((label, i) => label.classList.toggle('is-active', i === index));
    if (count) count.textContent = String(index + 1).padStart(2, '0');
    const nextWord = items[index]?.dataset.word || '';
    if (word) animate(word, { innerHTML: scrambleText({ text: nextWord, chars: 'lowercase', revealRate: 40, settleDuration: 220 }) });
  };

  let travel: ReturnType<typeof animate> | null = null;
  inView(loop, () => {
    if (!travel) {
      animate(ringDrawable, { draw: ['0 0', '0 1'], duration: 1600, ease: 'inOutQuart' });
      motionAnimate(items, { opacity: [0, 1], x: [-14, 0] }, { delay: motionStagger(0.07), duration: 0.7, ease: EASE_OUT });
      motionAnimate(labels, { opacity: [0, 1] }, { delay: motionStagger(0.1, { startDelay: 0.6 }), duration: 0.6 });
      traveler.style.opacity = '1';
      travel = animate(traveler, {
        ...createMotionPath(ring),
        duration: 12000,
        delay: 900,
        loop: true,
        ease: 'linear',
        onUpdate: (self) => activate(Math.min(items.length - 1, Math.floor(self.iterationProgress * items.length))),
      });
    } else {
      travel.play();
    }
    return () => travel?.pause();
  }, { amount: 0.4 });

  // Hover em um item fixa o ciclo naquele passo
  items.forEach((item, i) => {
    item.addEventListener('mouseenter', () => { travel?.pause(); activate(i); });
    item.addEventListener('mouseleave', () => travel?.play());
  });
}

/* ──────────────────────────────────────────────────────────
   ASSINATURA · "Catalise.me" letra a letra
────────────────────────────────────────────────────────── */
function initSignature() {
  document.querySelectorAll<HTMLElement>('[data-sign-brand]').forEach((brand) => {
    const text = brand.dataset.text || brand.textContent || '';
    brand.innerHTML = `<span class="visually-hidden">${text}</span>` + [...text].map((char) => `<span class="cx-char${char === '.' ? ' cx-char-dot' : ''}" aria-hidden="true">${char}</span>`).join('');
    const chars = brand.querySelectorAll<HTMLElement>('.cx-char');
    gsap.set(chars, { yPercent: 100, opacity: 0 });
    inView(brand, () => {
      animate(chars, { translateY: ['100%', '0%'], opacity: [0, 1], duration: 1200, delay: stagger(55), ease: 'outExpo' });
    }, { amount: 0.5 });
  });
}

/* ──────────────────────────────────────────────────────────
   GENÉRICOS · revelações em grupo e títulos de seção
────────────────────────────────────────────────────────── */
function initReveals() {
  document.querySelectorAll<HTMLElement>('[data-reveal-group]').forEach((group) => {
    const children = [...group.children] as HTMLElement[];
    children.forEach((child) => { child.style.opacity = '0'; });
    inView(group, () => {
      motionAnimate(children, { opacity: [0, 1], y: [14, 0] }, { delay: motionStagger(Math.min(0.06, 0.2 / Math.max(children.length - 1, 1))), duration: 0.5, ease: EASE_OUT });
    }, { amount: 'some' });
  });

  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    el.style.opacity = '0';
    inView(el, () => {
      motionAnimate(el, { opacity: [0, 1], y: [12, 0] }, { duration: 0.5, ease: EASE_OUT });
    }, { amount: 'some' });
  });

  document.querySelectorAll<HTMLElement>('[data-draw-on-view]').forEach((svgEl) => {
    const paths = [...svgEl.querySelectorAll<SVGGeometryElement>('[data-draw]')];
    const drawables = paths.flatMap((path) => createDrawable(path));
    animate(drawables, { draw: '0 0', duration: 0 });
    inView(svgEl, () => {
      animate(drawables, { draw: ['0 0', '0 1'], duration: 1400, delay: stagger(120), ease: 'inOutQuart' });
    }, { amount: 0.4 });
  });
}

/* Linha do "antes → depois" no Sobre: a coluna consultável acende com o scroll */
function initShift() {
  document.querySelectorAll<HTMLElement>('[data-shift]').forEach((table) => {
    const rows = [...table.querySelectorAll<HTMLElement>('[data-shift-row]')];
    rows.forEach((row) => {
      const before = row.querySelector<HTMLElement>('[data-shift-before]');
      const after = row.querySelector<HTMLElement>('[data-shift-after]');
      const arrow = row.querySelector<HTMLElement>('[data-shift-arrow]');
      const tl = gsap.timeline({ scrollTrigger: { trigger: row, start: 'top 82%', end: 'top 52%', scrub: 0.6 } });
      if (before) tl.fromTo(before, { color: '#3f3f46' }, { color: '#71717a', ease: 'none' }, 0);
      if (arrow) tl.fromTo(arrow, { x: -12, opacity: 0 }, { x: 0, opacity: 1, ease: 'none' }, 0);
      if (after) tl.fromTo(after, { color: '#71717a', x: 16 }, { color: '#09090b', x: 0, ease: 'none' }, 0.1);
    });
  });
}


/* ──────────────────────────────────────────────────────────
   TÍTULOS DE HERO (Sobre, Opera OS) · palavras sobem de máscaras
────────────────────────────────────────────────────────── */
function initHeroTitles() {
  document.querySelectorAll<HTMLElement>('[data-mf-title]').forEach((title) => {
    if (title.closest('[data-mf-hero]')) return;
    const words = splitWords(title, { mask: true });
    gsap.fromTo(words, { yPercent: 115, rotate: 3 }, { yPercent: 0, rotate: 0, duration: 0.65, stagger: { amount: 0.18 }, ease: 'expo.out', delay: 0.12 });
  });
}

/* ──────────────────────────────────────────────────────────
   OPERA OS · método com letra fixa e cronograma sincronizado
────────────────────────────────────────────────────────── */
function initMethod() {
  const section = document.querySelector<HTMLElement>('[data-method]');
  if (!section) return;
  const phases = [...section.querySelectorAll<HTMLElement>('[data-phase]')];
  const letter = section.querySelector<HTMLElement>('[data-method-letter]');
  const name = section.querySelector<HTMLElement>('[data-method-name]');
  const rows = [...section.querySelectorAll<HTMLElement>('[data-gantt-row]')];
  let current = -1;
  let letterMotion: gsap.core.Timeline | undefined;

  const activate = (index: number) => {
    if (index === current || index < 0) return;
    const direction = index > current ? 1 : -1;
    current = index;
    const phase = phases[index];
    phases.forEach((p, i) => p.classList.toggle('is-current', i === index));
    rows.forEach((row, i) => {
      row.classList.toggle('is-active', i === index);
      row.classList.toggle('is-done', i < index);
    });
    if (letter) {
      letterMotion?.kill();
      letterMotion = gsap.timeline()
        .to(letter, { yPercent: -100 * direction, opacity: 0, duration: 0.25, ease: 'power2.in' })
        .add(() => { letter.textContent = phase.dataset.letter || ''; })
        .fromTo(letter, { yPercent: 100 * direction, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, ease: 'expo.out' });
    }
    if (name) name.textContent = phase.dataset.title || '';
  };

  phases.forEach((phase, i) => {
    ScrollTrigger.create({
      trigger: phase,
      start: 'top 55%',
      end: 'bottom 55%',
      onToggle: (self) => { if (self.isActive) activate(i); },
    });
  });
  activate(0);
}

/* Tela do Opera OS: leve inclinação com o ponteiro e letras O-P-E-R-A acendendo em sequência */
function initOperaScreen(flags: ConsultableFlags) {
  const screen = document.querySelector<HTMLElement>('[data-op-screen]');
  if (!screen) return;
  const letters = [...screen.querySelectorAll<HTMLElement>('.op-screen-letters li')];
  if (letters.length) {
    ScrollTrigger.create({
      trigger: screen, start: 'top 85%', end: 'bottom 20%',
      onUpdate: ({ progress }) => {
        const index = Math.min(letters.length - 1, Math.floor(progress * letters.length));
        letters.forEach((letter, i) => letter.classList.toggle('is-active', i === index));
      },
    });
  }
  if (!flags.pointer) return;
  const tiltX = gsap.quickTo(screen, 'rotationY', { duration: 0.8, ease: 'power3.out' });
  const tiltY = gsap.quickTo(screen, 'rotationX', { duration: 0.8, ease: 'power3.out' });
  gsap.set(screen, { transformPerspective: 1600, rotationY: -6, rotationX: 2 });
  screen.addEventListener('pointermove', (event) => {
    const rect = screen.getBoundingClientRect();
    tiltX(((event.clientX - rect.left) / rect.width - 0.5) * 10 - 4);
    tiltY(-((event.clientY - rect.top) / rect.height - 0.5) * 6 + 1);
  });
  screen.addEventListener('pointerleave', () => { tiltX(-6); tiltY(2); });
}

/* ──────────────────────────────────────────────────────────
   RODAPÉ · faixa que acelera com o scroll e wordmark que sobe
────────────────────────────────────────────────────────── */
function initFooter() {
  const track = document.querySelector<HTMLElement>('[data-marquee-track]');
  if (track) {
    gsap.fromTo(track, { xPercent: 0 }, {
      xPercent: -8, ease: 'none',
      scrollTrigger: { trigger: track, start: 'top bottom', end: 'bottom top', scrub: 0.5 },
    });
  }

  const wordmark = document.querySelector<HTMLElement>('[data-footer-wordmark]');
  if (wordmark) {
    gsap.fromTo(wordmark, { yPercent: 60, scaleY: 1.25 }, {
      yPercent: 0, scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: wordmark, start: 'top bottom', end: 'bottom bottom', scrub: 0.6 },
    });
  }
}

/* Cartões com brilho que segue o ponteiro (apenas ponteiro fino) */
function initPointerGlow() {
  document.querySelectorAll<HTMLElement>('[data-glow]').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--gx', `${event.clientX - rect.left}px`);
      card.style.setProperty('--gy', `${event.clientY - rect.top}px`);
    });
  });
}

/** Devolve o controle ao navegador entre etapas (evita uma única tarefa longa no carregamento). */
const yieldToMain = () => new Promise<void>((resolve) => {
  const scheduler = (globalThis as { scheduler?: { yield?: () => Promise<void> } }).scheduler;
  if (scheduler?.yield) scheduler.yield().then(resolve);
  else setTimeout(resolve, 0);
});

export async function initConsultable(flags: ConsultableFlags) {
  const root = document.documentElement;

  // 1 · O que está acima da dobra entra primeiro, numa tarefa curta.
  initQueryConsole(flags);
  if (flags.motion) {
    initManifestoHero();
    initHeroTitles();
  }
  root.classList.remove('cx-preload');
  root.classList.add('cx-ready');

  if (flags.pointer) initPointerGlow();
  if (!flags.motion) return;

  // 2 · O restante da coreografia é montado em tarefas pequenas.
  const steps = [
    initScrubText, initScatterScene, initLayerDiagram, initBeliefs, initLoop, initSignature,
    initReveals, initShift, initMethod, () => initOperaScreen(flags), initFooter,
  ];
  for (const step of steps) {
    await yieldToMain();
    step();
  }
  ScrollTrigger.refresh();
}
