(function (root) {
  'use strict';

  const isAmount = value => Number.isFinite(value) && value >= 0;
  const sum = values => values.reduce((total, value) => total + value, 0);

  function calculate(data) {
    const errors = [];
    const range = (name, min, max, integer = false) => {
      const value = data[name];
      if (!Number.isFinite(value) || value < min || value > max || (integer && !Number.isInteger(value))) errors.push(name);
    };
    range('pisos', 1, 15, true);
    range('frente', 0.1, 1000);
    range('fondo', 0.1, 1000);
    range('cobertura', 1, 100);
    range('aptos', 1, 100, true);
    range('altura', 2, 6);
    range('dosificacion', 0.1, 30);
    range('capacidadViaje', 1, 10000, true);
    range('viajesExtra', 0, 1000, true);
    range('plazoMeses', 1, 60, true);
    range('esperaAnios', 0, 5, true);
    range('objetivoAnios', 1, 20, true);
    if (data.compararSolar) range('kwApto', 0.1, 100);
    if (errors.length) return { errors };

    const area = data.frente * data.fondo;
    const areaConstruida = area * data.cobertura / 100 * data.pisos;
    const apartamentos = data.aptos * data.pisos;
    const excavacion = area * 1.4;
    const columnas = (Math.ceil(data.frente / 5) + 1) * (Math.ceil(data.fondo / 5) + 1);
    const concretoColumnas = columnas * 0.3 * 0.3 * data.altura * data.pisos;
    const bultos = Math.ceil(concretoColumnas * data.dosificacion);
    const viajes = Math.ceil(bultos / data.capacidadViaje) + data.viajesExtra;
    const potenciaSolar = apartamentos * (data.kwApto || 0);
    const rows = [];
    const add = (phase, label, quantity, unit, priceKey, optional = false) => {
      const price = data[priceKey];
      rows.push({ phase, label, quantity, unit, priceKey, price, optional,
        cost: isAmount(price) ? quantity * price : null });
    };
    add('Preparación', 'Excavación a 1,4 m', excavacion, 'm³', 'excPrecio');
    add('Preparación', 'Retiro y disposición de excavación', excavacion, 'm³', 'retiroPrecio');
    add('Preparación', 'Valor del terreno u oportunidad de uso', 1, 'total', 'terrenoPrecio');
    if (data.existente) add('Preparación', 'Demolición, adaptación o refuerzo', 1, 'total', 'intervencionPrecio');
    add('Estructura', 'Cemento de columnas ilustrativas', bultos, 'bultos', 'cementoPrecio');
    add('Estructura', 'Viajes de material, incluido cemento', viajes, 'viajes', 'viajePrecio');
    add('Estructura', 'Estructura complementaria y mano de obra', areaConstruida, 'm²', 'estructuraPrecio');
    add('Estructura', 'Ingeniero estructural', 1, 'total', 'ingenieroPrecio');
    add('Instalaciones', 'Tuberías y cableado interior', apartamentos, 'apartamentos', 'redesPrecio');
    add('Instalaciones', 'Conexión de agua', 1, 'total', 'aguaPrecio');
    add('Instalaciones', 'Conexión de electricidad', 1, 'total', 'luzPrecio');
    add('Instalaciones', 'Conexión de gas', 1, 'total', 'gasPrecio');
    add('Instalaciones', 'Conexión de internet o señal', 1, 'total', 'senalPrecio');
    add('Acabados', 'Acabados de nivel elegido', areaConstruida, 'm²', 'acabadosPrecio');
    add('Acabados', 'Otros costos de obra, licencias y reserva', 1, 'total', 'otrosPrecio');
    const solarRows = [];
    if (data.compararSolar) {
      const solarAdd = (label, quantity, unit, priceKey, optional = false) => {
        const price = data[priceKey];
        solarRows.push({ phase:'Solar', label, quantity, unit, priceKey, price, optional,
          cost:isAmount(price) ? quantity * price : null });
      };
      solarAdd('Adquisición de paneles', potenciaSolar, 'kW', 'panelPrecio');
      solarAdd('Inversor, estructura, protecciones, cableado e instalación', potenciaSolar, 'kW', 'solarRestoPrecio');
      solarAdd('Generador o baterías opcionales', 1, 'total', 'respaldoPrecio', true);
    }
    const requiredRows = rows.concat(solarRows.filter(row => !row.optional));
    const missing = requiredRows.filter(row => row.cost === null).map(row => row.label);
    const baseCost = sum(rows.map(row => row.cost || 0));
    const solarCost = sum(solarRows.map(row => row.cost || 0));
    const phases = [
      { name:'Preparación', time:0 },
      { name:'Estructura', time:data.plazoMeses / 12 * .25 },
      { name:'Instalaciones', time:data.plazoMeses / 12 * .6 },
      { name:'Acabados', time:data.plazoMeses / 12 * .9 },
      { name:'Solar', time:data.plazoMeses / 12 * .9 }
    ];
    const escalation = [3, 6, 9].map(rate => ({ rate,
      total: sum(phases.map(phase =>
        sum(rows.concat(solarRows).filter(row => row.phase === phase.name).map(row => row.cost || 0)) *
          Math.pow(1 + rate / 100, data.esperaAnios + phase.time))) }));

    const financeKeys = ['arriendo', 'ocupacion', 'mantenimiento', 'predial', 'salvamento'];
    if (data.compararSolar) financeKeys.push('ahorroSolar', 'mantSolar', 'salvamentoSolar');
    const missingFinance = financeKeys.filter(key => !isAmount(data[key]));
    if (isAmount(data.ocupacion) && data.ocupacion > 100) missingFinance.push('ocupacion');
    const ready = missing.length === 0 && missingFinance.length === 0;
    let finance = null;
    if (ready) {
      const annualRent = data.arriendo * apartamentos * 12 * data.ocupacion / 100;
      const annualBase = annualRent - data.mantenimiento - data.predial;
      const annualSolar = annualBase + (data.ahorroSolar || 0) - (data.mantSolar || 0);
      const constructionYears = data.plazoMeses / 12;
      const operatingFraction = year => Math.max(0, Math.min(1, year - constructionYears));
      const baseYear = year => (annualRent - data.mantenimiento) * operatingFraction(year) - data.predial;
      const solarYear = year => baseYear(year) +
        ((data.ahorroSolar || 0) - (data.mantSolar || 0)) * operatingFraction(year);
      const build = (initial, annual, salvage, yearCash) => {
        const cashflow = [{year:0, cash:-initial, cumulative:-initial, discounted:-initial}];
        let cumulative = -initial, discounted = -initial;
        let payback = initial === 0 ? 0 : null;
        let discountedPayback = initial === 0 ? 0 : null;
        for (let year = 1; year <= 20; year++) {
          const cash = yearCash(year) + (year === 20 ? salvage : 0);
          const beforeCumulative = cumulative, beforeDiscounted = discounted;
          cumulative += cash;
          discounted += cash / Math.pow(1.06, year);
          if (payback === null && beforeCumulative < 0 && cumulative >= 0) payback = year;
          if (discountedPayback === null && beforeDiscounted < 0 && discounted >= 0) discountedPayback = year;
          cashflow.push({year, cash, cumulative, discounted});
        }
        return {initial, annual, salvage, cashflow, payback, discountedPayback,
          npv5:cashflow[5].discounted, npv20:cashflow[20].discounted};
      };
      const without = build(baseCost, annualBase, data.salvamento, baseYear);
      const withSolar = data.compararSolar ? build(baseCost + solarCost, annualSolar,
        data.salvamento + data.salvamentoSolar, solarYear) : null;
      const presentOperatingYears = sum(Array.from({length:data.objetivoAnios}, (_, i) =>
        operatingFraction(i + 1) / Math.pow(1.06, i + 1)));
      const presentPredialYears = sum(Array.from({length:data.objetivoAnios}, (_, i) =>
        1 / Math.pow(1.06, i + 1)));
      const requiredMonthlyRent = presentOperatingYears > 0 && data.ocupacion > 0
        ? Math.max(0, (baseCost + data.mantenimiento * presentOperatingYears +
          data.predial * presentPredialYears -
          (data.objetivoAnios === 20 ? data.salvamento / Math.pow(1.06, 20) : 0)) /
          (presentOperatingYears * apartamentos * 12 * data.ocupacion / 100))
        : null;
      finance = { annualRent, constructionYears, without, withSolar,
        objectiveYear:data.objetivoAnios,
        requiredMonthlyRent,
        objectiveNpv:without.cashflow[data.objetivoAnios].discounted,
        delta5:withSolar ? withSolar.npv5 - without.npv5 : null,
        delta20:withSolar ? withSolar.npv20 - without.npv20 : null };
    }
    return { errors:[], area, areaConstruida, apartamentos, excavacion, columnas, concretoColumnas,
      bultos, viajes, potenciaSolar, rows, solarRows, missing, missingFinance, ready,
      baseCost, solarCost, escalation, finance };
  }

  const api = { calculate };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.ConstruplanModel = api;
})(typeof window !== 'undefined' ? window : globalThis);
