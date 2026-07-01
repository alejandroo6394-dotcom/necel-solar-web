/* ==========================================================================
   NECEL SOLAR — main.js
   Interacciones generales: header, navegación móvil, scroll reveal, contadores,
   opiniones, galería, FAQ, barra de progreso y utilidades.
   ========================================================================== */
(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.prototype.slice.call((c || document).querySelectorAll(s));

  /* =======================================================================
     1) HEADER: estado transparente / sólido y barra de progreso
     ======================================================================= */
  const header = $('#header');
  const progress = $('#scrollProgress');
  const toTop = $('#toTop');

  function onScroll() {
    const y = window.scrollY || window.pageYOffset;
    if (header) {
      if (y > 60) {
        header.classList.remove('site-header--top');
        header.classList.add('site-header--scrolled');
      } else {
        header.classList.add('site-header--top');
        header.classList.remove('site-header--scrolled');
      }
    }
    if (progress) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    }
    if (toTop) toTop.classList.toggle('show', y > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', () =>
      window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' })
    );
  }

  /* =======================================================================
     2) NAVEGACIÓN MÓVIL (menú hamburguesa)
     ======================================================================= */
  const navToggle = $('#navToggle');
  const navBackdrop = $('#navBackdrop');

  function setNav(open) {
    document.body.classList.toggle('nav-open', open);
    if (navToggle) {
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    }
  }
  if (navToggle) navToggle.addEventListener('click', () => setNav(!document.body.classList.contains('nav-open')));
  if (navBackdrop) navBackdrop.addEventListener('click', () => setNav(false));
  $$('#nav a').forEach((a) => a.addEventListener('click', () => setNav(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setNav(false); });

  /* =======================================================================
     3) SCROLL REVEAL (IntersectionObserver)
     ======================================================================= */
  const revealEls = $$('.reveal, .reveal-left, .reveal-right, .reveal-zoom');
  if (prefersReduced || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          obs.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach((el) => io.observe(el));
  }

  /* =======================================================================
     4) CONTADORES ANIMADOS (estadísticas del hero)
     ======================================================================= */
  const nf = new Intl.NumberFormat('es-ES');
  function runCounter(el) {
    const target = parseFloat(el.dataset.target) || 0;
    const suffix = el.dataset.suffix || '';
    if (prefersReduced) { el.textContent = nf.format(target) + suffix; return; }
    const dur = 1600;
    const start = performance.now();
    el.classList.add('counting');
    function frame(now) {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = nf.format(Math.round(target * eased)) + suffix;
      if (t < 1) requestAnimationFrame(frame);
      else el.textContent = nf.format(target) + suffix;
    }
    requestAnimationFrame(frame);
  }
  const heroStats = $('#heroStats');
  if (heroStats) {
    if (prefersReduced || !('IntersectionObserver' in window)) {
      $$('.counter', heroStats).forEach(runCounter);
    } else {
      const co = new IntersectionObserver((entries, obs) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            $$('.counter', heroStats).forEach(runCounter);
            obs.disconnect();
          }
        });
      }, { threshold: 0.4 });
      co.observe(heroStats);
    }
  }

  /* =======================================================================
     5) OPINIONES — 40 reseñas generadas (datos editables)
     ======================================================================= */
  // Edita libremente este array para personalizar las opiniones.
  const REVIEWS = [
    { n: 'Carlos Méndez', l: 'Barberà del Vallès', t: 'Vivienda', r: 5, c: 'Instalación impecable y en tiempo récord. El equipo me explicó cada paso y ya estoy viendo el ahorro en la factura.' },
    { n: 'Laura Giménez', l: 'Sabadell', t: 'Vivienda', r: 5, c: 'Profesionales de principio a fin. Se encargaron de toda la tramitación y las subvenciones. Muy recomendables.' },
    { n: 'Javier Ortega', l: 'Leganés', t: 'Empresa', r: 5, c: 'Pusimos placas en la nave y la diferencia en costes es brutal. Gran trabajo de ingeniería y planificación.' },
    { n: 'María Rubio', l: 'Madrid', t: 'Vivienda', r: 5, c: 'Desde el estudio inicial hasta la puesta en marcha todo fue transparente. Cero sorpresas y trato cercano.' },
    { n: 'Andreu Ferrer', l: 'Palma', t: 'Vivienda', r: 5, c: 'Muy contentos con la batería. Ahora aprovechamos la energía por la noche. Instaladores serios y limpios.' },
    { n: 'Nuria Castaño', l: 'Manises', t: 'Vivienda', r: 5, c: 'Me asesoraron sin presión y ajustaron la instalación a mi consumo real. La amortización va según lo previsto.' },
    { n: 'Pablo Sáez', l: 'Zaragoza', t: 'Empresa', r: 5, c: 'Realizaron el autoconsumo de nuestro taller. Monitorización incluida y soporte postventa excelente.' },
    { n: 'Cristina Lozano', l: 'Terrassa', t: 'Vivienda', r: 5, c: 'El cargador del coche eléctrico y las placas, todo en una sola visita técnica. Resultado de 10.' },
    { n: 'Diego Romero', l: 'Getafe', t: 'Vivienda', r: 4, c: 'Buen trabajo y materiales de calidad. Tardaron un poco más por permisos, pero el resultado merece la pena.' },
    { n: 'Sara Iglesias', l: 'Valencia', t: 'Vivienda', r: 5, c: 'Atención de 10. Resolvieron todas mis dudas y la app de monitorización es muy útil para ver la producción.' },
    { n: 'Marc Soler', l: 'Mataró', t: 'Vivienda', r: 5, c: 'Llevo seis meses y el ahorro es real. Equipo puntual, ordenado y muy profesional. Repetiría sin dudar.' },
    { n: 'Elena Navarro', l: 'Alcalá de Henares', t: 'Vivienda', r: 5, c: 'Nos gestionaron la subvención y la bonificación del IBI. Un servicio integral que se agradece muchísimo.' },
    { n: 'Rubén Pardo', l: 'Hospitalet', t: 'Empresa', r: 5, c: 'Instalación industrial perfecta. Cumplieron plazos y presupuesto. La inversión se nota desde el primer mes.' },
    { n: 'Patricia Vega', l: 'Calvià', t: 'Vivienda', r: 5, c: 'Trato exquisito y trabajo cuidadoso en una cubierta complicada. Quedó todo perfectamente integrado.' },
    { n: 'Alberto Cano', l: 'Móstoles', t: 'Vivienda', r: 5, c: 'Pedí presupuesto a varias empresas y Necel fue la más clara y honesta. Acerté de pleno. Muy recomendable.' },
    { n: 'Lucía Marín', l: 'Paterna', t: 'Vivienda', r: 5, c: 'Excelente relación calidad-precio. Los técnicos saben lo que hacen y te lo explican con paciencia.' },
    { n: 'Sergio Bravo', l: 'Rubí', t: 'Vivienda', r: 5, c: 'Instalaron 10 paneles y una batería. La factura ha bajado más de lo que esperaba. Gente seria y formal.' },
    { n: 'Marta Reyes', l: 'Fuenlabrada', t: 'Vivienda', r: 5, c: 'Desde el primer contacto se notó la profesionalidad. Estudio detallado y sin letra pequeña.' },
    { n: 'Iván Torres', l: 'Zaragoza', t: 'Empresa', r: 5, c: 'Optimización energética de nuestras oficinas. Ahora producimos gran parte de lo que consumimos. Brutal.' },
    { n: 'Beatriz Salas', l: 'Inca', t: 'Vivienda', r: 5, c: 'Limpieza, puntualidad y resultados. La instalación es elegante y apenas se ve desde la calle. Encantada.' },
    { n: 'Gonzalo Prieto', l: 'Cerdanyola', t: 'Vivienda', r: 5, c: 'Todo el proceso fue cómodo. Se encargaron del papeleo y la legalización. Yo solo tuve que disfrutar del ahorro.' },
    { n: 'Raquel Domínguez', l: 'Torrent', t: 'Vivienda', r: 4, c: 'Muy buena experiencia. El equipo técnico es excelente; solo mejoraría la rapidez en responder emails.' },
    { n: 'Fernando Gil', l: 'Madrid', t: 'Vivienda', r: 5, c: 'Asesoramiento honesto: me recomendaron una potencia ajustada y no sobredimensionar. Se nota que son ingenieros.' },
    { n: 'Alicia Méndez', l: 'Granollers', t: 'Vivienda', r: 5, c: 'Instalación rápida y resultado espectacular. La monitorización me permite ver el ahorro a diario. Genial.' },
    { n: 'Óscar Ramos', l: 'Alcorcón', t: 'Vivienda', r: 5, c: 'Cargador para el VE y placas. Coordinación perfecta y acabados de primera. Un equipo de confianza.' },
    { n: 'Silvia Campos', l: 'Sagunto', t: 'Vivienda', r: 5, c: 'Me ayudaron a entender la compensación de excedentes. Todo claro y sin compromiso. 100% recomendable.' },
    { n: 'Héctor Vidal', l: 'Sant Cugat', t: 'Vivienda', r: 5, c: 'Profesionales como la copa de un pino. Instalación impecable y un postventa que de verdad responde.' },
    { n: 'Carmen Aguilar', l: 'Llucmajor', t: 'Vivienda', r: 5, c: 'El ahorro ha superado las expectativas del estudio. Equipo amable y muy resolutivo. Repetiría seguro.' },
    { n: 'Daniel Crespo', l: 'Parla', t: 'Vivienda', r: 5, c: 'Gran trabajo. Cumplieron lo prometido al euro y al día. La instalación lleva meses sin un solo fallo.' },
    { n: 'Eva Santos', l: 'Gandia', t: 'Vivienda', r: 5, c: 'Atención personalizada y honesta. No intentan venderte de más, sino lo que realmente necesitas. Un 10.' },
    { n: 'Jordi Bosch', l: 'Badalona', t: 'Empresa', r: 5, c: 'Hicieron el autoconsumo del comercio. Reducción de costes inmediata y un equipo técnico de primer nivel.' },
    { n: 'Natalia Herrero', l: 'Utebo', t: 'Vivienda', r: 5, c: 'Desde el estudio hasta la legalización, todo perfecto. Se nota la experiencia y el cariño por el trabajo.' },
    { n: 'Adrián Molina', l: 'Pinto', t: 'Vivienda', r: 5, c: 'Muy satisfecho. Buen precio, buenos materiales y mejor trato. Ya lo he recomendado a dos vecinos.' },
    { n: 'Rocío Vargas', l: 'Manacor', t: 'Vivienda', r: 5, c: 'Instalación cuidada al detalle. Me explicaron el mantenimiento y la garantía. Tranquilidad total.' },
    { n: 'Guillermo León', l: 'Esplugues', t: 'Vivienda', r: 5, c: 'Equipo serio y cumplidor. La producción está incluso por encima de lo estimado. Encantado con el ahorro.' },
    { n: 'Teresa Ibáñez', l: 'Burjassot', t: 'Vivienda', r: 5, c: 'Profesionalidad y cercanía a partes iguales. Resolvieron una instalación compleja sin problema alguno.' },
    { n: 'Víctor Cabrera', l: 'Coslada', t: 'Empresa', r: 5, c: 'Autoconsumo para la empresa con monitorización en tiempo real. Inversión muy bien justificada. Repetiremos.' },
    { n: 'Ana Belén Ortiz', l: 'Vila-real', t: 'Vivienda', r: 5, c: 'Trato excelente desde el primer día. Me sentí acompañada en todo el proceso. El resultado, espectacular.' },
    { n: 'Pau Roca', l: 'Sant Boi', t: 'Vivienda', r: 5, c: 'Rápidos, limpios y muy profesionales. La factura de la luz ha bajado una barbaridad. Totalmente recomendados.' },
    { n: 'Miriam Fuentes', l: 'Cuarte de Huerva', t: 'Vivienda', r: 5, c: 'Necel Solar me dio la mejor propuesta y cumplió cada palabra. Equipo humano y técnico de diez. Gracias.' }
  ];

  const AV_GRAD = [
    ['#f7941d', '#ef6a18'], ['#1d6fc4', '#0f3d7a'], ['#36b37e', '#0f8a5f'],
    ['#a855f7', '#6d28d9'], ['#fb7185', '#be123c'], ['#0ea5e9', '#0369a1'],
    ['#f59e0b', '#b45309'], ['#14b8a6', '#0f766e']
  ];
  const starStr = (r) => '★★★★★'.slice(0, r) + '☆☆☆☆☆'.slice(0, 5 - r);
  function initials(name) {
    return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  }

  const reviewsEl = $('#reviews');
  if (reviewsEl) {
    const frag = document.createDocumentFragment();
    REVIEWS.forEach((rv, i) => {
      const g = AV_GRAD[i % AV_GRAD.length];
      const card = document.createElement('article');
      card.className = 'review-card';
      card.innerHTML =
        '<div class="review-card__head">' +
          '<div class="avatar" style="background:linear-gradient(135deg,' + g[0] + ',' + g[1] + ')" aria-hidden="true">' + initials(rv.n) + '</div>' +
          '<div class="review-card__who">' +
            '<div class="name">' + rv.n + '</div>' +
            '<div class="loc"><svg width="13" height="13" aria-hidden="true"><use href="#i-pin"/></svg>' + rv.l + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="stars" aria-label="' + rv.r + ' de 5 estrellas">' + starStr(rv.r) + '</div>' +
        '<p class="review-card__text">“' + rv.c + '”</p>' +
        '<div class="review-card__foot">' +
          '<span class="review-card__type">' + rv.t + '</span>' +
          '<span class="review-card__verified"><svg aria-hidden="true"><use href="#i-verified"/></svg> Verificada</span>' +
        '</div>';
      frag.appendChild(card);
    });
    reviewsEl.appendChild(frag);

    // Navegación por flechas
    const prev = $('#reviewsPrev');
    const next = $('#reviewsNext');
    const scrollAmt = () => {
      const first = reviewsEl.querySelector('.review-card');
      return first ? first.getBoundingClientRect().width + 20 : 350;
    };
    if (prev) prev.addEventListener('click', () => reviewsEl.scrollBy({ left: -scrollAmt(), behavior: 'smooth' }));
    if (next) next.addEventListener('click', () => reviewsEl.scrollBy({ left: scrollAmt(), behavior: 'smooth' }));
  }

  /* =======================================================================
     6) GALERÍA — filtros por categoría
     ======================================================================= */
  const filters = $$('#galleryFilters .filter-btn');
  const items = $$('#gallery .gallery-item');
  filters.forEach((btn) => {
    btn.addEventListener('click', () => {
      filters.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const f = btn.dataset.filter;
      items.forEach((it) => {
        const show = f === 'all' || it.dataset.cat === f;
        it.classList.toggle('is-hide', !show);
      });
    });
  });

  /* =======================================================================
     7) FAQ — acordeón accesible
     ======================================================================= */
  $$('#faq .faq-item').forEach((item) => {
    const btn = $('.faq-q', item);
    const ans = $('.faq-a', item);
    if (!btn || !ans) return;
    btn.addEventListener('click', () => {
      const open = item.classList.contains('is-open');
      // Cierra los demás (comportamiento de acordeón)
      $$('#faq .faq-item.is-open').forEach((other) => {
        if (other !== item) {
          other.classList.remove('is-open');
          $('.faq-q', other).setAttribute('aria-expanded', 'false');
          $('.faq-a', other).style.maxHeight = null;
        }
      });
      item.classList.toggle('is-open', !open);
      btn.setAttribute('aria-expanded', String(!open));
      ans.style.maxHeight = open ? null : ans.scrollHeight + 'px';
    });
  });
  // Recalcula alturas abiertas al redimensionar
  window.addEventListener('resize', () => {
    $$('#faq .faq-item.is-open .faq-a').forEach((a) => { a.style.maxHeight = a.scrollHeight + 'px'; });
  });

  /* =======================================================================
     8) NAV ACTIVO según la sección visible
     ======================================================================= */
  const sections = ['inicio', 'servicios', 'proyectos', 'calculadora', 'opiniones', 'contacto']
    .map((id) => document.getElementById(id)).filter(Boolean);
  const navLinks = $$('#nav .nav__link');
  if (sections.length && 'IntersectionObserver' in window) {
    const so = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          const id = en.target.id;
          navLinks.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === '#' + id));
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => so.observe(s));
  }

  /* =======================================================================
     9) CTA calculadora → prerrellena el formulario de contacto
     ======================================================================= */
  const resCta = $('#resCta');
  if (resCta) {
    resCta.addEventListener('click', () => {
      const r = window.NecelCalc && window.NecelCalc.getLast();
      if (!r) return;
      const billField = $('#cBill');
      const msgField = $('#cMessage');
      if (billField) billField.value = r.bill;
      if (msgField && !msgField.value) {
        msgField.value =
          'Hola, he usado la calculadora solar. Estimación: instalación de ' + r.kwp +
          ' kWp (' + r.panels + ' paneles), ahorro aproximado de ' +
          window.NecelCalc.format.nf0.format(r.annualSavings) + ' €/año. Me gustaría un estudio personalizado.';
      }
    });
  }

  /* =======================================================================
     10) Año del footer
     ======================================================================= */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
