/* =========================================
   CATALISE.ME — ANIMATIONS ENGINE v4
   Extracted from Opera OS visual system
   — scroll reveal handled by nav.js
   ========================================= */

(function () {
  'use strict';

  /* ─── 1. Scroll-driven reveals (nav.js handles .reveal/.reveal-left) ─── */
  function initReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    els.forEach((el) => io.observe(el));
  }

  /* ─── 2. Animated number counters ─── */
  function initCounters() {
    const nums = document.querySelectorAll('[data-target]');
    if (!nums.length) return;

    const ease = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        const el = e.target;
        const target = +el.dataset.target;
        const suffix = el.dataset.suffix || '';
        const dur = 1600;
        const start = performance.now();
        const raf = (now) => {
          const p = Math.min((now - start) / dur, 1);
          el.textContent = Math.round(ease(p) * target) + suffix;
          if (p < 1) requestAnimationFrame(raf);
        };
        requestAnimationFrame(raf);
      });
    }, { threshold: 0.5 });

    nums.forEach((n) => io.observe(n));
  }

  /* ─── 3. (REMOVED) Opera method auto-cycle ─── */

  /* ─── 4. Horizontal problem-card drag/scroll ─── */
  function initHorizontalDrag() {
    const sliders = document.querySelectorAll('.problem-cards-track, .cases-grid-scroll');
    sliders.forEach((el) => {
      let isDown = false, startX, scrollLeft;
      el.addEventListener('mousedown', (e) => {
        isDown = true;
        el.classList.add('dragging');
        startX = e.pageX - el.offsetLeft;
        scrollLeft = el.scrollLeft;
      });
      el.addEventListener('mouseleave', () => { isDown = false; el.classList.remove('dragging'); });
      el.addEventListener('mouseup', () => { isDown = false; el.classList.remove('dragging'); });
      el.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - el.offsetLeft;
        el.scrollLeft = scrollLeft - (x - startX) * 1.4;
      });
    });
  }

  /* ─── 5. Sticky scroll progress dot ─── */
  function initScrollProgress() {
    const sections = document.querySelectorAll('section[id]');
    if (!sections.length) return;

    const prog = document.createElement('div');
    prog.className = 'scroll-progress-track';
    prog.setAttribute('aria-hidden', 'true');
    sections.forEach((s, i) => {
      const dot = document.createElement('div');
      dot.className = 'scroll-dot';
      dot.dataset.idx = i;
      dot.title = s.getAttribute('aria-labelledby')
        ? (document.getElementById(s.getAttribute('aria-labelledby'))?.textContent?.trim()?.slice(0, 30) || '')
        : '';
      dot.addEventListener('click', () => s.scrollIntoView({ behavior: 'smooth', block: 'start' }));
      prog.appendChild(dot);
    });
    document.body.appendChild(prog);

    const dots = prog.querySelectorAll('.scroll-dot');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        const idx = [...sections].indexOf(e.target);
        if (e.isIntersecting) dots[idx]?.classList.add('active');
        else dots[idx]?.classList.remove('active');
      });
    }, { threshold: 0.4 });
    sections.forEach((s) => io.observe(s));
  }

  /* ─── 6. Card hover magnetic tilt ─── */
  function initCardTilt() {
    const cards = document.querySelectorAll('.case-card, .stat-card, .qual-col');
    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(800px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        setTimeout(() => { card.style.transition = ''; }, 500);
      });
    });
  }

  /* ─── 7. Before/After animated reveal ─── */
  function initBeforeAfter() {
    const cols = document.querySelectorAll('.before-col, .after-col');
    if (!cols.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const items = e.target.querySelectorAll('li');
          items.forEach((li, i) => {
            li.style.opacity = '0';
            li.style.transform = 'translateX(-16px)';
            setTimeout(() => {
              li.style.transition = `opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1), transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)`;
              li.style.opacity = '1';
              li.style.transform = 'translateX(0)';
            }, i * 80 + 100);
          });
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.2 });
    cols.forEach((c) => io.observe(c));
  }

  /* ─── 8. Floating sticky CTA bar ─── */
  function initStickyCTA() {
    const hero = document.querySelector('.hero-section');
    if (!hero) return;
    const bar = document.createElement('div');
    bar.className = 'sticky-cta-bar';
    bar.innerHTML = `
      <span class="sticky-cta-label">
        <span class="sticky-cta-dot"></span>
        Diagnóstico Gratuito Disponível
      </span>
      <a href="contato.html" class="btn btn-primary btn-sm" id="sticky-cta-btn">Solicitar Agora →</a>
    `;
    document.body.appendChild(bar);

    const io = new IntersectionObserver(([e]) => {
      bar.classList.toggle('visible', !e.isIntersecting);
    }, { threshold: 0 });
    io.observe(hero);
  }

  /* ─── 9. Hero video smooth fade in ─── */
  function initHeroVideo() {
    const vid = document.getElementById('hero-bg-video');
    if (!vid) return;

    // Se o vídeo foi bloqueado pelo navegador de autoplayar, tenta rodar manualmente
    vid.play().catch(() => {});

    const onReady = () => {
      vid.classList.add('loaded');
    };

    if (vid.readyState >= 3) {
      onReady();
    } else {
      vid.addEventListener('canplay', onReady, { once: true });
    }
  }

  /* ─── 10. Parallax Wordmark (Editorial Hero) ─── */
  function initParallaxWordmark() {
    const wordmark = document.querySelector('.hero-wordmark');
    if (!wordmark) return;
    
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      wordmark.style.transform = `translateY(${scrolled * 0.25}px)`;
    }, { passive: true });
  }

  /* ─── 11. Section eyebrow line animation ─── */
  function initEyebrowLines() {
    const eyebrows = document.querySelectorAll('.eyebrow');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('eyebrow-revealed');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    eyebrows.forEach((el) => io.observe(el));
  }

  /* ─── Boot ─── */
  function init() {
    initReveal();
    initCounters();
    initHorizontalDrag();
    initScrollProgress();
    initCardTilt();
    initBeforeAfter();
    initStickyCTA();
    initHeroVideo();
    initParallaxWordmark();
    initEyebrowLines();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
