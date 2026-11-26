const test = require('node:test');
const assert = require('node:assert/strict');
const { calculate } = require('../public/model.js');

const base = () => ({
  pisos:5, frente:10, fondo:20, cobertura:80, aptos:2,
  altura:2.7, dosificacion:7, capacidadViaje:100, viajesExtra:2,
  plazoMeses:12, esperaAnios:0, objetivoAnios:10, jornadasTransporte:0, personasCuadrilla:1, transporteDiarioPrecio:NaN, kwApto:1, existente:false, compararSolar:true,
  excPrecio:0, retiroPrecio:0, terrenoPrecio:0, intervencionPrecio:NaN,
  cementoPrecio:0, viajePrecio:0, estructuraPrecio:0, ingenieroPrecio:0,
  redesPrecio:0, aguaPrecio:0, luzPrecio:0, gasPrecio:0, senalPrecio:0,
  acabadosPrecio:0, otrosPrecio:0, panelPrecio:0, solarRestoPrecio:0,
  respaldoPrecio:NaN, arriendo:0, ocupacion:90, mantenimiento:0,
  predial:0, salvamento:0, ahorroSolar:0, mantSolar:0, salvamentoSolar:0
});

test('calculates 1.4 m excavation, column geometry, bags and material trips', () => {
  const result = calculate(base());
  assert.deepEqual(result.errors, []);
  assert.equal(result.area, 200);
  assert.equal(result.excavacion, 280);
  assert.equal(result.columnas, 15);
  assert.ok(Math.abs(result.concretoColumnas - 18.225) < 1e-9);
  assert.equal(result.bultos, 128);
  assert.equal(result.viajes, 4);
  assert.equal(result.apartamentos, 10);
  assert.equal(result.areaConstruida, 800);
});

test('solar can lose money at year 5 but improve discounted value at year 20', () => {
  const data = base();
  data.pisos = 1; data.aptos = 1;
  data.panelPrecio = 1000; data.solarRestoPrecio = 0;
  data.ahorroSolar = 200;
  const result = calculate(data);
  assert.equal(result.ready, true);
  assert.equal(result.solarCost, 1000);
  assert.ok(result.finance.delta5 < 0);
  assert.ok(result.finance.delta20 > 0);
  assert.equal(result.finance.withSolar.cashflow[0].cash, -1000);
  assert.equal(result.finance.withSolar.cashflow[1].cash, 0);
  assert.equal(result.finance.withSolar.cashflow[2].cash, 200);
});

test('salvage enters only in year 20 and is discounted once', () => {
  const data = base();
  data.salvamento = 1000;
  const result = calculate(data);
  assert.equal(result.finance.without.cashflow[19].cash, 0);
  assert.equal(result.finance.without.cashflow[20].cash, 1000);
  assert.ok(Math.abs(result.finance.without.npv20 - 1000 / 1.06 ** 20) < 1e-6);
});

test('missing quoted costs and financial inputs prevent a false recovery result', () => {
  const data = base();
  data.acabadosPrecio = NaN;
  data.predial = NaN;
  const result = calculate(data);
  assert.equal(result.ready, false);
  assert.equal(result.finance, null);
  assert.ok(result.missing.includes('Acabados de nivel elegido'));
  assert.ok(result.missingFinance.includes('predial'));
});

test('rejects projects beyond the 15-floor limit', () => {
  const data = base(); data.pisos = 16;
  assert.ok(calculate(data).errors.includes('pisos'));
});

test('base-only mode excludes solar costs and solar savings', () => {
  const data = base();
  data.compararSolar = false;
  data.panelPrecio = NaN;
  data.solarRestoPrecio = NaN;
  data.ahorroSolar = NaN;
  data.mantSolar = NaN;
  data.salvamentoSolar = NaN;
  const result = calculate(data);
  assert.equal(result.ready,true);
  assert.equal(result.solarRows.length,0);
  assert.equal(result.finance.withSolar,null);
});

test('an existing building requires its intervention cost', () => {
  const data = base();
  data.existente = true;
  const result = calculate(data);
  assert.equal(result.ready,false);
  assert.ok(result.missing.includes('Demolición, adaptación o refuerzo'));
});

test('rent begins after construction while predial continues during the work', () => {
  const data = base();
  data.plazoMeses = 18;
  data.pisos = 1;
  data.aptos = 1;
  data.arriendo = 100;
  data.ocupacion = 100;
  data.predial = 100;
  const result = calculate(data);
  assert.equal(result.finance.without.cashflow[1].cash,-100);
  assert.equal(result.finance.without.cashflow[2].cash,500);
  assert.equal(result.finance.without.cashflow[3].cash,1100);
});

test('the selected target year and required rent use discounted operating years', () => {
  const data = base();
  data.pisos = 1; data.aptos = 1; data.terrenoPrecio = 1000;
  data.objetivoAnios = 2; data.ocupacion = 100; data.arriendo = 100;
  const result = calculate(data);
  assert.equal(result.finance.objectiveYear, 2);
  assert.equal(result.finance.objectiveNpv, result.finance.without.cashflow[2].discounted);
  assert.ok(Math.abs(result.finance.requiredMonthlyRent - 1000 * 1.06 ** 2 / 12) < 1e-8);
});

test('crew transportation is estimated by workdays times crew size and daily rate', () => {
  const data=base();
  data.jornadasTransporte=12; data.personasCuadrilla=4; data.transporteDiarioPrecio=15000;
  const result=calculate(data);
  const line=result.rows.find(row=>row.label==='Transporte de cuadrilla por jornada');
  assert.equal(line.quantity,48);
  assert.equal(line.cost,720000);
});
