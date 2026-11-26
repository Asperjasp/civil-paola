const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const model = require('../public/model.js');

test('the example runs through the form and renders both solar scenarios', () => {
  const html = fs.readFileSync('public/index.html','utf8');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  class Element {
    constructor(id = '') { this.id=id; this.value=''; this.textContent=''; this.hidden=false; this.children=[]; this.handlers={}; this.parentElement={hidden:false}; }
    addEventListener(type, handler) { this.handlers[type]=handler; }
    replaceChildren(...children) { this.children=children; }
    append(...children) { this.children.push(...children); }
    scrollIntoView() {}
    setAttribute() {}
    requestSubmit() { this.handlers.submit({preventDefault(){}}); }
  }
  const elements = Object.fromEntries(ids.map(id => [id,new Element(id)]));
  const created = [];
  elements.existente.value='no'; elements.compararSolar.value='si';
  const moneyIds = [...html.matchAll(/id="([^"]+)" data-money/g)].map(match => match[1]);
  const document = {
    getElementById:id => elements[id] || created.find(el => el.id === id),
    createElement:tag => { const el = new Element(tag); created.push(el); return el; },
    querySelector:selector => elements[selector.slice(1)],
    querySelectorAll:selector => selector === '[data-money]' ? moneyIds.map(id=>elements[id]) : []
  };
  const context = { document, ConstruplanModel:model, Intl, Math, Number, String, console };
  vm.runInNewContext(fs.readFileSync('public/app.js','utf8'),context);
  elements.demo.handlers.click();
  assert.equal(elements.results.hidden,false);
  assert.equal(elements.message.textContent,'');
  assert.match(elements.dataQuality?.textContent || elements['data-quality'].textContent,/fictici/i);
  assert.equal(elements['cost-rows'].children.length,17);
  assert.ok(elements.comparison.children.length > 0);
  assert.ok(elements['cash-chart'].children.length > 0);
  assert.ok(elements['sensitivity'].children.length > 0);
  assert.match(elements['source-quality'].textContent,/ficticios/i);
  assert.ok(elements['provenance-table'].children.length > 0);
});
