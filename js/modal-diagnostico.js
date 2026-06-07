/* =========================================
   CATALISE.ME — MODAL DIAGNÓSTICO GRATUITO
   ES Module — compatível com Vite build
   ========================================= */

/* ─── Seletores de botões que devem abrir o modal ─── */
const TRIGGER_SELECTORS = [
  '#hero-cta-primary',
  '#final-cta-primary',
  '#opera-hero-cta',
  '#opera-final-cta',
  '#comecar-cta',
  '#pricing-cta-primary',
  '#sobre-cta-primary',
  '#sticky-cta-btn',
  '.nav-cta-modal',
  '.mobile-cta-modal',
];

/* ─── Cria o HTML do modal ─── */
function createModal() {
  const el = document.createElement('div');
  el.id = 'modal-diagnostico';
  el.className = 'modal-diag-overlay';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.setAttribute('aria-labelledby', 'modal-diag-title');
  el.setAttribute('hidden', '');
  el.innerHTML = `
    <div class="modal-diag-box" role="document">
      <button class="modal-diag-close" id="modal-diag-close" aria-label="Fechar">✕</button>
      <p class="modal-diag-brand">CATALISE.ME</p>
      <h2 id="modal-diag-title" class="modal-diag-title">
        Diagnóstico <span>Gratuito</span>
      </h2>
      <form id="modal-diag-form" class="modal-diag-form" novalidate>
        <div class="modal-diag-row">
          <div class="modal-diag-field">
            <label for="diag-nome">Nome <span aria-hidden="true">*</span></label>
            <input type="text" id="diag-nome" name="nome" placeholder="Seu nome" required autocomplete="given-name">
          </div>
          <div class="modal-diag-field">
            <label for="diag-empresa">Empresa <span aria-hidden="true">*</span></label>
            <input type="text" id="diag-empresa" name="empresa" placeholder="Nome da empresa" required autocomplete="organization">
          </div>
        </div>
        <div class="modal-diag-field">
          <label for="diag-email">E-mail <span aria-hidden="true">*</span></label>
          <input type="email" id="diag-email" name="email" placeholder="seu@email.com" required autocomplete="email">
        </div>
        <div class="modal-diag-field">
          <label for="diag-whatsapp">WhatsApp <span aria-hidden="true">*</span></label>
          <input type="tel" id="diag-whatsapp" name="whatsapp" placeholder="(00) 90000-0000" required autocomplete="tel">
        </div>
        <div class="modal-diag-field">
          <label for="diag-faturamento">Faturamento médio mensal <span aria-hidden="true">*</span></label>
          <select id="diag-faturamento" name="faturamento" required>
            <option value="" disabled selected>Selecione uma faixa</option>
            <option value="ate-50k">Até R$ 50 mil</option>
            <option value="50k-150k">R$ 50 mil – R$ 150 mil</option>
            <option value="150k-500k">R$ 150 mil – R$ 500 mil</option>
            <option value="500k-2m">R$ 500 mil – R$ 2 milhões</option>
            <option value="acima-2m">Acima de R$ 2 milhões</option>
          </select>
        </div>
        <div class="modal-diag-field">
          <label for="diag-origem">Como ficou sabendo sobre nós? <span aria-hidden="true">*</span></label>
          <select id="diag-origem" name="origem" required>
            <option value="" disabled selected>Selecione uma opção</option>
            <option value="instagram">Instagram</option>
            <option value="linkedin">LinkedIn</option>
            <option value="google">Google</option>
            <option value="indicacao">Indicação</option>
            <option value="youtube">YouTube</option>
            <option value="outro">Outro</option>
          </select>
        </div>
        <button type="submit" class="modal-diag-submit" id="modal-diag-submit">
          SOLICITAR DIAGNÓSTICO GRATUITO →
        </button>
        <p class="modal-diag-footer">Sem compromisso · Resposta em até 24h</p>
      </form>
      <div class="modal-diag-success" id="modal-diag-success" hidden>
        <div class="modal-diag-success-icon">✓</div>
        <h3>Solicitação enviada!</h3>
        <p>Recebemos seus dados e entraremos em contato em até 24 horas.</p>
        <button class="modal-diag-submit" id="modal-diag-success-close" style="margin-top:24px">Fechar</button>
      </div>
    </div>
  `;
  return el;
}

/* ─── Estado do modal ─── */
let modal = null;
let previousFocus = null;

function openModal() {
  previousFocus = document.activeElement;
  modal.removeAttribute('hidden');
  document.body.classList.add('modal-open');
  modal.offsetHeight; // força reflow
  modal.classList.add('is-open');
  setTimeout(() => {
    const first = modal.querySelector('input, select, button');
    if (first) first.focus();
  }, 80);
}

function closeModal() {
  modal.classList.remove('is-open');
  document.body.classList.remove('modal-open');
  modal.addEventListener('transitionend', () => {
    modal.setAttribute('hidden', '');
  }, { once: true });
  if (previousFocus) previousFocus.focus();
}

/* ─── Máscara WhatsApp ─── */
function maskPhone(input) {
  input.addEventListener('input', () => {
    let v = input.value.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);
    if (v.length > 6)      v = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
    else if (v.length > 2) v = `(${v.slice(0,2)}) ${v.slice(2)}`;
    else if (v.length > 0) v = `(${v}`;
    input.value = v;
  });
}

/* ─── Submissão ─── */
function handleSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('[type=submit]');
  if (!form.checkValidity()) { form.reportValidity(); return; }
  btn.textContent = 'Enviando…';
  btn.disabled = true;
  setTimeout(() => {
    form.hidden = true;
    document.getElementById('modal-diag-success').hidden = false;
  }, 1000);
}

/* ─── Trap de foco ─── */
function trapFocus(e) {
  if (!modal || !modal.classList.contains('is-open')) return;
  const focusable = [...modal.querySelectorAll(
    'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )].filter(el => !el.disabled);
  const first = focusable[0];
  const last  = focusable[focusable.length - 1];
  if (e.key === 'Tab') {
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }
  if (e.key === 'Escape') closeModal();
}

/* ─── Helper: intercepta clique e abre modal ─── */
function intercept(el) {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    openModal();
  });
}

/* ─── Inicialização ─── */
function init() {
  modal = createModal();
  document.body.appendChild(modal);

  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  modal.querySelector('#modal-diag-close').addEventListener('click', closeModal);
  modal.querySelector('#modal-diag-success-close').addEventListener('click', closeModal);
  modal.querySelector('#modal-diag-form').addEventListener('submit', handleSubmit);
  maskPhone(modal.querySelector('#diag-whatsapp'));
  document.addEventListener('keydown', trapFocus);

  // 1) Intercepta por ID/classe explícita
  TRIGGER_SELECTORS.forEach(sel => {
    document.querySelectorAll(sel).forEach(intercept);
  });

  // 2) Intercepta qualquer link que aponte para contato (independente de URL absoluta ou relativa)
  //    Funciona mesmo após o Vite reescrever URLs no build
  document.querySelectorAll('a').forEach(el => {
    const href = el.getAttribute('href') || '';
    const text = el.textContent.trim().toLowerCase();
    const isContatoLink = href.includes('contato');
    const isDiagnostico = text.includes('diagnóstico') || text.includes('diagnostico') || text.includes('solicitar');
    if (isContatoLink && isDiagnostico) {
      intercept(el);
    }
  });
}

// Módulo ES já aguarda DOMContentLoaded implicitamente via defer,
// mas checamos para garantia máxima de compatibilidade
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
