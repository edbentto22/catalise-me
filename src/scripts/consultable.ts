import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

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

/** Executa `callback` uma vez quando `el` entra na tela (fração `amount` visível). */
function whenInView(el: Element, callback: () => void, amount = 0.2) {
  const observer = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    observer.disconnect();
    callback();
  }, { threshold: amount });
  observer.observe(el);
}

/** Prepara um traço SVG para ser "desenhado": escondido pelo próprio comprimento. */
function hideStroke(path: SVGGeometryElement) {
  const length = path.getTotalLength();
  gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
}
const drawStroke = (paths: SVGGeometryElement | SVGGeometryElement[], duration: number, stagger = 0) =>
  gsap.to(paths, { strokeDashoffset: 0, duration, stagger, ease: 'power2.inOut' });

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
   HOME · Título rotativo "Sua empresa não precisa de …"
   Digita e apaga cada termo; com motion reduzido, apenas troca.
────────────────────────────────────────────────────────── */
function initHeroRotator(flags: ConsultableFlags) {
  const rotator = document.querySelector<HTMLElement>('[data-hero-rotator]');
  if (!rotator) return;
  let words: string[];
  try { words = JSON.parse(rotator.dataset.words || '[]'); } catch { return; }
  const target = rotator.querySelector<HTMLElement>('[data-rotator-word]');
  if (!target || words.length < 2) return;

  const typing = flags.motion && !matchMedia('(prefers-reduced-motion: reduce)').matches;
  const HOLD = 2300, TYPE = 46, ERASE = 26, PAUSE = 320;
  let index = 0;
  let timer = 0;
  const schedule = (fn: () => void, ms: number) => { window.clearTimeout(timer); timer = window.setTimeout(fn, ms); };
  // A rede do hero escuta a palavra atual para acender o hub correspondente.
  const announce = () => {
    rotator.dataset.index = String(index);
    document.dispatchEvent(new CustomEvent('cx:rotator', { detail: { index } }));
  };
  announce();

  if (!typing) {
    rotator.dataset.state = 'static';
    const swap = () => { index = (index + 1) % words.length; target.textContent = words[index]; announce(); schedule(swap, HOLD + 900); };
    schedule(swap, HOLD + 900);
    return;
  }

  const type = () => {
    const word = words[index];
    const text = target.textContent || '';
    if (text.length < word.length) {
      rotator.dataset.state = 'typing';
      target.textContent = word.slice(0, text.length + 1);
      schedule(type, TYPE + Math.random() * 38);
    } else {
      rotator.dataset.state = 'hold';
      schedule(erase, HOLD);
    }
  };
  const erase = () => {
    const text = target.textContent || '';
    if (text.length) {
      rotator.dataset.state = 'erasing';
      target.textContent = text.slice(0, -1);
      schedule(erase, ERASE);
    } else {
      index = (index + 1) % words.length;
      announce();
      schedule(type, PAUSE);
    }
  };

  rotator.dataset.state = 'hold';
  schedule(erase, HOLD);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { window.clearTimeout(timer); return; }
    target.textContent = words[index];
    rotator.dataset.state = 'hold';
    schedule(erase, HOLD);
  });
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
      .to(strike, { '--struck': 1, duration: 0.5, ease: 'power1.out' }, 1.75);
  }
  if (scramble) {
    tl.add(() => {
      gsap.fromTo(scramble, { opacity: 0.65 }, { opacity: 1, duration: 0.35, ease: 'power2.out' });
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
    // Cinza → tinta (não opacidade): o texto grande mantém contraste mínimo de 3:1 desde o início.
    // O script move só a proporção (--lit); as cores vêm do tema, então a troca claro/escuro não quebra.
    gsap.fromTo(words, { '--lit': 0 }, {
      '--lit': 1, ease: 'none', stagger: 0.12,
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
      hideStroke(underline);
      tl.add(() => { drawStroke(underline, 0.9); }, 0.5);
    }
  });
}

/* ──────────────────────────────────────────────────────────
   CENA "ESPALHADA" · a bancada de arquivo (Fig. 1 do Manifesto)
   Seis bandejas → uma gaveta de índice → o leitor (a IA) lê.
   No desktop o scroll fixado comanda o progresso; no celular, um passeio automático.
────────────────────────────────────────────────────────── */
function initScatterScene(flags: ConsultableFlags) {
  const section = document.querySelector<HTMLElement>('[data-scatter]');
  const stage = section?.querySelector<HTMLElement>('[data-bench-stage]');
  if (!section || !stage) return;
  const steps = [...section.querySelectorAll<HTMLElement>('[data-step]')];
  const progressBar = section.querySelector<HTMLElement>('[data-scatter-progress]');
  const holder = stage.querySelector<HTMLElement>('[data-bench-svg]');
  const setStep = (active: number) => steps.forEach((step, i) => step.classList.toggle('is-active', i === active));

  // O pin e os passos valem desde já; a figura recebe o estado pendente assim que montar.
  let bench: import('../figures/knowledgeBenchLive.ts').BenchHandle | null = null;
  let wantTarget = 0;
  let wantTour = false;
  if (flags.motion) {
    const mm = gsap.matchMedia();
    mm.add('(min-width: 961px)', () => {
      const trigger = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: '+=320%',
        pin: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const progress = self.progress;
          // Os dois primeiros passos mostram o problema parado; o terceiro põe a bancada para trabalhar.
          setStep(progress < 0.16 ? 0 : progress < 0.32 ? 1 : 2);
          if (progressBar) progressBar.style.transform = `scaleX(${progress})`;
          wantTarget = Math.max(0, Math.min(1, (progress - 0.32) / 0.62)) * 7;
          bench?.setTarget(wantTarget);
        },
      });
      ScrollTrigger.refresh();
      return () => trigger.kill();
    });
    mm.add('(max-width: 960px)', () => {
      steps.forEach((step) => step.classList.add('is-active'));
      wantTour = true;
      bench?.tour(true);
      return () => { wantTour = false; bench?.tour(false); };
    });
  } else {
    steps.forEach((step) => step.classList.add('is-active'));
    wantTour = true; // sem movimento: mostra direto a camada pronta
  }

  // O SVG (centenas de KB de caminhos) fica fora do HTML: chega por fetch quando a seção se aproxima.
  // Espera a linha principal ficar livre antes de um trabalho pesado (analisar o SVG, montar a figura).
  const whenIdle = () => new Promise<void>((resolve) => {
    if ('requestIdleCallback' in window) requestIdleCallback(() => resolve(), { timeout: 1500 });
    else setTimeout(resolve, 0);
  });
  const load = async () => {
    try {
      const [markup, { mountBench }] = await Promise.all([
        holder && !holder.querySelector('svg') ? fetch(holder.dataset.benchSvg || '').then((response) => { if (!response.ok) throw new Error(String(response.status)); return response.text(); }) : Promise.resolve(''),
        import('../figures/knowledgeBenchLive.ts'),
      ]);
      if (markup && holder) {
        await whenIdle();
        performance.mark('bench-inject-start');
        holder.innerHTML = markup;
        holder.querySelector('svg')?.setAttribute('aria-hidden', 'true');
        performance.mark('bench-inject-end');
      }
      await whenIdle();
      performance.mark('bench-mount-start');
      bench = mountBench(stage, JSON.parse(stage.dataset.copy || '{}'));
      performance.mark('bench-mount-end');
      if (!bench) return;
      if (wantTour) bench.tour(true);
      else bench.setTarget(wantTarget);
    } catch { /* sem figura: a seção continua legível pelo texto */ }
  };
  const near = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    near.disconnect();
    load();
  }, { rootMargin: '1200px 0px' });
  near.observe(section);
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
        .to(not, { color: '#71717a', duration: 0.3 }, 0.5);
    }
    tl.to(yesWords, { yPercent: 0, duration: 1, stagger: 0.07, ease: 'expo.out' }, 0.9);

    ScrollTrigger.create({ trigger: row, start: 'top 78%', once: true, onEnter: () => tl.play() });
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
    whenInView(brand, () => {
      gsap.to(chars, { yPercent: 0, opacity: 1, duration: 1.2, stagger: 0.055, ease: 'expo.out' });
    }, 0.5);
  });
}

