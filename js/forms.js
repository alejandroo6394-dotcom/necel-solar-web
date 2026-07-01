/* ==========================================================================
   NECEL SOLAR — forms.js
   Validación del formulario de contacto, estados de envío y mensaje de
   confirmación. Preparado para conectar con Email / CRM / Backend.

   CÓMO CONECTAR EL FORMULARIO (elige una opción):
   1) Servicio externo (Formspree, Getform, Web3Forms...):
        CONFIG.endpoint = 'https://formspree.io/f/XXXXXXX';
   2) Tu propio backend / CRM:
        CONFIG.endpoint = 'https://tudominio.com/api/leads';
   Si CONFIG.endpoint es null, el formulario funciona en modo demostración:
   valida los datos y muestra el mensaje de confirmación sin enviar nada.
   ========================================================================== */
(function () {
  'use strict';

  const CONFIG = {
    endpoint: null,          // <-- pon aquí la URL de tu endpoint para activar el envío real
    method: 'POST',
    // Tiempo simulado de envío en modo demostración (ms)
    demoDelay: 1100
  };

  const form = document.getElementById('contactForm');
  if (!form) return;

  const submitBtn = document.getElementById('contactSubmit');
  const okBox = document.getElementById('formOk');
  const errBox = document.getElementById('formErr');

  // Campo oculto para registrar el origen del lead (botón/sección)
  const originField = document.createElement('input');
  originField.type = 'hidden';
  originField.name = 'origin';
  originField.value = 'web';
  form.appendChild(originField);

  document.querySelectorAll('[data-cta]').forEach((el) => {
    el.addEventListener('click', () => { originField.value = el.getAttribute('data-cta'); });
  });

  /* ------------------------------ Validación ------------------------------- */
  const validators = {
    cName: (v) => v.trim().length >= 2,
    cPhone: (v) => /^[+()\s\d.-]{7,18}$/.test(v.trim()) && (v.replace(/\D/g, '').length >= 9),
    cEmail: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())
  };

  function fieldError(id, show) {
    const input = document.getElementById(id);
    const msg = form.querySelector('.error-msg[data-for="' + id + '"]');
    if (input) input.classList.toggle('is-invalid', show);
    if (msg) msg.classList.toggle('show', show);
  }

  function validateField(id) {
    const input = document.getElementById(id);
    if (!input) return true;
    const ok = validators[id] ? validators[id](input.value) : true;
    fieldError(id, !ok);
    return ok;
  }

  // Validación en vivo: limpia el error al corregir
  Object.keys(validators).forEach((id) => {
    const input = document.getElementById(id);
    if (!input) return;
    input.addEventListener('blur', () => validateField(id));
    input.addEventListener('input', () => { if (input.classList.contains('is-invalid')) validateField(id); });
  });

  const consent = document.getElementById('cConsent');
  if (consent) consent.addEventListener('change', () => consent.classList.remove('is-invalid'));

  function validateAll() {
    let ok = true;
    Object.keys(validators).forEach((id) => { if (!validateField(id)) ok = false; });
    if (consent && !consent.checked) {
      consent.classList.add('is-invalid');
      ok = false;
    }
    return ok;
  }

  /* ------------------------------- Estados --------------------------------- */
  function setLoading(loading) {
    if (!submitBtn) return;
    submitBtn.classList.toggle('is-loading', loading);
    submitBtn.disabled = loading;
  }
  function hideFeedback() {
    if (okBox) okBox.classList.remove('show');
    if (errBox) errBox.classList.remove('show');
  }
  function showOk() { hideFeedback(); if (okBox) { okBox.classList.add('show'); okBox.scrollIntoView({ behavior: 'smooth', block: 'center' }); } }
  function showErr() { hideFeedback(); if (errBox) errBox.classList.add('show'); }

  /* -------------------------------- Envío ---------------------------------- */
  async function sendData(data) {
    if (!CONFIG.endpoint) {
      // Modo demostración: simula una respuesta correcta
      await new Promise((res) => setTimeout(res, CONFIG.demoDelay));
      return { ok: true, demo: true };
    }
    const resp = await fetch(CONFIG.endpoint, {
      method: CONFIG.method,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data)
    });
    return { ok: resp.ok };
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideFeedback();
    if (!validateAll()) {
      const firstInvalid = form.querySelector('.is-invalid');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());
    data.submittedAt = new Date().toISOString();
    data.page = location.href;

    setLoading(true);
    try {
      const result = await sendData(data);
      if (result.ok) {
        showOk();
        form.reset();
        // Restaura el origen tras el reset
        originField.value = 'web';
      } else {
        showErr();
      }
    } catch (err) {
      showErr();
    } finally {
      setLoading(false);
    }
  });
})();
