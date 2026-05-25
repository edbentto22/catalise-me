import {
  createIcons,
  Zap,
  Clock,
  RefreshCw,
  Globe,
  LayoutGrid,
  Monitor,
  PenTool,
  MessageSquare,
  Activity,
  BarChart3,
  Users,
  Search,
  ClipboardList,
  Flag,
  Lock,
  Target,
  Hotel,
  Hospital,
  Building2,
  Car,
  Scale,
  GraduationCap,
  Network,
  CalendarCheck,
  Compass,
  Rocket,
  Sliders,
  BrainCircuit,
  Magnet,
  HelpCircle,
  MousePointerClick,
  HeartHandshake
} from 'lucide';

// Initialize Lucide Icons
createIcons({
  icons: {
    Zap,
    Clock,
    RefreshCw,
    Globe,
    LayoutGrid,
    Monitor,
    PenTool,
    MessageSquare,
    Activity,
    BarChart3,
    Users,
    Search,
    ClipboardList,
    Flag,
    Lock,
    Target,
    Hotel,
    Hospital,
    Building2,
    Car,
    Scale,
    GraduationCap,
    Network,
    CalendarCheck,
    Compass,
    Rocket,
    Sliders,
    BrainCircuit,
    Magnet,
    HelpCircle,
    MousePointerClick,
    HeartHandshake
  }
});

// ─── Enable JS-dependent styles ───
document.documentElement.classList.add('js-enabled');

// ─── Nav scroll effect ───
(function () {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// ─── Mobile hamburger ───
(function () {
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileMenu = document.querySelector('.nav-mobile');
  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close on link click
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
})();

// ─── Active nav link ───
(function () {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-links a, .nav-mobile a').forEach(link => {
    const href = link.getAttribute('href') || '';
    const isCurrent =
      (path === '/' || path.endsWith('index.html')) && (href === '/' || href === 'index.html' || href === './index.html') ||
      path.includes('sobre') && href.includes('sobre') ||
      path.includes('opera-os') && href.includes('opera-os') ||
      path.includes('contato') && href.includes('contato');
    if (isCurrent) link.classList.add('active');
  });
})();

// ─── Scroll reveal ───
(function () {
  const elements = document.querySelectorAll('.reveal, .reveal-left');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
  );

  elements.forEach(el => observer.observe(el));
})();

// ─── FAQ Accordion ───
(function () {
  document.querySelectorAll('.faq-item').forEach(item => {
    const question = item.querySelector('.faq-question');
    if (!question) return;
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // Close all
      document.querySelectorAll('.faq-item.open').forEach(other => {
        other.classList.remove('open');
      });
      // Open clicked if it wasn't open
      if (!isOpen) item.classList.add('open');
    });
  });
})();

// ─── Number counter animation ───
function animateCounter(el) {
  const target = parseFloat(el.dataset.target || el.textContent);
  const suffix = el.dataset.suffix || '';
  const duration = 2000;
  const start = performance.now();
  const isFloat = el.dataset.float === 'true';

  const tick = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const value = target * ease;
    el.textContent = (isFloat ? value.toFixed(1) : Math.round(value)) + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

(function () {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  if (!counters.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(el => observer.observe(el));
})();

// ─── OPERA tabs (Home page) ───
(function () {
  const items = document.querySelectorAll('.opera-item[data-phase]');
  const detail = document.querySelector('.opera-detail');
  if (!items.length || !detail) return;

  const phases = {
    O: { title: 'Organização', weeks: 'Semanas 1–2', desc: 'Diagnóstico profundo da operação atual. Mapeamos cada processo: do primeiro contato do cliente até o pós-venda. Identificamos e classificamos todos os gargalos por impacto financeiro real.' },
    P: { title: 'Planejamento', weeks: 'Semanas 2–3', desc: 'Com os gargalos mapeados, definimos o escopo completo do OperaOS. Priorizamos por impacto financeiro imediato e viabilidade técnica, garantindo ROI desde as primeiras semanas.' },
    E: { title: 'Estratégia', weeks: 'Semanas 3–4', desc: 'Blueprint técnico e operacional de todos os sistemas. IA sem estratégia é automação de caos. Aqui definimos quais agentes, quais automações, como tudo se conecta.' },
    R: { title: 'Realização', weeks: 'Semanas 4–8', desc: 'A fase mais intensa. Construímos, integramos e ativamos todos os sistemas. Site vai ao ar, agente de IA entra em operação, automações começam a rodar.' },
    A: { title: 'Afinação', weeks: 'Semanas 8–10', desc: 'Monitoramos os primeiros 30 dias de operação real. Ajustamos prompts, calibramos automações, revisamos KPIs e entregamos o sistema certificado.' }
  };

  items.forEach(item => {
    item.addEventListener('click', () => {
      items.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      const phase = item.dataset.phase;
      const data = phases[phase];
      if (data && detail) {
        detail.querySelector('.opera-detail-title').textContent = `${phase} · ${data.title}`;
        detail.querySelector('.opera-detail-weeks').textContent = data.weeks;
        detail.querySelector('.opera-detail-desc').textContent = data.desc;
        detail.style.opacity = '0';
        detail.style.transform = 'translateY(8px)';
        requestAnimationFrame(() => {
          detail.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          detail.style.opacity = '1';
          detail.style.transform = 'translateY(0)';
        });
      }
    });
  });

  // Activate first
  items[0]?.click();
})();