/* ──────────────────────────────────────────────────────────
   GENÉRICOS · revelações em grupo e títulos de seção
────────────────────────────────────────────────────────── */
function initReveals() {
  document.querySelectorAll<HTMLElement>('[data-reveal-group]').forEach((group) => {
    const children = [...group.children] as HTMLElement[];
    children.forEach((child) => { child.style.opacity = '0'; });
    whenInView(group, () => {
      gsap.fromTo(children, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, stagger: Math.min(0.06, 0.2 / Math.max(children.length - 1, 1)), ease: 'expo.out', clearProps: 'transform' });
    }, 0.01);
  });

  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    el.style.opacity = '0';
    whenInView(el, () => {
      gsap.fromTo(el, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out', clearProps: 'transform' });
    }, 0.01);
  });

  document.querySelectorAll<HTMLElement>('[data-draw-on-view]').forEach((svgEl) => {
    const paths = [...svgEl.querySelectorAll<SVGGeometryElement>('[data-draw]')];
    paths.forEach(hideStroke);
    whenInView(svgEl, () => { drawStroke(paths, 1.4, 0.12); }, 0.4);
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
      if (before) tl.fromTo(before, { '--dim': 0 }, { '--dim': 1, ease: 'none' }, 0);
      if (arrow) tl.fromTo(arrow, { x: -12, opacity: 0 }, { x: 0, opacity: 1, ease: 'none' }, 0);
      if (after) tl.fromTo(after, { '--lit': 0, x: 16 }, { '--lit': 1, x: 0, ease: 'none' }, 0.1);
    });
  });
}


/* ──────────────────────────────────────────────────────────
   TÍTULOS DE HERO (Sobre, Contato) · palavras sobem de máscaras
────────────────────────────────────────────────────────── */
function initHeroTitles() {
  document.querySelectorAll<HTMLElement>('[data-mf-title]').forEach((title) => {
    if (title.closest('[data-mf-hero]')) return;
    const words = splitWords(title, { mask: true });
    gsap.fromTo(words, { yPercent: 115, rotate: 3 }, { yPercent: 0, rotate: 0, duration: 0.65, stagger: { amount: 0.18 }, ease: 'expo.out', delay: 0.12 });
  });
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
  initHeroRotator(flags);
  if (flags.motion) {
    initManifestoHero();
    initHeroTitles();
  }
  root.classList.remove('cx-preload');
  root.classList.add('cx-ready');
  initScatterScene(flags);

  if (flags.pointer) initPointerGlow();
  if (!flags.motion) return;

  // 2 · O restante da coreografia é montado em tarefas pequenas.
  const steps = [
    initScrubText, initBeliefs, initSignature,
    initReveals, initShift,
  ];
  for (const step of steps) {
    await yieldToMain();
    step();
  }
  ScrollTrigger.refresh();
}
