/* Node.js 22+. Verificações do protótipo e da documentação, sem pacotes externos. */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../..');
require('../js/data.js');
require('./data.test.js');

const failures = globalThis.BI_TEST_RESULTS.filter(test => !test.sucesso);
assert.equal(failures.length, 0, JSON.stringify(failures));
console.log(`✓ ${globalThis.BI_TEST_RESULTS.length} testes de dados e geometria`);

const examples = JSON.parse(fs.readFileSync(path.join(__dirname, 'consultas.json'), 'utf8'));
const data = globalThis.BI;
for (const example of examples.casos) {
  const selection = example.entrada;
  assert.ok(selection.recorte_ids.length && selection.variavel_ids.length && selection.edicao_id);
  assert.ok(selection.recorte_ids.every(id => data.recortes.some(recorte => recorte.id === id)));
  assert.ok(selection.variavel_ids.every(id => data.variaveis.some(variavel => variavel.id === id)));
  const results = data.api.consultar(selection.recorte_ids, selection.variavel_ids, selection.edicao_id);

  for (const [variable, expected] of Object.entries(example.esperado)) {
    const result = results[variable];
    assert.equal(result.estado, expected.estado, example.nome);
    if ('total' in expected) {
      assert.equal(result.total, expected.total, example.nome);
    }
    const ids = result.registros.map(record => record.id).sort();
    if (expected.ids) {
      assert.deepEqual(ids, [...expected.ids].sort(), example.nome);
    }
    if (expected.inclui_ids) {
      assert.ok(expected.inclui_ids.every(id => ids.includes(id)), example.nome);
    }
    if (result.estado === 'indisponivel') {
      assert.equal(result.total, null, example.nome);
      assert.deepEqual(ids, [], example.nome);
    }
    if (result.estado === 'completo') {
      assert.equal(result.total, new Set(ids).size, example.nome);
    }
  }
}
console.log(`✓ ${examples.casos.length} exemplos de aceite ligados aos dados simulados`);

// Detectar referências quebradas após a reorganização da entrega.
const documents = [
  'README.md',
  'AGENTS.md',
  'FUNCIONAMENTO_PLATAFORMA.md',
  'DADOS.md',
  'MODELO_LOGICO.md'
];
for (const file of documents) {
  const content = fs.readFileSync(path.join(root, file), 'utf8');
  for (const match of content.matchAll(/\]\(([^)]+)\)/g)) {
    const target = match[1].split('#')[0];
    if (!target || /^[a-z]+:\/\//i.test(target)) continue;
    const destination = path.resolve(root, path.dirname(file), target);
    assert.ok(fs.existsSync(destination), `Link ausente em ${file}: ${target}`);
  }
}
for (const file of ['prototipo/index.html', 'prototipo/tests/data_checks.html']) {
  const content = fs.readFileSync(path.join(root, file), 'utf8');
  for (const match of content.matchAll(/(?:src|href)="([^"]+)"/g)) {
    const target = match[1];
    if (target.startsWith('#') || /^https?:/.test(target)) continue;
    const destination = path.resolve(root, path.dirname(file), target);
    assert.ok(fs.existsSync(destination), `Recurso ausente em ${file}: ${target}`);
  }
}
console.log('✓ Links dos cinco documentos e recursos locais do protótipo');
console.log('Todas as verificações passaram.');
