(function () {
  'use strict';
  const cards = [...document.querySelectorAll('.case-card')];
  const mapNode = document.getElementById('bogota-map');
  if (window.L && mapNode) {
    const map = L.map(mapNode, {scrollWheelZoom:false}).setView([4.68,-74.105], 11);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom:18,
      attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    cards.forEach(card => {
      const marker = L.circleMarker([Number(card.dataset.lat),Number(card.dataset.lng)], {
        radius:9,color:'#ffffff',weight:3,fillColor:'#e99154',fillOpacity:1
      }).addTo(map);
      const title = card.querySelector('span').textContent;
      const price = card.querySelector('strong').textContent;
      const link = card.querySelector('a').href;
      const popup = document.createElement('div');
      const name = document.createElement('strong'); name.textContent = title;
      const amount = document.createElement('div'); amount.textContent = price;
      const anchor = document.createElement('a'); anchor.href = link;
      anchor.target = '_blank'; anchor.rel = 'noopener noreferrer'; anchor.textContent = 'Ver anuncio ↗';
      popup.append(name,amount,anchor);
      marker.bindPopup(popup);
    });
  } else if (mapNode) mapNode.textContent = 'El mapa requiere conexión. Los tres anuncios y sus enlaces están disponibles debajo.';

  fetch('data/indicadores.json').then(response => {
    if (!response.ok) throw new Error('Dato no disponible');
    return response.json();
  }).then(data => {
    const box = document.getElementById('city-indicator');
    box.replaceChildren();
    const title = document.createElement('strong');
    title.textContent = data.variacion_mensual_nacional === null
      ? `DANE · nuevo boletín ICOCED ${data.periodo}`
      : `DANE · ICOCED ${data.periodo} · variación mensual nacional ${String(data.variacion_mensual_nacional).replace('.',',')} %`;
    const note = document.createElement('span');
    note.textContent = ` Publicado ${data.publicado}. El ICOCED mide cambios, no precios en pesos; no altera automáticamente las cotizaciones.`;
    const link = document.createElement('a');
    link.href = data.fuente; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = 'Consultar boletín ↗';
    box.append(title,note,link);
  }).catch(() => {
    document.getElementById('city-indicator').textContent = 'Indicador no disponible sin servidor o conexión. Revisa el enlace oficial del DANE en Fuentes.';
  });
})();
