/* Execute abrindo data_checks.html. Também pode ser importado após js/data.js. */
(function (global) {
  'use strict';
  const B = global.BI;
  if (!B) throw new Error('Carregue js/data.js antes de data.test.js.');
  const report = [];
  function test(nome, fn) {
    try { fn(); report.push({ nome, sucesso: true }); }
    catch (error) { report.push({ nome, sucesso: false, erro: error.message }); }
  }
  function assert(condicao, mensagem) { if (!condicao) throw new Error(mensagem); }
  const p = (x, y) => ({ type: 'Point', coordinates: [x, y] });
  const rect = B.espacial.retangulo;
  const intersecta = B.espacial.intersecta;
  const ids = result => result.registros.map(r => r.id);

  test('Os seis tipos e os três buffers estão presentes', () => {
    assert(B.tipos.length === 6, 'Tipos inesperados.');
    assert(B.api.listarRecortes('BUFFER').length === 3, 'Buffer deve ter três unidades.');
  });
  test('200 municípios e grupo fictício de exatamente 49 identidades únicas', () => {
    assert(B.api.listarRecortes('MUNICIPIO').length === 200, 'Quantidade municipal divergente.');
    assert(new Set(B.api.idsNovoAcordo()).size === 49, 'Grupo49 inválido.');
    const repetido = new Set(['AST_001', ...B.api.idsNovoAcordo(), ...B.api.idsNovoAcordo()]);
    assert(repetido.size === 50, 'Adição repetida perdeu ou duplicou identidades.');
  });
  test('Busca ignora acentos e caixa, preservando o tipo ativo', () => {
    assert(B.api.listarRecortes('ASSENTAMENTO', 'NÓVA alvoráda')[0].id === 'AST_001', 'Busca não normalizou acentos.');
    assert(B.api.listarRecortes('MUNICIPIO', 'AST_001').length === 0, 'Busca escapou do tipo.');
  });
  test('União deduplica registro relacionado a dois municípios', () => {
    const a = B.api.consultar(['MUN_001'], ['CAR']).CAR, b = B.api.consultar(['MUN_002'], ['CAR']).CAR;
    const uniao = B.api.consultar(['MUN_001', 'MUN_002', 'MUN_001'], ['CAR']).CAR;
    assert(a.total === 3 && b.total === 2, 'Fixture municipal deve ter 3 e 2 CAR.');
    assert(uniao.total === 4 && ids(uniao).join('|') === B.fixtures.uniaoCarIds.join('|'), 'União não corresponde a quatro CAR.');
  });
  test('Múltiplas variáveis têm resultados e catálogos de colunas próprios', () => {
    const result = B.api.consultar(['AST_001'], ['PTR', 'ASSENTAMENTOS', 'CAR']);
    assert(Object.keys(result).length === 3, 'Resultados foram mesclados.');
    assert(B.variaveis.every(v => v.colunas.every(c => ['campo', 'rotulo', 'tipo', 'ordem', 'visivel', 'formato'].every(k => k in c))), 'Catálogo incompleto.');
    assert(new Set(B.variaveis.map(v => v.colunas.map(c => c.campo).join('|'))).size === 3, 'Colunas não diferem por fonte.');
  });
  test('Seleção vazia não consulta toda a bacia nem informa zero', () => {
    for (const r of Object.values(B.api.consultar([], ['CAR', 'PTR', 'ASSENTAMENTOS'])))
      assert(r.estado === 'sem_recortes' && r.total === null && r.registros.length === 0, 'Estado sem recortes incorreto.');
  });
  test('Zero completo é distinto de cobertura indisponível', () => {
    const zero = B.api.consultar(['MUN_200'], ['CAR']).CAR;
    const indisponivel = B.api.consultar(['TI_002'], ['CAR']).CAR;
    assert(zero.estado === 'completo' && zero.total === 0, 'Zero indevido.');
    assert(indisponivel.estado === 'indisponivel' && indisponivel.total === null, 'Indisponibilidade apresentada como zero.');
  });
  test('Cobertura parcial nunca aparece como total completo', () => {
    const r = B.api.consultar(['MUN_001', 'TI_002'], ['CAR']).CAR;
    assert(r.estado === 'indisponivel' && r.total === null && r.registros.length === 0, 'Resultados parciais foram publicados.');
  });
  test('Edição desconhecida e recorte desconhecido falham como indisponíveis', () => {
    assert(B.api.consultar(['MUN_001'], ['CAR'], 'INEXISTENTE').CAR.estado === 'indisponivel', 'Edição desconhecida aceita.');
    assert(B.api.consultar(['INEXISTENTE'], ['CAR']).CAR.estado === 'indisponivel', 'Recorte desconhecido aceito.');
  });
  test('Edições isolam atributos e cobertura de processamento', () => {
    const atual = B.api.consultar(['ATI_002'], ['PTR'], 'ED_2026_11').PTR;
    const anterior = B.api.consultar(['ATI_002'], ['PTR'], 'ED_2026_09').PTR;
    assert(atual.estado === 'completo' && anterior.estado === 'indisponivel', 'Cobertura não respeita edição.');
    assert(B.api.obterRegistro('PTR', 'PTR_001', 'ED_2026_09').atributos.competencia === '2026-09', 'Atributos não respeitam edição.');
    assert(B.api.obterRegistro('PTR', 'PTR_001').atributos.competencia === '2026-11', 'Edição atual foi alterada.');
  });
  test('Assentamento compartilha identidade e geometria nos dois papéis', () => {
    const r = B.api.obterRecorte('AST_001'), obj = B.api.obterRegistro('ASSENTAMENTOS', 'AST_001');
    assert(r.id === obj.id && r.geometria === obj.geometria, 'Cadastro foi duplicado.');
    const result = B.api.consultar(['AST_001'], ['ASSENTAMENTOS']).ASSENTAMENTOS;
    assert(ids(result).includes('AST_001') && ids(result).includes('AST_002'), 'Não incluiu próprio assentamento e vizinho sobreposto.');
  });
  test('ATIs são a união exata de seus municípios na fixture', () => {
    for (const ati of B.api.listarRecortes('ATI')) {
      const membros = B.atiMunicipio.filter(a => a.id_ati === ati.id).map(a => B.api.obterRecorte(a.id_municipio));
      assert(membros.length === 30, 'ATI sem seus 30 membros.');
      for (const m of membros) assert(intersecta(ati.geometria, m.geometria), 'Município fora da ATI.');
      const soma = membros.reduce((s, m) => { const b = B.espacial.bounds(m.geometria); return s + (b[2] - b[0]) * (b[3] - b[1]); }, 0);
      const b = B.espacial.bounds(ati.geometria);
      assert(Math.abs(soma - (b[2] - b[0]) * (b[3] - b[1])) < 1e-10, 'ATI não coincide com a união.');
    }
  });
  test('Interseção inclui borda compartilhada e toque em um vértice', () => {
    assert(intersecta(rect(0, 0, 1, 1), rect(1, .2, 2, .8)), 'Contato de borda excluído.');
    assert(intersecta(rect(0, 0, 1, 1), rect(1, 1, 2, 2)), 'Contato de vértice excluído.');
    assert(!intersecta(rect(0, 0, 1, 1), rect(1.001, 0, 2, 1)), 'Separação aceita indevidamente.');
  });
  test('Pontos no interior ou na borda são incluídos', () => {
    assert(intersecta(rect(0, 0, 1, 1), p(.5, .5)), 'Ponto interno excluído.');
    assert(intersecta(rect(0, 0, 1, 1), p(1, .5)), 'Ponto de borda excluído.');
    assert(!intersecta(rect(0, 0, 1, 1), p(1.1, .5)), 'Ponto externo incluído.');
  });
  test('Polígonos contidos e sobrepostos são incluídos sem percentual mínimo', () => {
    assert(intersecta(rect(0, 0, 10, 10), rect(2, 2, 3, 3)), 'Contenção excluída.');
    assert(intersecta(rect(0, 0, 10, 10), rect(9.9999, 0, 11, 1)), 'Sobreposição mínima excluída.');
  });
  test('Teste espacial não se limita à caixa envolvente', () => {
    const triangulo = { type: 'Polygon', coordinates: [[[0, 0], [2, 0], [0, 2], [0, 0]]] };
    assert(!intersecta(triangulo, rect(1.4, 1.4, 1.6, 1.6)), 'Apenas bbox foi usado.');
  });
  test('Anéis internos excluem o vazio, incluindo sua borda', () => {
    const furo = { type: 'Polygon', coordinates: [rect(0, 0, 10, 10).coordinates[0], rect(2, 2, 8, 8).coordinates[0]] };
    assert(!intersecta(furo, p(5, 5)), 'Ponto no furo incluído.');
    assert(!intersecta(furo, rect(3, 3, 4, 4)), 'Polígono no furo incluído.');
    assert(intersecta(furo, p(2, 5)), 'Borda do furo excluída.');
  });
  test('MultiPolygon é tratado por todos os seus componentes', () => {
    const multi = { type: 'MultiPolygon', coordinates: [rect(0, 0, 1, 1).coordinates, rect(5, 5, 6, 6).coordinates] };
    assert(intersecta(multi, p(5.5, 5.5)), 'Segundo componente ignorado.');
    assert(!intersecta(multi, p(3, 3)), 'Espaço entre componentes incluído.');
  });
  test('Desenho só seleciona recortes do tipo ativo', () => {
    const area = rect(-42.5, -19.4, -42.15, -19.15);
    const r = B.api.selecionarPorDesenho('ASSENTAMENTO', area);
    assert(!r.erro && r.ids.length >= 2, 'Desenho não encontrou os assentamentos.');
    assert(r.ids.every(id => B.api.obterRecorte(id).tipo === 'ASSENTAMENTO'), 'Desenho incluiu tipo inativo.');
  });
  test('Desenho inclui município tocado apenas pela borda', () => {
    const area = rect(-39.95, -18.70, -39.91, -18.66);
    const r = B.api.selecionarPorDesenho('MUNICIPIO', area);
    assert(!r.erro && r.ids.length === 1 && r.ids[0] === 'MUN_200', 'Contato lateral não selecionou município completo.');
  });
  test('Desenho válido sem interseções retorna vazio', () => {
    const r = B.api.selecionarPorDesenho('MUNICIPIO', rect(-45, -23, -44.9, -22.9));
    assert(r.erro === null && r.ids.length === 0, 'Desenho vazio foi confundido com erro.');
  });
  test('Desenhos degenerados, cruzados ou com vértices repetidos são rejeitados', () => {
    for (const ring of [ [[0, 0], [1, 1], [2, 2], [0, 0]], [[0, 0], [3, 2], [0, 3], [2, 0], [0, 0]], [[0, 0], [1, 0], [1, 1], [1, 0], [0, 0]] ])
      assert(B.api.selecionarPorDesenho('MUNICIPIO', { type: 'Polygon', coordinates: [ring] }).erro, 'Desenho inválido aceito.');
  });
  test('Vínculos pré-processados são únicos e espacialmente coerentes', () => {
    const seen = new Set();
    for (const link of B.vinculos) {
      const key = [link.id_edicao, link.id_recorte, link.id_variavel, link.id_registro].join('|');
      assert(!seen.has(key), 'Vínculo duplicado.'); seen.add(key);
      assert(intersecta(B.api.obterRecorte(link.id_recorte).geometria, B.api.obterRegistro(link.id_variavel, link.id_registro, link.id_edicao).geometria), 'Vínculo sem interseção.');
    }
  });
  test('Todas as consultas completas correspondem aos IDs únicos dos vínculos', () => {
    for (const recorte of B.recortes) for (const variavel of B.variaveis) {
      const r = B.api.consultar([recorte.id], [variavel.id])[variavel.id];
      if (r.estado !== 'completo') continue;
      const expected = new Set(B.vinculos.filter(v => v.id_edicao === B.edicaoAtual && v.id_recorte === recorte.id && v.id_variavel === variavel.id).map(v => v.id_registro));
      assert(r.total === expected.size && new Set(ids(r)).size === r.total && ids(r).every(id => expected.has(id)), 'Consulta divergente dos vínculos.');
    }
  });
  test('Acervo não modifica vínculos nem resultados analíticos', () => {
    const antes = JSON.stringify(B.api.consultar(['AST_001'], ['CAR', 'PTR']));
    for (const camada of B.acervo) assert(camada.features.every(f => f.type === 'Feature'), 'Camada inválida.');
    const depois = JSON.stringify(B.api.consultar(['AST_001'], ['CAR', 'PTR']));
    assert(antes === depois, 'Inspeção do acervo alterou consulta.');
  });
  global.BI_TEST_RESULTS = report;
  if (typeof document !== 'undefined') {
    const target = document.getElementById('report');
    if (target) {
      const falhas = report.filter(r => !r.sucesso);
      document.getElementById('summary').textContent = `${report.length - falhas.length}/${report.length} verificações aprovadas`;
      report.forEach(r => { const line = document.createElement('li'); line.textContent = `${r.sucesso ? '✓' : '✗'} ${r.nome}${r.erro ? ': ' + r.erro : ''}`; line.style.color = r.sucesso ? '#235c3a' : '#9d2828'; target.append(line); });
    }
  }
})(typeof window !== 'undefined' ? window : globalThis);
