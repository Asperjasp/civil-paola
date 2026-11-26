(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const money = value => new Intl.NumberFormat('es-CO', { style:'currency', currency:'COP', maximumFractionDigits:0 }).format(value);
  const count = value => new Intl.NumberFormat('es-CO', { maximumFractionDigits:2 }).format(value);
  const fields = ['pisos','frente','fondo','cobertura','aptos','altura','dosificacion','capacidadViaje','viajesExtra','plazoMeses','esperaAnios','objetivoAnios','kwApto',
    'excPrecio','retiroPrecio','terrenoPrecio','intervencionPrecio','cementoPrecio','viajePrecio','estructuraPrecio','ingenieroPrecio',
    'redesPrecio','aguaPrecio','luzPrecio','gasPrecio','senalPrecio','acabadosPrecio','otrosPrecio',
    'panelPrecio','solarRestoPrecio','respaldoPrecio','arriendo','ocupacion','mantenimiento','predial','salvamento',
    'ahorroSolar','mantSolar','salvamentoSolar'];
  const evidenceLabels = {
    excPrecio:'Excavación por m³',retiroPrecio:'Retiro y disposición por m³',terrenoPrecio:'Terreno o costo de oportunidad',
    intervencionPrecio:'Intervención de edificación existente',cementoPrecio:'Cemento por bulto',viajePrecio:'Transporte por viaje',
    estructuraPrecio:'Estructura restante por m²',ingenieroPrecio:'Ingeniero estructural',redesPrecio:'Tuberías y cableado por apartamento',
    aguaPrecio:'Conexión de agua',luzPrecio:'Conexión eléctrica',gasPrecio:'Conexión de gas',senalPrecio:'Conexión de señal',
    acabadosPrecio:'Acabados por m²',otrosPrecio:'Otros costos de obra',panelPrecio:'Paneles por kW',
    solarRestoPrecio:'Resto del sistema solar por kW',respaldoPrecio:'Generador o baterías',arriendo:'Arriendo mensual por apartamento',
    mantenimiento:'Mantenimiento anual',predial:'Predial anual',salvamento:'Salvamento del predio y edificio',
    ahorroSolar:'Ahorro solar anual del propietario',mantSolar:'Mantenimiento solar anual',salvamentoSolar:'Salvamento solar'
  };
  let demoLoaded = false;

  function readData() {
    const data = {};
    for (const id of fields) data[id] = $(id).value.trim() === '' ? NaN : Number($(id).value);
    data.existente = $('existente').value === 'si';
    data.compararSolar = $('compararSolar').value === 'si';
    return data;
  }
  function showConditional() {
    const solar = $('compararSolar').value === 'si';
    document.querySelectorAll('[data-solar]').forEach(el => { el.hidden = !solar; });
    document.querySelectorAll('[data-existing]').forEach(el => { el.hidden = $('existente').value !== 'si'; });
    $('results').hidden = true;
  }
  $('compararSolar').addEventListener('change', showConditional);
  $('existente').addEventListener('change', showConditional);
  $('form').addEventListener('input', () => { $('results').hidden = true; $('message').textContent = ''; });
  $('form').addEventListener('change', () => { $('results').hidden = true; $('message').textContent = ''; });

  function node(tag, text, className) {
    const element = document.createElement(tag);
    element.textContent = text;
    if (className) element.className = className;
    return element;
  }
  function cell(row, tag, text, className) { row.append(node(tag,text,className)); }
  function table(headers, rows) {
    const wrap = node('div','', 'table-wrap');
    const tbl = document.createElement('table');
    const thead = document.createElement('thead'), headRow = document.createElement('tr');
    headers.forEach(header => cell(headRow,'th',header));
    thead.append(headRow); tbl.append(thead);
    const tbody = document.createElement('tbody');
    rows.forEach(values => { const tr = document.createElement('tr'); values.forEach(value => cell(tr,'td',String(value))); tbody.append(tr); });
    tbl.append(tbody); wrap.append(tbl);
    return wrap;
  }
  function buildEvidenceRegister() {
    const container = $('evidence-list');
    const tbl = document.createElement('table'); tbl.className = 'evidence-table';
    const thead = document.createElement('thead'), head = document.createElement('tr');
    ['Dato', 'Fuente o proveedor / documento', 'Fecha del dato'].forEach(label => cell(head,'th',label));
    thead.append(head); tbl.append(thead);
    const tbody = document.createElement('tbody');
    document.querySelectorAll('[data-money]').forEach(price => {
      const label = evidenceLabels[price.id] || price.id;
      const row = document.createElement('tr'); cell(row,'td',label);
      const sourceCell = document.createElement('td'), source = document.createElement('input');
      source.id = `source-${price.id}`; source.type = 'text'; source.placeholder = 'Proveedor, factura o enlace';
      source.setAttribute('aria-label',`Fuente de ${label}`); sourceCell.append(source);
      const dateCell = document.createElement('td'), date = document.createElement('input');
      date.id = `date-${price.id}`; date.type = 'date'; date.setAttribute('aria-label',`Fecha de ${label}`);
      dateCell.append(date); row.append(sourceCell,dateCell); tbody.append(row);
    });
    tbl.append(tbody); container.append(tbl);
  }
  function sourceItems(result, data) {
    const keys = result.rows.concat(result.solarRows)
      .filter(row => row.cost !== null).map(row => row.priceKey);
    keys.push('arriendo','mantenimiento','predial','salvamento');
    if (data.compararSolar) keys.push('ahorroSolar','mantSolar','salvamentoSolar');
    return [...new Set(keys)].filter(id => Number.isFinite(data[id]) && data[id] >= 0).map(id => {
      const source = $(`source-${id}`).value.trim();
      const date = $(`date-${id}`).value;
      return {id,label:evidenceLabels[id] || id,value:$(id).value,source,date,
        status:demoLoaded ? 'Ejemplo ficticio' : source && date ? 'Fuente y fecha declaradas' : source || date ? 'Registro incompleto' : 'Sin fuente registrada'};
    });
  }
  function renderEvidence(result,data) {
    const items = sourceItems(result,data);
    const covered = items.filter(item => item.source && item.date).length;
    $('sources-summary').textContent = `Fuentes por rubro · ${covered} de ${items.length} registros completos`;
    $('source-quality').textContent = demoLoaded
      ? 'Los valores del ejemplo son ficticios. Sustitúyelos por cotizaciones de Bogotá antes de usar la comparación para decidir.'
      : `${covered} de ${items.length} importes utilizados tienen fuente y fecha declaradas. La app no comprueba la vigencia ni el contenido de esas fuentes.`;
    $('source-quality').className = `source-quality ${covered === items.length && !demoLoaded ? 'complete' : ''}`;
    $('provenance-table').replaceChildren(table(['Dato','Valor ingresado','Fuente declarada','Fecha','Estado'],items.map(item => [
      item.label, money(Number(item.value)), item.source || '—', item.date || '—', item.status
    ])));
  }
  function metric(label, value, detail = '') {
    const box = node('div','', 'metric');
    box.append(node('span',label),node('strong',value),node('small',detail));
    return box;
  }

  function renderCosts(result, data) {
    const body = $('cost-rows'); body.replaceChildren();
    for (const row of result.rows.concat(result.solarRows)) {
      const tr = document.createElement('tr');
      cell(tr,'td',`${row.phase} · ${row.label}`);
      cell(tr,'td',`${count(row.quantity)} ${row.unit}`);
      cell(tr,'td',row.cost === null ? (row.optional ? 'Opcional' : 'Pendiente') : `${money(row.price)}${row.unit === 'total' ? '' : ` / ${row.unit}`}`);
      cell(tr,'td',row.cost === null ? '—' : money(row.cost),row.cost === null ? 'pending' : '');
      body.append(tr);
    }
    const totals = $('cost-totals'); totals.replaceChildren();
    const addTotal = (label, value, hasQuote) => { const tr = document.createElement('tr'); cell(tr,'th',label); cell(tr,'td',''); cell(tr,'td',''); cell(tr,'td',hasQuote ? money(value) : 'Sin cotizaciones'); totals.append(tr); };
    const hasBase = result.rows.some(row => row.cost !== null);
    const hasSolar = result.solarRows.some(row => row.cost !== null);
    addTotal('Subtotal base conocido',result.baseCost,hasBase);
    if (data.compararSolar) { addTotal('Alternativa solar conocida',result.solarCost,hasSolar); addTotal('Subtotal con solar',result.baseCost + result.solarCost,hasBase || hasSolar); }
  }

  function chart(without, withSolar) {
    const series = [without.cashflow.map(point => point.discounted)];
    if (withSolar) series.push(withSolar.cashflow.map(point => point.discounted));
    const all = series.flat();
    const min = Math.min(...all,0), max = Math.max(...all,0);
    const width = 760, height = 250, left = 56, right = 22, top = 18, bottom = 37;
    const span = Math.max(1,max-min);
    const x = year => left + year / 20 * (width-left-right);
    const y = value => top + (max-value) / span * (height-top-bottom);
    const line = (points, color) => `<polyline fill="none" stroke="${color}" stroke-width="3.5" stroke-linejoin="round" points="${points.map((v,i)=>`${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')}"/>`;
    const zero = y(0);
    const svg = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="chart-title chart-desc"><title id="chart-title">Flujo de caja acumulado descontado</title><desc id="chart-desc">Comparación anual de los escenarios de construcción sin y con energía solar, con tasa de descuento del 6 por ciento.</desc><line x1="${left}" x2="${width-right}" y1="${zero}" y2="${zero}" stroke="#8a9e91" stroke-dasharray="5 5"/>${[0,5,10,15,20].map(year=>`<text x="${x(year)}" y="${height-9}" text-anchor="middle" fill="#58685f" font-size="12">${year}</text>`).join('')}${line(series[0],'#08776b')}${series[1] ? line(series[1],'#e79055') : ''}<text x="${left}" y="${height-9}" fill="#58685f" font-size="12">Año</text></svg>`;
    const wrapper = document.createElement('div'); wrapper.className = 'chart'; wrapper.innerHTML = svg;
    const legend = node('p','', 'legend');
    legend.append(node('span','Sin solar','legend-base'));
    if (withSolar) legend.append(node('span','Con solar','legend-solar'));
    wrapper.append(legend);
    return wrapper;
  }

  function renderFinance(result, data) {
    const comparison = $('comparison'), decision = $('decision');
    comparison.replaceChildren(); decision.replaceChildren();
    const { without, withSolar, delta5, delta20 } = result.finance;
    if (withSolar) {
      const cards = node('div','', 'comparison-grid');
      cards.append(metric('Inversión adicional solar',money(result.solarCost),'Paneles, equipos e instalación'),
        metric('Ahorro neto solar por año',money(data.ahorroSolar-data.mantSolar),'Ahorro del propietario menos mantenimiento'),
        metric('Diferencia a 5 años',money(delta5),'VPN solar menos VPN sin solar'),
        metric('Diferencia a 20 años',money(delta20),'Incluye valor residual solar'));
      comparison.append(cards);
      comparison.append(table(['Escenario','Inversión inicial','Flujo anual neto tras obra','VPN 5 años','VPN 20 años','Recuperación descontada'],[
        ['Sin solar',money(without.initial),money(without.annual),money(without.npv5),money(without.npv20),without.discountedPayback === null ? 'No en 20 años' : `Año ${without.discountedPayback}`],
        ['Con solar',money(withSolar.initial),money(withSolar.annual),money(withSolar.npv5),money(withSolar.npv20),withSolar.discountedPayback === null ? 'No en 20 años' : `Año ${withSolar.discountedPayback}`]
      ]));
      const title = node('strong',delta20 >= 0 ? 'La opción solar mejora el VPN a 20 años.' : 'La opción solar reduce el VPN a 20 años.');
      const short = delta5 >= 0 ? 'También mejora el resultado a 5 años.' : 'A 5 años aún tiene un resultado menor que la opción sin solar.';
      const recovery = without.discountedPayback === null && withSolar.discountedPayback === null
        ? 'Ninguna alternativa recupera la inversión descontada dentro de 20 años con estos datos. '
        : '';
      decision.append(title,node('p',`${short} ${recovery}Esta lectura depende de que el propietario reciba el ahorro anual indicado. Compara tus cotizaciones y condiciones de uso antes de decidir.`));
    } else {
      comparison.append(node('p','Seleccionaste evaluar solo la obra base. Activa la comparación solar en el formulario para ver ambas alternativas.'));
      decision.append(node('p','Con los datos ingresados, la recuperación descontada de la obra base es '+(without.discountedPayback === null ? 'posterior a 20 años o no se alcanza.' : `en el año ${without.discountedPayback}.`)));
    }
    $('cash-chart').replaceChildren(chart(without,withSolar));
    const years = [0,1,5,10,15,20];
    const cashRows = years.map(year => [year,
      money(without.cashflow[year].cash),money(without.cashflow[year].discounted),
      withSolar ? money(withSolar.cashflow[year].cash) : '—',
      withSolar ? money(withSolar.cashflow[year].discounted) : '—']);
    $('finance-table').replaceChildren(table(['Año','Flujo sin solar','Acumulado descontado','Flujo con solar','Acumulado descontado'],cashRows));
  }

  function renderPhases(result, data) {
    const phases = [
      ['Preparación',0], ['Estructura',data.plazoMeses/12*.25],
      ['Instalaciones',data.plazoMeses/12*.6], ['Acabados',data.plazoMeses/12*.9]
    ];
    if (data.compararSolar) phases.push(['Solar',data.plazoMeses/12*.9]);
    const all = result.rows.concat(result.solarRows);
    const phaseRows = phases.map(([name,time]) => {
      const now = all.filter(row => row.phase === name).reduce((total,row) => total+(row.cost||0),0);
      return [name,`${count(data.esperaAnios+time)} años`,money(now),money(now*Math.pow(1.06,data.esperaAnios+time))];
    });
    $('phase-table').replaceChildren(table(['Etapa','Compra estimada desde hoy','Costo actual','Con aumento del 6 % anual'],phaseRows));
    $('sensitivity').replaceChildren();
    const cards = node('div','', 'sensitivity-grid');
    result.escalation.forEach(item => cards.append(metric(`Aumento anual ${item.rate} %`,money(item.total),'Costo total proyectado por fecha de compra')));
    $('sensitivity').append(cards);
  }

  function renderVerdict(result, data) {
    const box = $('verdict');
    const {without, requiredMonthlyRent, objectiveNpv} = result.finance;
    const meetsGoal = objectiveNpv >= 0 && without.discountedPayback !== null && without.discountedPayback <= data.objetivoAnios;
    box.hidden = false;
    box.className = `verdict ${meetsGoal ? 'favorable' : 'unfavorable'}`;
    box.replaceChildren();
    const visual = node('div','', 'verdict-visual');
    const photo = document.createElement('img');
    photo.src = meetsGoal ? 'assets/casa-favorable.webp' : 'assets/casa-desfavorable.webp';
    photo.alt = meetsGoal ? 'Ilustración de edificio residencial en Bogotá bajo luz cálida' : 'Ilustración de edificio residencial en Bogotá bajo luz nublada';
    photo.loading = 'lazy';
    visual.append(photo,node('span',meetsGoal ? '↗' : '↘','trend-arrow'));
    const words = node('div','', 'verdict-copy');
    words.append(node('p',`Resultado frente a tu meta de ${data.objetivoAnios} años`, 'eyebrow'),
      node('h2',meetsGoal ? 'La inversión alcanza tu plazo objetivo' : 'La inversión no alcanza tu plazo objetivo'),
      node('p',`VPN al año ${data.objetivoAnios}: ${money(objectiveNpv)}. ${without.discountedPayback === null ? 'No se recupera dentro de 20 años' : `Recuperación descontada: año ${without.discountedPayback}`}. Se usa el escenario sin solar como referencia; compara ambas opciones abajo.`),
      node('p',requiredMonthlyRent === null ? 'Con la ocupación o el calendario indicados no hay un canon mensual que recupere la inversión en ese plazo.' : `Canon mínimo calculado para alcanzar VPN cero en tu plazo: ${money(requiredMonthlyRent)} por apartamento al mes, suponiendo la ocupación ingresada.`, 'required-rent'));
    box.append(visual,words);
    const roadmap = $('roadmap'); roadmap.replaceChildren();
    const points = [
      ['Hoy · t = 0',`Inversión ${money(without.initial)}`],
      [`Mes ${data.plazoMeses}`, 'Termina la obra; inicia el arriendo'],
      [`Año ${data.objetivoAnios}`,`Tu meta · VPN ${money(objectiveNpv)}`],
      ['Año 20',`Salvamento ${money(data.salvamento)}`]
    ];
    points.forEach(([title,description]) => {
      const item = node('div','', 'roadmap-point'); item.append(node('strong',title),node('span',description)); roadmap.append(item);
    });
    $('roadmap-card').hidden = false;

    const recs = $('recommendation-list'); recs.replaceChildren();
    const add = (title,body) => { const item = node('article','', 'recommendation'); item.append(node('h3',title),node('p',body)); recs.append(item); };
    add('Canon y ocupación', requiredMonthlyRent === null ? 'Revisa el calendario de obra y la ocupación esperada.' : `Tu canon es ${money(data.arriendo)} frente a ${money(requiredMonthlyRent)} necesarios por apartamento. Prueba una ocupación menor para medir vacancia.`);
    const localCase = document.querySelector(`.case-card[data-locality="${$('localidad').value}"]`);
    if (localCase) {
      const comparable = Number(localCase.dataset.rent);
      const ratio = data.arriendo / comparable;
      add('Contrasta la demanda local', `Tu canon es ${ratio > 1.2 ? 'más de 20 % superior' : ratio < .8 ? 'más de 20 % inferior' : 'cercano'} a un solo anuncio de ${$('localidad').value} (${money(comparable)}). No estima probabilidad de arriendo: verifica área, número de habitaciones, administración, ascensor, parqueadero y acceso a transporte con más comparables.`);
    } else add('Contrasta la demanda local','No hay un anuncio de ejemplo para esta localidad. Busca al menos tres inmuebles comparables en el sector antes de fijar el canon.');
    if (data.pisos >= 5) add('Accesibilidad y norma','Con este número de pisos, confirma exigencias de ascensor, accesibilidad, estructura y altura permitida para el predio; incluye el costo en las cotizaciones.');
    if (data.compararSolar) add('Quién recibe el ahorro solar','Si los arrendatarios pagan su consumo y el canon no cambia, el ahorro del propietario puede ser cero. Contrasta la factura y la propuesta solar.');
    add('Siguiente paso','Solicita anteproyecto, estudio de suelos y cotizaciones con fecha y alcance. Confirma predial y un plan de mantenimiento. Repite el cálculo con escenarios de canon y ocupación conservadores.');
    $('recommendations').hidden = false;
  }

  function render(result, data) {
    $('results').hidden = false;
    $('result-context').textContent = `${$('localidad').value}, estrato ${$('estrato').value} · ${data.pisos} pisos`;
    const quality = [];
    if (demoLoaded) quality.push('Ejemplo académico: todos los precios y flujos monetarios son ficticios.');
    if ($('fuente').value.trim()) quality.push(`Nota del escenario: ${$('fuente').value.trim()}${$('fechaPrecio').value ? ` (${ $('fechaPrecio').value })` : ''}.`);
    quality.push(result.ready ? 'Presupuesto cargado: revisa las partidas globales antes de interpretarlo como costo total.' : `Faltan ${result.missing.length} precios y ${result.missingFinance.length} datos financieros. Los subtotales incluyen solo rubros con valor.`);
    $('data-quality').textContent = quality.join(' ');
    $('metrics').replaceChildren(metric('Excavación a 1,4 m',`${count(result.excavacion)} m³`),
      metric('Columnas ilustrativas',count(result.columnas),`${count(result.concretoColumnas)} m³ de concreto`),
      metric('Cemento estimado',`${count(result.bultos)} bultos`,`${count(result.viajes)} viajes de material`),
      metric('Área construida supuesta',`${count(result.areaConstruida)} m²`,`${count(result.apartamentos)} apartamentos`));
    renderCosts(result,data);
    renderEvidence(result,data);
    if (result.ready) {
      $('comparison-card').hidden = false;
      renderFinance(result,data);
      renderPhases(result,data);
      renderVerdict(result,data);
      document.querySelector('#cash-chart').parentElement.hidden = false;
      document.querySelector('#phase-table').parentElement.hidden = false;
    } else {
      $('verdict').hidden = true;
      $('roadmap-card').hidden = true;
      $('recommendations').hidden = true;
      $('comparison-card').hidden = false;
      const names = {arriendo:'arriendo mensual',ocupacion:'ocupación',mantenimiento:'mantenimiento anual',predial:'predial anual',salvamento:'valor de salvamento',ahorroSolar:'ahorro solar anual',mantSolar:'mantenimiento solar anual',salvamentoSolar:'valor residual solar'};
      const waiting = result.missing.concat(result.missingFinance.map(key => names[key] || key));
      $('comparison').replaceChildren(node('p',`Para comparar el arriendo y la energía solar, completa: ${waiting.join(', ')}.`,'pending-list'));
      $('decision').replaceChildren();
      document.querySelector('#cash-chart').parentElement.hidden = true;
      document.querySelector('#phase-table').parentElement.hidden = true;
    }
    $('results').scrollIntoView({behavior:'smooth',block:'start'});
  }

  $('form').addEventListener('submit',event => {
    event.preventDefault();
    if (!$('localidad').value || !$('estrato').value) { $('message').textContent = 'Selecciona la localidad y el estrato.'; return; }
    const data = readData();
    const result = ConstruplanModel.calculate(data);
    if (result.errors.length) { $('message').textContent = `Revisa los datos de proyecto: ${result.errors.join(', ')}.`; $('results').hidden = true; return; }
    $('message').textContent = '';
    render(result,data);
  });

  $('demo').addEventListener('click', () => {
    const example = { localidad:'Suba',estrato:'3',existente:'no',pisos:'5',frente:'10',fondo:'20',cobertura:'80',aptos:'2',compararSolar:'si',
      altura:'2.7',dosificacion:'7',capacidadViaje:'100',viajesExtra:'2',plazoMeses:'12',esperaAnios:'0',objetivoAnios:'10',kwApto:'1',
      excPrecio:'100000',retiroPrecio:'50000',terrenoPrecio:'250000000',cementoPrecio:'38000',viajePrecio:'450000',
      estructuraPrecio:'1400000',ingenieroPrecio:'25000000',redesPrecio:'7000000',aguaPrecio:'4000000',luzPrecio:'6000000',
      gasPrecio:'3000000',senalPrecio:'2000000',acabadosPrecio:'1100000',otrosPrecio:'180000000',
      panelPrecio:'1800000',solarRestoPrecio:'2500000',respaldoPrecio:'0',arriendo:'1600000',ocupacion:'90',
      mantenimiento:'18000000',predial:'12000000',salvamento:'800000000',ahorroSolar:'8000000',mantSolar:'1200000',salvamentoSolar:'0' };
    for (const [id,value] of Object.entries(example)) $(id).value = value;
    document.querySelectorAll('[data-money]').forEach(input => { $(`source-${input.id}`).value = ''; $(`date-${input.id}`).value = ''; });
    $('fuente').value = 'Ejemplo académico — cifras ficticias'; $('fechaPrecio').value = '';
    demoLoaded = true; showConditional();
    $('form').requestSubmit();
  });
  $('reset').addEventListener('click', () => {
    document.querySelectorAll('[data-money]').forEach(input => { input.value = ''; });
    document.querySelectorAll('[data-money]').forEach(input => { $(`source-${input.id}`).value = ''; $(`date-${input.id}`).value = ''; });
    $('fuente').value = ''; $('fechaPrecio').value = ''; demoLoaded = false;
    $('results').hidden = true; $('message').textContent = '';
  });
  buildEvidenceRegister();
  showConditional();
})();
