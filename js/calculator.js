/* ==========================================================================
   NECEL SOLAR — calculator.js
   Calculadora solar interactiva. Estima ahorro, instalación recomendada,
   amortización y CO₂ evitado a partir de la factura, el tipo de instalación,
   la provincia y el consumo.

   El modelo es ORIENTATIVO y editable: revisa el objeto CONFIG y la tabla
   PROVINCES (productividad media en kWh por kWp y año) para ajustarlo.
   ========================================================================== */
(function () {
  'use strict';

  /* ----------------------------- Configuración ----------------------------- */
  const CONFIG = {
    // Precio medio del kWh (incluye energía + peajes + impuestos), €/kWh
    price: { vivienda: 0.24, empresa: 0.18 },
    // Precio de compensación de excedentes, €/kWh
    surplusPrice: 0.07,
    // Ratio de autoconsumo (energía producida que se aprovecha directamente)
    selfRatio: { vivienda: 0.62, empresa: 0.78 },
    // Potencia de cada panel (kWp). 450 Wp = 0.45 kWp
    panelKwp: 0.45,
    // Potencia mínima recomendada por tipo (kWp)
    minKwp: { vivienda: 2.0, empresa: 5.0 },
    // Coste por kWp instalado según tramo de potencia (€/kWp), llave en mano
    costTiers: {
      vivienda: [[3, 1650], [5, 1480], [8, 1320], [Infinity, 1180]],
      empresa: [[10, 1100], [30, 950], [Infinity, 820]]
    },
    // Factor de emisiones evitadas del mix eléctrico español (kg CO₂ / kWh)
    co2Factor: 0.25,
    // Tope de reducción de factura mostrado (%)
    maxReductionPct: 85
  };

  /* ----------- Productividad solar por provincia (kWh / kWp · año) ---------- */
  // Valores medios orientativos de generación para una instalación bien
  // orientada. Editables y ampliables según necesidades.
  const PROVINCES = [
    { v: 'almeria', n: 'Almería', p: 1680 },
    { v: 'cadiz', n: 'Cádiz', p: 1660 },
    { v: 'cordoba', n: 'Córdoba', p: 1650 },
    { v: 'granada', n: 'Granada', p: 1640 },
    { v: 'huelva', n: 'Huelva', p: 1660 },
    { v: 'jaen', n: 'Jaén', p: 1630 },
    { v: 'malaga', n: 'Málaga', p: 1650 },
    { v: 'sevilla', n: 'Sevilla', p: 1660 },
    { v: 'badajoz', n: 'Badajoz', p: 1620 },
    { v: 'caceres', n: 'Cáceres', p: 1600 },
    { v: 'ciudad-real', n: 'Ciudad Real', p: 1600 },
    { v: 'toledo', n: 'Toledo', p: 1580 },
    { v: 'albacete', n: 'Albacete', p: 1580 },
    { v: 'cuenca', n: 'Cuenca', p: 1560 },
    { v: 'madrid', n: 'Madrid', p: 1560 },
    { v: 'alicante', n: 'Alicante', p: 1620 },
    { v: 'valencia', n: 'València', p: 1580 },
    { v: 'castellon', n: 'Castelló', p: 1560 },
    { v: 'murcia', n: 'Murcia', p: 1640 },
    { v: 'baleares', n: 'Illes Balears', p: 1570 },
    { v: 'zaragoza', n: 'Zaragoza', p: 1520 },
    { v: 'huesca', n: 'Huesca', p: 1500 },
    { v: 'teruel', n: 'Teruel', p: 1540 },
    { v: 'barcelona', n: 'Barcelona', p: 1480 },
    { v: 'tarragona', n: 'Tarragona', p: 1520 },
    { v: 'girona', n: 'Girona', p: 1470 },
    { v: 'lleida', n: 'Lleida', p: 1520 },
    { v: 'valladolid', n: 'Valladolid', p: 1480 },
    { v: 'salamanca', n: 'Salamanca', p: 1500 },
    { v: 'burgos', n: 'Burgos', p: 1440 },
    { v: 'leon', n: 'León', p: 1440 },
    { v: 'zamora', n: 'Zamora', p: 1480 },
    { v: 'segovia', n: 'Segovia', p: 1500 },
    { v: 'avila', n: 'Ávila', p: 1500 },
    { v: 'palencia', n: 'Palencia', p: 1460 },
    { v: 'soria', n: 'Soria', p: 1500 },
    { v: 'navarra', n: 'Navarra', p: 1420 },
    { v: 'rioja', n: 'La Rioja', p: 1450 },
    { v: 'guadalajara', n: 'Guadalajara', p: 1540 },
    { v: 'alava', n: 'Álava', p: 1350 },
    { v: 'vizcaya', n: 'Bizkaia', p: 1250 },
    { v: 'guipuzcoa', n: 'Gipuzkoa', p: 1230 },
    { v: 'cantabria', n: 'Cantabria', p: 1240 },
    { v: 'asturias', n: 'Asturias', p: 1220 },
    { v: 'a-coruna', n: 'A Coruña', p: 1230 },
    { v: 'lugo', n: 'Lugo', p: 1240 },
    { v: 'ourense', n: 'Ourense', p: 1320 },
    { v: 'pontevedra', n: 'Pontevedra', p: 1280 },
    { v: 'laspalmas', n: 'Las Palmas', p: 1750 },
    { v: 'tenerife', n: 'Sta. Cruz de Tenerife', p: 1740 }
  ];

  const DEFAULT_PROVINCE = 'barcelona';

  /* ------------------------------ Utilidades ------------------------------- */
  const nf0 = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 });
  const nf1 = new Intl.NumberFormat('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const eur = (n) => nf0.format(Math.round(n)) + ' €';
  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));

  function costPerKwp(type, kwp) {
    const tiers = CONFIG.costTiers[type] || CONFIG.costTiers.vivienda;
    for (const [limit, cost] of tiers) {
      if (kwp <= limit) return cost;
    }
    return tiers[tiers.length - 1][1];
  }

  /* --------------------------- Cálculo principal --------------------------- */
  function compute(input) {
    const type = input.type === 'empresa' ? 'empresa' : 'vivienda';
    const bill = clamp(Number(input.bill) || 0, 20, 5000);
    const prod = Number(input.prod) || 1500;               // kWh/kWp·año
    const price = CONFIG.price[type];

    const annualBill = bill * 12;
    // Consumo anual (kWh): usa el del usuario o lo estima a partir de la factura
    const monthlyConsumption = Number(input.consumption) || (annualBill / price) / 12;
    const annualConsumption = Math.max(600, monthlyConsumption * 12);

    // Dimensionado: producir aproximadamente el consumo anual
    let kwp = annualConsumption / prod;
    kwp = Math.max(CONFIG.minKwp[type], kwp);
    let panels = Math.max(Math.ceil(CONFIG.minKwp[type] / CONFIG.panelKwp), Math.round(kwp / CONFIG.panelKwp));
    kwp = panels * CONFIG.panelKwp;

    const production = kwp * prod;                          // kWh/año generados
    const selfConsumed = Math.min(production * CONFIG.selfRatio[type], annualConsumption);
    const surplus = Math.max(0, production - selfConsumed);

    let annualSavings = selfConsumed * price + surplus * CONFIG.surplusPrice;
    // El ahorro sobre la factura no puede superar el importe facturado
    annualSavings = Math.min(annualSavings, annualBill * 0.97 + surplus * CONFIG.surplusPrice);

    let reductionPct = clamp((annualSavings / annualBill) * 100, 8, CONFIG.maxReductionPct);

    const investment = kwp * costPerKwp(type, kwp);
    const payback = clamp(investment / annualSavings, 3, 14);
    const co2 = production * CONFIG.co2Factor;

    return {
      type, bill, annualBill,
      annualConsumption: Math.round(annualConsumption),
      kwp: Math.round(kwp * 10) / 10,
      panels,
      production: Math.round(production),
      annualSavings: Math.round(annualSavings),
      monthlySavings: Math.round(annualSavings / 12),
      reductionPct: Math.round(reductionPct),
      payback: Math.round(payback * 10) / 10,
      co2: Math.round(co2),
      investment: Math.round(investment)
    };
  }

  /* --------------------------- Render / animación -------------------------- */
  function animateValue(el, to, opts) {
    opts = opts || {};
    const dur = opts.duration || 900;
    const dec = opts.decimals || 0;
    const start = performance.now();
    const from = 0;
    const fmt = dec ? nf1 : nf0;
    function frame(now) {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = from + (to - from) * eased;
      el.textContent = fmt.format(dec ? Math.round(val * 10) / 10 : Math.round(val));
      if (t < 1) requestAnimationFrame(frame);
      else el.textContent = fmt.format(dec ? to : Math.round(to));
    }
    requestAnimationFrame(frame);
  }

  let lastResult = null;

  function render(r, animate) {
    lastResult = r;
    const $ = (id) => document.getElementById(id);
    const placeholder = $('calcPlaceholder');
    const output = $('calcOutput');
    if (placeholder) placeholder.classList.add('is-hidden');
    if (output) output.classList.remove('is-hidden');

    if (animate) {
      animateValue($('resAnnual'), r.annualSavings);
      animateValue($('resPower'), r.kwp, { decimals: 1 });
      animateValue($('resPanels'), r.panels);
      animateValue($('resPayback'), r.payback, { decimals: 1 });
      animateValue($('resCo2'), r.co2);
    } else {
      $('resAnnual').textContent = nf0.format(r.annualSavings);
      $('resPower').textContent = nf1.format(r.kwp);
      $('resPanels').textContent = nf0.format(r.panels);
      $('resPayback').textContent = nf1.format(r.payback);
      $('resCo2').textContent = nf0.format(r.co2);
    }
    // Restaura el sufijo "kWp"/"años"/"kg" que el textContent ha podido borrar
    $('resPower').innerHTML = nf1.format(r.kwp) + ' <small>kWp</small>';
    $('resPayback').innerHTML = nf1.format(r.payback) + ' <small>años</small>';
    $('resCo2').innerHTML = nf0.format(r.co2) + ' <small>kg</small>';

    $('resMonthly').textContent = eur(r.monthlySavings);
    $('resPctLabel').textContent = r.reductionPct + '%';
    requestAnimationFrame(() => {
      const bar = $('resBar');
      if (bar) bar.style.width = r.reductionPct + '%';
    });
  }

  /* ------------------------------ Inicio / DOM ----------------------------- */
  function readInput() {
    const billEl = document.getElementById('calcBill');
    const provEl = document.getElementById('calcProvince');
    const consEl = document.getElementById('calcConsumption');
    const typeEl = document.querySelector('input[name="type"]:checked');
    const opt = provEl && provEl.selectedOptions[0];
    return {
      bill: billEl ? billEl.value : 120,
      type: typeEl ? typeEl.value : 'vivienda',
      prod: opt ? Number(opt.dataset.prod) : 1480,
      consumption: consEl && consEl.dataset.touched ? Number(consEl.value) : null
    };
  }

  function recalc(animate) {
    render(compute(readInput()), !!animate);
  }

  function init() {
    const form = document.getElementById('calcForm');
    if (!form) return;

    // Rellena el selector de provincias
    const sel = document.getElementById('calcProvince');
    if (sel && !sel.options.length) {
      const frag = document.createDocumentFragment();
      PROVINCES.forEach((pr) => {
        const o = document.createElement('option');
        o.value = pr.v;
        o.textContent = pr.n;
        o.dataset.prod = pr.p;
        if (pr.v === DEFAULT_PROVINCE) o.selected = true;
        frag.appendChild(o);
      });
      sel.appendChild(frag);
    }

    const billEl = document.getElementById('calcBill');
    const consEl = document.getElementById('calcConsumption');
    const consVal = document.getElementById('consumptionVal');
    const typeRadios = document.querySelectorAll('input[name="type"]');

    // Sincroniza el consumo estimado a partir de la factura (si no se ha tocado)
    function syncConsumptionFromBill() {
      if (!consEl || consEl.dataset.touched) return;
      const type = (document.querySelector('input[name="type"]:checked') || {}).value || 'vivienda';
      const price = CONFIG.price[type === 'empresa' ? 'empresa' : 'vivienda'];
      const bill = clamp(Number(billEl.value) || 0, 20, 5000);
      const est = clamp(Math.round(((bill * 12) / price) / 12 / 50) * 50, 100, 4000);
      consEl.value = est;
      if (consVal) consVal.textContent = nf0.format(est) + ' kWh';
    }

    function updateConsLabel() {
      if (consVal && consEl) consVal.textContent = nf0.format(Number(consEl.value)) + ' kWh';
    }

    if (billEl) billEl.addEventListener('input', () => { syncConsumptionFromBill(); recalc(false); });
    typeRadios.forEach((r) => r.addEventListener('change', () => { syncConsumptionFromBill(); recalc(false); }));
    if (sel) sel.addEventListener('change', () => recalc(false));
    if (consEl) consEl.addEventListener('input', () => {
      consEl.dataset.touched = '1';
      updateConsLabel();
      recalc(false);
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      recalc(true);
      const out = document.getElementById('calcResult');
      if (out && window.matchMedia('(max-width: 980px)').matches) {
        out.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });

    // Estado inicial coherente
    syncConsumptionFromBill();
    updateConsLabel();
  }

  // API pública para que otros scripts (p. ej. forms) usen el último resultado
  window.NecelCalc = {
    getLast: () => lastResult,
    compute: compute,
    format: { eur, nf0, nf1 }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
