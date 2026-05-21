/* =========================================
   CATALISE.ME — CONTACT FORM JS
   ========================================= */

'use strict';

(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const formFields = form;
  const successMsg = document.getElementById('form-success');
  const submitBtn = form.querySelector('[type="submit"]');

  // ─── Validation rules ───
  const validators = {
    name: (v) => v.trim().length >= 2 || 'Informe seu nome completo',
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Email inválido',
    company: (v) => v.trim().length >= 2 || 'Informe sua empresa e cargo',
    revenue: (v) => !!v || 'Selecione seu faturamento',
    message: (v) => v.trim().length >= 10 || 'Conte um pouco mais (mínimo 10 caracteres)',
  };

  function getField(name) {
    return form.querySelector(`[name="${name}"]`);
  }

  function getGroup(field) {
    return field?.closest('.form-group');
  }

  function showError(field, msg) {
    const group = getGroup(field);
    if (!group) return;
    group.classList.add('has-error');
    const errEl = group.querySelector('.form-error');
    if (errEl) errEl.textContent = msg;
  }

  function clearError(field) {
    const group = getGroup(field);
    if (!group) return;
    group.classList.remove('has-error');
  }

  function validateField(name) {
    const field = getField(name);
    const validator = validators[name];
    if (!field || !validator) return true;
    const result = validator(field.value);
    if (result !== true) {
      showError(field, result);
      return false;
    }
    clearError(field);
    return true;
  }

  // Real-time validation on blur
  ['name', 'email', 'company', 'revenue', 'message'].forEach(name => {
    const field = getField(name);
    if (field) {
      field.addEventListener('blur', () => validateField(name));
      field.addEventListener('input', () => {
        const group = getGroup(field);
        if (group?.classList.contains('has-error')) validateField(name);
      });
    }
  });

  // ─── Submit ───
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate all required fields
    const valid = ['name', 'email', 'company', 'revenue', 'message']
      .map(validateField)
      .every(Boolean);

    if (!valid) return;

    // Gather data
    const data = {
      name: getField('name')?.value.trim(),
      email: getField('email')?.value.trim(),
      company: getField('company')?.value.trim(),
      revenue: getField('revenue')?.value || '',
      message: getField('message')?.value.trim(),
      phone: getField('phone')?.value.trim() || '',
      source: getField('source')?.value || '',
      page_url: window.location.href,
      referrer: document.referrer || '',
      utm_source: new URLSearchParams(window.location.search).get('utm_source') || '',
      utm_medium: new URLSearchParams(window.location.search).get('utm_medium') || '',
      utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign') || '',
      submitted_at: new Date().toISOString(),
    };

    // Loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    try {
      // ─── ENDPOINT LARK (substituir pela URL real) ───
      const LARK_ENDPOINT = 'https://triviumlabs.sg.larksuite.com/base/automation/webhook/event/THgIaGzH4wWd2lhVeDtlC4D5gAh';

      if (LARK_ENDPOINT === 'LARK_ENDPOINT_PLACEHOLDER') {
        // Dev mode: simulate success after 1s
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        await fetch(LARK_ENDPOINT, {
          method: 'POST',
          mode: 'no-cors', // Ignora política de CORS do navegador
          headers: { 'Content-Type': 'text/plain' }, // Evita preflight do navegador
          body: JSON.stringify(data),
        });
        // Opaque response returns status 0 (res.ok is false), we assume success se não houver erro de rede
      }

      // Show success
      formFields.style.display = 'none';
      if (successMsg) successMsg.classList.add('visible');

      // Track event (GA4 if available)
      if (typeof gtag === 'function') {
        gtag('event', 'form_submit', { event_category: 'contact', event_label: 'diagnostico' });
      }

    } catch (err) {
      console.error(err);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Quero meu diagnóstico gratuito →';
      alert('Ops! Algo deu errado. Por favor, fale com a gente pelo WhatsApp: (75) 99187-9786');
    }
  });

})();
