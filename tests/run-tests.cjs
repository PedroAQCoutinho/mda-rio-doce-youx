/* Node.js 22+. Sem pacotes externos. Validar regras locais e contrato de referência. */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
require('../prototipo/js/data.js');
require('./data.test.js');
const failures = globalThis.BI_TEST_RESULTS.filter(t => !t.sucesso);
assert.equal(failures.length, 0, JSON.stringify(failures));
console.log(`✓ ${globalThis.BI_TEST_RESULTS.length} testes de dados e geometria`);
const contract = JSON.parse(fs.readFileSync(path.join(root, 'contratos/openapi.json'), 'utf8'));
const examples = JSON.parse(fs.readFileSync(path.join(root, 'exemplos/consultas.json'), 'utf8'));
assert.equal(contract.openapi, '3.0.3');
const operations = new Set();
const resolveRef = ref => ref.slice(2).split('/').reduce((x, k) => x?.[k.replace(/~1/g, '/').replace(/~0/g, '~')], contract);
function walk(node) {
  if (!node || typeof node !== 'object') return;
  if (node.$ref) assert.ok(node.$ref.startsWith('#/') && resolveRef(node.$ref), `Referência inexistente: ${node.$ref}`);
  if (node.required && Array.isArray(node.required)) for (const name of node.required) assert.ok(node.properties?.[name], `Campo obrigatório sem definição: ${name}`);
  Object.values(node).forEach(walk);
}
walk(contract);
for (const [route, methods] of Object.entries(contract.paths)) for (const [method, op] of Object.entries(methods)) {
  assert.ok(['get','post'].includes(method), `Método inesperado ${method}`);
  assert.ok(op.operationId && !operations.has(op.operationId), 'operationId ausente/repetido'); operations.add(op.operationId);
  assert.ok(op.responses['200'] && op.responses['400'], `Respostas ausentes em ${route}`);
  for (const name of [...route.matchAll(/\{([^}]+)\}/g)].map(x => x[1])) assert.ok(op.parameters?.some(p => p.name === name && p.in === 'path' && p.required), `Parâmetro de rota indefinido: ${name}`);
}
console.log(`✓ ${operations.size} operações e referências internas do OpenAPI`);
const B = globalThis.BI;
for (const c of examples.casos) {
  const q = c.entrada;
  assert.ok(q.recorte_ids.length && q.variavel_ids.length && q.edicao_id && q.requisicao_id);
  assert.ok(q.recorte_ids.every(id => B.recortes.some(r => r.id === id)));
  assert.ok(q.variavel_ids.every(id => B.variaveis.some(v => v.id === id)));
  const result = B.api.consultar(q.recorte_ids, q.variavel_ids, q.edicao_id);
  for (const [vid, expected] of Object.entries(c.esperado)) {
    const r = result[vid]; assert.equal(r.estado, expected.estado, c.nome);
    if ('total' in expected) assert.equal(r.total, expected.total, c.nome);
    const ids = r.registros.map(x => x.id).sort();
    if (expected.ids) assert.deepEqual(ids, [...expected.ids].sort(), c.nome);
    if (expected.inclui_ids) assert.ok(expected.inclui_ids.every(id => ids.includes(id)), c.nome);
    if (r.estado === 'indisponivel') assert.ok(r.total === null && ids.length === 0, c.nome);
    if (r.estado === 'completo') assert.equal(r.total, new Set(ids).size, c.nome);
  }
}
console.log(`✓ ${examples.casos.length} exemplos de aceite ligados às fixtures`);
const apiExample = contract.paths['/resultados'].post.requestBody.content['application/json'].example;
const apiExpected = contract.paths['/resultados'].post.responses['200'].content['application/json'].example;
const calculated = B.api.consultar(apiExample.recorte_ids, apiExample.variavel_ids, apiExample.edicao_id);
assert.equal(apiExpected.resultados[0].quantidade, calculated.CAR.total);
assert.equal(apiExpected.requisicao_id, apiExample.requisicao_id);
const selection = contract.components.schemas.Selecao.properties;
assert.equal(selection.recorte_ids.minItems, 1); assert.equal(selection.variavel_ids.minItems, 1);
assert.ok(contract.components.schemas.Indisponivel.properties.quantidade.nullable);
assert.deepEqual(contract.components.schemas.Indisponivel.properties.quantidade.enum, [null]);
assert.equal(contract.components.schemas.NovoAcordoDisponivel.properties.recorte_ids.minItems, 49);
assert.equal(contract.components.schemas.NovoAcordoDisponivel.properties.recorte_ids.maxItems, 49);
assert.equal(contract.components.schemas.NovoAcordoDisponivel.properties.recorte_ids.uniqueItems, true);
console.log('✓ Exemplos HTTP, seleção não vazia, cobertura indisponível e grupo dos 49');
// Arquivos e links locais da entrega devem continuar resolvendo após reorganizações.
for (const file of ['README.md','AGENTS.md',...fs.readdirSync(path.join(root,'docs')).filter(x=>x.endsWith('.md')).map(x=>'docs/'+x)]) {
  const content = fs.readFileSync(path.join(root,file),'utf8');
  for (const match of content.matchAll(/\]\(([^)]+)\)/g)) {
    const target = match[1].split('#')[0];
    if (!target || /^[a-z]+:\/\//i.test(target)) continue;
    assert.ok(fs.existsSync(path.resolve(root,path.dirname(file),target)), `Link ausente: ${file} → ${target}`);
  }
}
for (const file of ['prototipo/index.html','tests/data_checks.html']) {
  const content = fs.readFileSync(path.join(root,file),'utf8');
  for (const match of content.matchAll(/(?:src|href)="([^"]+)"/g)) {
    if (match[1].startsWith('#') || /^https?:/.test(match[1])) continue;
    assert.ok(fs.existsSync(path.resolve(root,path.dirname(file),match[1])), `Recurso ausente: ${file} → ${match[1]}`);
  }
}
console.log('✓ Links da documentação e recursos locais do protótipo');
console.log('Todas as verificações passaram. API de produção ainda não implementada.');
