import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { animate, spring } from 'motion';

gsap.registerPlugin(ScrollTrigger);

export function initMotion() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isCoarse = window.matchMedia('(pointer: coarse)').matches;

  // ══════════════════════════════════════════════════════════
  // 1. INTERACTIVE MAGNETIC CURSOR (BASIC/DEPT® + Artistsweb)
  // ══════════════════════════════════════════════════════════
  const cursor = document.getElementById('custom-cursor');
  const cursorLabel = document.getElementById('cursor-label');

  if (cursor && !isCoarse && !prefersReduced) {
    const dot = cursor.querySelector<HTMLElement>('.cursor-dot');
    const ring = cursor.querySelector<HTMLElement>('.cursor-ring');

    // High performance GSAP quickTo setters for zero-latency tracking
    const setDotX = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power2.out' });
    const setDotY = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power2.out' });
    const setRingX = gsap.quickTo(ring, 'x', { duration: 0.22, ease: 'power3.out' });
    const setRingY = gsap.quickTo(ring, 'y', { duration: 0.22, ease: 'power3.out' });

    let isHovering = false;

    window.addEventListener('mousemove', (e) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      setDotX(mouseX);
      setDotY(mouseY);
      setRingX(mouseX);
      setRingY(mouseY);
    }, { passive: true });

    window.addEventListener('mousedown', () => {
      cursor.classList.add('is-down');
    });

    window.addEventListener('mouseup', () => {
      cursor.classList.remove('is-down');
    });

    document.documentElement.addEventListener('mouseleave', () => cursor.classList.add('is-hidden'));
    document.documentElement.addEventListener('mouseenter', () => cursor.classList.remove('is-hidden'));

    // Detect interactive elements for hover states
    const interactiveSelector = 'a, button, input, select, textarea, [data-cursor], [data-magnetic]';

    document.addEventListener('mouseover', (e) => {
      const target = (e.target as HTMLElement)?.closest<HTMLElement>(interactiveSelector);
      if (!target) return;

      const cursorText = target.getAttribute('data-cursor-text');

      if (cursorText && cursorLabel) {
        cursorLabel.textContent = cursorText;
        cursor.classList.add('has-label');
        cursor.classList.remove('is-hover');
      } else {
        cursor.classList.add('is-hover');
        cursor.classList.remove('has-label');
      }
      isHovering = true;
    });

    document.addEventListener('mouseout', (e) => {
      const target = (e.target as HTMLElement)?.closest<HTMLElement>(interactiveSelector);
      if (!target) return;

      cursor.classList.remove('is-hover', 'has-label');
      isHovering = false;
    });
  }

  // ══════════════════════════════════════════════════════════
  // 2. MAGNETIC ATTRACTION ON BUTTONS & CTAs
  // ══════════════════════════════════════════════════════════
  if (!prefersReduced && !isCoarse) {
    const magneticElements = document.querySelectorAll<HTMLElement>(
      '[data-magnetic], .btn-primary, #hero-cta-primary, #hero-cta-secondary, .dock-cta-btn, .nav-logo'
    );

    magneticElements.forEach((el) => {
      let bounds = el.getBoundingClientRect();

      el.addEventListener('mouseenter', () => {
        bounds = el.getBoundingClientRect();
      });

      el.addEventListener('mousemove', (e) => {
        const x = (e.clientX - bounds.left - bounds.width / 2) * 0.32;
        const y = (e.clientY - bounds.top - bounds.height / 2) * 0.32;

        gsap.to(el, {
          x,
          y,
          duration: 0.3,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      });

      el.addEventListener('mouseleave', () => {
        gsap.to(el, {
          x: 0,
          y: 0,
          duration: 0.65,
          ease: 'elastic.out(1, 0.45)',
          overwrite: 'auto',
        });
      });
    });
  }

  // ══════════════════════════════════════════════════════════
  // 3. KINETIC TYPOGRAPHY (SPLIT-TEXT WORD REVEALS)
  // ══════════════════════════════════════════════════════════
  if (!prefersReduced) {
    // Helper to wrap words in overflow-hidden spans
    const splitIntoWords = (element: HTMLElement) => {
      if (element.dataset.splitDone) return;
      element.dataset.splitDone = 'true';

      const nodes = Array.from(element.childNodes);
      element.innerHTML = '';

      nodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          // Mantém os espaços originais como texto: evita o vão antes de pontuação após <em>.
          const parts = (node.textContent || '').split(/(\s+)/);
          parts.forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) {
              element.appendChild(document.createTextNode(' '));
              return;
            }
            const wordSpan = document.createElement('span');
            wordSpan.className = 'kinetic-word-wrap';
            wordSpan.style.display = 'inline-block';
            wordSpan.style.overflow = 'hidden';
            wordSpan.style.verticalAlign = 'top';

            const innerSpan = document.createElement('span');
            innerSpan.className = 'kinetic-word-inner';
            innerSpan.style.display = 'inline-block';
            innerSpan.textContent = part;

            wordSpan.appendChild(innerSpan);
            element.appendChild(wordSpan);
          });
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as HTMLElement;
          if (el.tagName === 'BR') {
            element.appendChild(document.createElement('br'));
          } else {
            // Nested element (like a span with subtitle or highlight)
            const wrapper = document.createElement('span');
            wrapper.className = el.className;
            splitIntoWords(el);
            element.appendChild(el);
          }
        }
      });
    };

    // Hero Main Headline
    const heroHeading = document.querySelector<HTMLElement>('.hero-editorial-heading');
    if (heroHeading) {
      splitIntoWords(heroHeading);
      const words = heroHeading.querySelectorAll('.kinetic-word-inner');

      const heroTl = gsap.timeline({ defaults: { ease: 'power4.out' } });

      heroTl.fromTo(
        words,
        { y: '115%', rotateZ: 2, opacity: 0 },
        { y: '0%', rotateZ: 0, opacity: 1, duration: 1.15, stagger: 0.035 },
        0.1
      );

      const heroEyebrow = document.querySelector('.hero-eyebrow-editorial');
      if (heroEyebrow) {
        heroTl.fromTo(
          heroEyebrow,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.9 },
          0.45
        );
      }

      const heroCtas = document.querySelector('.hero-ctas-editorial');
      if (heroCtas) {
        heroTl.fromTo(
          heroCtas,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8 },
          0.6
        );
      }
    }

    // Scroll-triggered headings across the site
    const sectionHeadings = document.querySelectorAll<HTMLElement>(
      '.section-header h2, .solucoes-header h2, .metricas-header h2, .diferenciais-heading, .opera-preview-title'
    );

    sectionHeadings.forEach((heading) => {
      splitIntoWords(heading);
      const innerWords = heading.querySelectorAll('.kinetic-word-inner');

      gsap.fromTo(
        innerWords,
        { y: '110%', opacity: 0 },
        {
          y: '0%',
          opacity: 1,
          duration: 0.9,
          stagger: 0.025,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: heading,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        }
      );
    });

    // ══════════════════════════════════════════════════════════
    // 3B. NUMERIC STATS ARPEGGIO COUNTER (GSAP SCROLLTRIGGER)
    // ══════════════════════════════════════════════════════════
    const statCounters = document.querySelectorAll<HTMLElement>('.stat-number-arpeggio');
    if (statCounters.length > 0) {
      ScrollTrigger.create({
        trigger: '.stats-arpeggio-container',
        start: 'top 85%',
        once: true,
        onEnter: () => {
          statCounters.forEach((counter) => {
            const targetVal = parseFloat(counter.getAttribute('data-target') || '0');
            const suffix = counter.getAttribute('data-suffix') || '';
            const obj = { val: 0 };

            gsap.to(obj, {
              val: targetVal,
              duration: 2.2,
              ease: 'power3.out',
              onUpdate: () => {
                counter.textContent = Math.round(obj.val) + suffix;
              },
            });
          });
        },
      });
    }

    // ══════════════════════════════════════════════════════════
    // 3C. EDITORIAL TABLE & GRID STAGGER REVEALS
    // ══════════════════════════════════════════════════════════
    // Solução rows stagger
    const solucaoRows = document.querySelectorAll<HTMLElement>('.solucao-editorial-row');
    if (solucaoRows.length > 0) {
      gsap.fromTo(
        solucaoRows,
        { opacity: 0, x: -24 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.solucao-editorial-table',
            start: 'top 85%',
          },
        }
      );
    }

    // Diferenciais cards stagger
    const difCards = document.querySelectorAll<HTMLElement>('.dif-item');
    if (difCards.length > 0) {
      gsap.fromTo(
        difCards,
        { opacity: 0, y: 32 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.dif-grid',
            start: 'top 85%',
          },
        }
      );
    }

    // Before / After reveal
    const beforeCol = document.querySelector<HTMLElement>('.before-col');
    const afterCol = document.querySelector<HTMLElement>('.after-col');
    if (beforeCol && afterCol) {
      gsap.fromTo(
        [beforeCol, afterCol],
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.before-after',
            start: 'top 85%',
          },
        }
      );
    }

    // Qualificação cards reveal
    const qualCards = document.querySelectorAll<HTMLElement>('.qual-col');
    if (qualCards.length > 0) {
      gsap.fromTo(
        qualCards,
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.18,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.qual-grid',
            start: 'top 85%',
          },
        }
      );
    }
  }

  // ══════════════════════════════════════════════════════════
  // 4. SCROLL VELOCITY SKEW EFFECT (INERTIAL DYNAMICS)
  // ══════════════════════════════════════════════════════════
  if (!prefersReduced && !isCoarse) {
    const skewElements = document.querySelectorAll<HTMLElement>(
      '.skew-on-scroll, .solucao-item, .card-step, .qual-col, .agentic-node'
    );

    if (skewElements.length > 0) {
      let lastScrollY = window.scrollY;
      let currentSkew = 0;
      let targetSkew = 0;
      let skewRafId: number | null = null;

      const updateSkew = () => {
        currentSkew += (targetSkew - currentSkew) * 0.12;

        skewElements.forEach((el) => {
          el.style.transform = `skewY(${currentSkew.toFixed(3)}deg)`;
        });

        // Decay velocity
        targetSkew *= 0.88;

        if (Math.abs(currentSkew) > 0.01 || Math.abs(targetSkew) > 0.01) {
          skewRafId = requestAnimationFrame(updateSkew);
        } else {
          skewElements.forEach((el) => {
            el.style.transform = 'none';
          });
          skewRafId = null;
        }
      };

      window.addEventListener(
        'scroll',
        () => {
          const scrollY = window.scrollY;
          const delta = scrollY - lastScrollY;
          lastScrollY = scrollY;

          // Clamp between -2.2deg and +2.2deg
          targetSkew = Math.max(-2.2, Math.min(2.2, delta * 0.045));

          if (!skewRafId) {
            skewRafId = requestAnimationFrame(updateSkew);
          }
        },
        { passive: true }
      );
    }
  }

  // ══════════════════════════════════════════════════════════
  // 5. MOTION.DEV SPRING PHYSICS (BUTTONS & MICRO-INTERACTIONS)
  // ══════════════════════════════════════════════════════════
  if (!prefersReduced) {
    const springButtons = document.querySelectorAll<HTMLElement>('.btn, .dock-cta-btn, .button-pill');

    springButtons.forEach((btn) => {
      btn.addEventListener('mouseenter', () => {
        animate(btn, { scale: 1.03 }, { type: 'spring', stiffness: 420, damping: 22 });
      });

      btn.addEventListener('mouseleave', () => {
        animate(btn, { scale: 1 }, { type: 'spring', stiffness: 420, damping: 22 });
      });

      btn.addEventListener('mousedown', () => {
        animate(btn, { scale: 0.95 }, { type: 'spring', stiffness: 500, damping: 25 });
      });

      btn.addEventListener('mouseup', () => {
        animate(btn, { scale: 1.03 }, { type: 'spring', stiffness: 420, damping: 22 });
      });
    });
  }

  // ══════════════════════════════════════════════════════════
  // 6. 3D CARD TILT WITH SPECULAR GLARE
  // ══════════════════════════════════════════════════════════
  if (!prefersReduced && !isCoarse) {
    const tiltCards = document.querySelectorAll<HTMLElement>(
      '[data-tilt], .agentic-node, .agentic-core, .card-step, .qual-col, .solucao-item'
    );

    tiltCards.forEach((card) => {
      card.style.transformStyle = 'preserve-3d';

      let glare = card.querySelector<HTMLElement>('.card-glare');
      if (!glare) {
        glare = document.createElement('div');
        glare.className = 'card-glare';
        glare.style.position = 'absolute';
        glare.style.inset = '0';
        glare.style.pointerEvents = 'none';
        glare.style.borderRadius = 'inherit';
        glare.style.opacity = '0';
        glare.style.transition = 'opacity 0.25s ease';
        card.style.position = card.style.position || 'relative';
        card.appendChild(glare);
      }

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const xPct = (e.clientX - rect.left) / rect.width - 0.5;
        const yPct = (e.clientY - rect.top) / rect.height - 0.5;

        const rotX = -yPct * 6.5;
        const rotY = xPct * 6.5;

        gsap.to(card, {
          rotateX: rotX,
          rotateY: rotY,
          transformPerspective: 950,
          duration: 0.28,
          ease: 'power2.out',
          overwrite: 'auto',
        });

        if (glare) {
          const glareX = (xPct + 0.5) * 100;
          const glareY = (yPct + 0.5) * 100;
          glare.style.background = `radial-gradient(circle 280px at ${glareX}% ${glareY}%, rgba(255,255,255,0.07) 0%, transparent 70%)`;
          glare.style.opacity = '1';
        }
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.6,
          ease: 'power3.out',
          overwrite: 'auto',
        });

        if (glare) {
          glare.style.opacity = '0';
        }
      });
    });
  }

  // ══════════════════════════════════════════════════════════
  // 7. FLOATING ACTION DOCK CONTROLLER
  // ══════════════════════════════════════════════════════════
  const dock = document.getElementById('floating-action-dock');
  if (dock) {
    let isVisible = false;
    let scrollTimeout: number | null = null;

    const checkDockVisibility = () => {
      const scrollY = window.scrollY;
      const footer = document.querySelector<HTMLElement>('.site-footer, .cta-section');
      const footerTop = footer ? footer.getBoundingClientRect().top : Infinity;
      const windowHeight = window.innerHeight;

      const shouldShow = scrollY > 450 && footerTop > windowHeight - 40;

      if (shouldShow && !isVisible) {
        isVisible = true;
        dock.classList.add('is-visible');
        if (!prefersReduced) {
          animate(dock, { y: [50, 0], opacity: [0, 1] }, { type: 'spring', stiffness: 320, damping: 24 });
        }
      } else if (!shouldShow && isVisible) {
        isVisible = false;
        dock.classList.remove('is-visible');
        if (!prefersReduced) {
          animate(dock, { y: 50, opacity: 0 }, { duration: 0.25, ease: 'easeIn' });
        }
      }
    };

    window.addEventListener(
      'scroll',
      () => {
        if (!scrollTimeout) {
          scrollTimeout = window.requestAnimationFrame(() => {
            checkDockVisibility();
            scrollTimeout = null;
          });
        }
      },
      { passive: true }
    );

    checkDockVisibility();
  }
}
