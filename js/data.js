/*
 * BI territorial — catálogo e fixtures determinísticos, sem acesso a rede.
 * Todos os nomes, limites, registros e o grupo de 49 abaixo são simulados.
 * Os arquivos fornecidos em dados/ são preservados, mas não são consumidos.
 * GeoJSON em WGS84: longitude antes de latitude.
 */
(function (global) {
  'use strict';

  // 1. Catálogos de apresentação (tipo_recorte, variavel, coluna_variavel).
  const tipos = [
    { id: 'BUFFER', nome: 'Buffer de 5 km do rio' },
    { id: 'MUNICIPIO', nome: 'Municípios da bacia' },
    { id: 'ASSENTAMENTO', nome: 'Assentamentos' },
    { id: 'ATI', nome: 'ATIs' },
    { id: 'TERRA_INDIGENA', nome: 'Terras indígenas' },
    { id: 'QUILOMBOLA', nome: 'Territórios quilombolas' }
  ];
  const coluna = (campo, rotulo, tipo, ordem, formato = null, visivel = true) =>
    ({ campo, rotulo, tipo, ordem, visivel, formato });
  const variaveis = [
    {
      id: 'PTR', nome: 'PTRs aprovadas', cor: '#c58433', fonte: 'Cadastro demonstrativo de PTRs',
      descricao: 'Registros fictícios representados provisoriamente por pontos. Definição, unidade de contagem e geometria definitiva de PTR ainda pendentes.',
      colunas: [coluna('id', 'Identificador', 'texto', 1), coluna('nome', 'Nome demonstrativo', 'texto', 2),
        coluna('situacao', 'Situação', 'texto', 3), coluna('competencia', 'Competência', 'texto', 4),
        coluna('categoria', 'Categoria demonstrativa', 'texto', 5), coluna('data_atualizacao', 'Atualização', 'data', 6, 'data'),
        coluna('latitude', 'Latitude', 'numero', 7, 'coordenada'), coluna('longitude', 'Longitude', 'numero', 8, 'coordenada'),
        coluna('observacao', 'Observação', 'texto', 9, null, false)]
    },
    {
      id: 'ASSENTAMENTOS', nome: 'Assentamentos', cor: '#317d9b', fonte: 'Cadastro demonstrativo de assentamentos',
      descricao: 'Polígonos fictícios. Cadastro compartilhado com os recortes de assentamentos; contato de borda também inclui o registro.',
      colunas: [coluna('id', 'Identificador', 'texto', 1), coluna('nome', 'Assentamento', 'texto', 2),
        coluna('municipio_referencia', 'Município de referência', 'texto', 3), coluna('uf', 'UF', 'texto', 4),
        coluna('area_declarada_ha', 'Área declarada (ha)', 'numero', 5, 'decimal'),
        coluna('familias_previstas', 'Famílias previstas', 'inteiro', 6, 'inteiro'),
        coluna('ano_criacao', 'Ano de criação', 'inteiro', 7, 'ano'), coluna('fase', 'Fase demonstrativa', 'texto', 8),
        coluna('data_atualizacao', 'Atualização', 'data', 9, 'data')]
    },
    {
      id: 'CAR', nome: 'CAR', cor: '#8d649d', fonte: 'Cadastro demonstrativo de CAR',
      descricao: 'Imóveis fictícios representados por polígonos. Qualquer interseção inclui o imóvel inteiro, sem percentual mínimo ou rateio de área.',
      colunas: [coluna('id', 'Identificador', 'texto', 1), coluna('nome', 'Imóvel demonstrativo', 'texto', 2),
        coluna('codigo_demonstrativo', 'Código demonstrativo', 'texto', 3),
        coluna('area_declarada_ha', 'Área declarada (ha)', 'numero', 4, 'decimal'),
        coluna('condicao', 'Condição demonstrativa', 'texto', 5), coluna('categoria_imovel', 'Categoria do imóvel', 'texto', 6),
        coluna('ano_referencia', 'Ano de referência', 'inteiro', 7, 'ano'), coluna('data_atualizacao', 'Atualização', 'data', 8, 'data'),
        coluna('observacao', 'Observação', 'texto', 9, null, false)]
    }
  ];
  const edicoes = [
    { id: 'ED_2026_11', nome: 'Novembro de 2026 · simulação', data: '2026-11-04', descricao: 'Edição atual; CAR da TI_002 ainda sem cruzamento validado.' },
    { id: 'ED_2026_09', nome: 'Setembro de 2026 · simulação', data: '2026-09-01', descricao: 'Edição anterior; PTRs da ATI_002 em reprocessamento e CAR da TI_002 ainda indisponível.' }
  ];
  const edicaoAtual = edicoes[0].id;

  // 2. Geometria: interseção inclusiva nas bordas, anéis internos e MultiPolygon.
  // Nenhuma consulta analítica usa apenas caixa envolvente: bbox é só um filtro.
  const EPS = 1e-10;
  const r6 = n => Math.round(n * 1e6) / 1e6;
  const mesmoPonto = (a, b) => Math.abs(a[0] - b[0]) <= EPS && Math.abs(a[1] - b[1]) <= EPS;
  const orientacao = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  function noSegmento(p, a, b) {
    return Math.abs(orientacao(a, b, p)) <= EPS &&
      p[0] >= Math.min(a[0], b[0]) - EPS && p[0] <= Math.max(a[0], b[0]) + EPS &&
      p[1] >= Math.min(a[1], b[1]) - EPS && p[1] <= Math.max(a[1], b[1]) + EPS;
  }
  function segmentosIntersectam(a, b, c, d) {
    const o1 = orientacao(a, b, c), o2 = orientacao(a, b, d);
    const o3 = orientacao(c, d, a), o4 = orientacao(c, d, b);
    if (((o1 > EPS && o2 < -EPS) || (o1 < -EPS && o2 > EPS)) &&
        ((o3 > EPS && o4 < -EPS) || (o3 < -EPS && o4 > EPS))) return true;
    return noSegmento(c, a, b) || noSegmento(d, a, b) || noSegmento(a, c, d) || noSegmento(b, c, d);
  }
  function pontoNoAnel(p, anel) {
    let dentro = false;
    for (let i = 1; i < anel.length; i++) {
      const a = anel[i - 1], b = anel[i];
      if (noSegmento(p, a, b)) return 2; // 2 = borda, 1 = interior, 0 = exterior.
      if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0]) dentro = !dentro;
    }
    return dentro ? 1 : 0;
  }
  function pontoNoPoligono(p, aneis) {
    const exterior = pontoNoAnel(p, aneis[0]);
    if (!exterior) return false;
    if (exterior === 2) return true;
    for (const anel of aneis.slice(1)) {
      const hit = pontoNoAnel(p, anel);
      if (hit === 2) return true;
      if (hit === 1) return false;
    }
    return true;
  }
  const poligonos = g => g.type === 'MultiPolygon' ? g.coordinates : [g.coordinates];
  const cacheBounds = new WeakMap();
  function bounds(g) {
    if (cacheBounds.has(g)) return cacheBounds.get(g);
    const pontos = g.type === 'Point' ? [g.coordinates] : poligonos(g).flat(2);
    const b = [Infinity, Infinity, -Infinity, -Infinity];
    for (const p of pontos) { b[0] = Math.min(b[0], p[0]); b[1] = Math.min(b[1], p[1]); b[2] = Math.max(b[2], p[0]); b[3] = Math.max(b[3], p[1]); }
    cacheBounds.set(g, b); return b;
  }
  function aneisIntersectam(a, b) {
    for (const anelA of a) for (const anelB of b)
      for (let i = 1; i < anelA.length; i++) for (let j = 1; j < anelB.length; j++)
        if (segmentosIntersectam(anelA[i - 1], anelA[i], anelB[j - 1], anelB[j])) return true;
    return false;
  }
  function intersecta(a, b) {
    const ba = bounds(a), bb = bounds(b);
    if (ba[2] < bb[0] - EPS || bb[2] < ba[0] - EPS || ba[3] < bb[1] - EPS || bb[3] < ba[1] - EPS) return false;
    if (a.type === 'Point' && b.type === 'Point') return mesmoPonto(a.coordinates, b.coordinates);
    if (a.type === 'Point') return poligonos(b).some(p => pontoNoPoligono(a.coordinates, p));
    if (b.type === 'Point') return poligonos(a).some(p => pontoNoPoligono(b.coordinates, p));
    return poligonos(a).some(pa => poligonos(b).some(pb =>
      aneisIntersectam(pa, pb) || pontoNoPoligono(pa[0][0], pb) || pontoNoPoligono(pb[0][0], pa)));
  }
  function validaPoligono(g) {
    if (!g || g.type !== 'Polygon' || !Array.isArray(g.coordinates) || g.coordinates.length !== 1)
      return 'Desenhe um único polígono, sem áreas internas vazias.';
    const ring = g.coordinates[0];
    if (!Array.isArray(ring) || ring.length < 4) return 'Marque pelo menos três vértices diferentes para concluir.';
    if (ring.some(p => !Array.isArray(p) || p.length !== 2 || !p.every(Number.isFinite) || Math.abs(p[0]) > 180 || Math.abs(p[1]) > 90))
      return 'O desenho contém coordenadas inválidas.';
    if (!mesmoPonto(ring[0], ring[ring.length - 1])) return 'O polígono precisa estar fechado.';
    const vertices = ring.slice(0, -1);
    for (let i = 0; i < vertices.length; i++) for (let j = i + 1; j < vertices.length; j++)
      if (mesmoPonto(vertices[i], vertices[j])) return 'O desenho repete um vértice. Desfaça o ponto repetido ou recomece.';
    let area2 = 0;
    for (let i = 0; i < ring.length - 1; i++) area2 += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
    if (Math.abs(area2) < EPS) return 'O desenho não forma uma área válida. Use pontos que não estejam na mesma linha.';
    const n = ring.length - 1;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      if (j === i + 1 || (i === 0 && j === n - 1)) continue;
      if (segmentosIntersectam(ring[i], ring[i + 1], ring[j], ring[j + 1])) return 'As linhas do desenho se cruzam ou se tocam. Desfaça vértices ou recomece.';
    }
    return null;
  }
  function retangulo(x0, y0, x1, y1) {
    const a = [r6(x0), r6(y0)], b = [r6(x1), r6(y0)], c = [r6(x1), r6(y1)], d = [r6(x0), r6(y1)];
    return { type: 'Polygon', coordinates: [[a, b, c, d, [...a]]] };
  }
  function octogono(cx, cy, rx, ry) {
    const ring = [[-1, -.45], [-.6, -1], [.45, -.9], [1, -.3], [.85, .6], [.2, 1], [-.65, .8], [-1, .1]]
      .map(([x, y]) => [r6(cx + x * rx), r6(cy + y * ry)]);
    ring.push([...ring[0]]); return { type: 'Polygon', coordinates: [ring] };
  }
  // Corredor métrico aproximado de 5 km para cada lado de uma linha ESQUEMÁTICA.
  // Não é um buffer oficial nem um produto geodésico. Deve ser substituído no backend.
  function corredor5km(linha) {
    const sx = 105000, sy = 111320, xy = linha.map(([x, y]) => [x * sx, y * sy]);
    const normals = xy.slice(1).map((p, i) => { const dx = p[0] - xy[i][0], dy = p[1] - xy[i][1], len = Math.hypot(dx, dy); return [-dy / len, dx / len]; });
    const lados = [-1, 1].map(side => xy.map((p, i) => {
      const a = normals[Math.max(0, i - 1)], b = normals[Math.min(normals.length - 1, i)];
      let nx = a[0] + b[0], ny = a[1] + b[1]; const len = Math.hypot(nx, ny); nx /= len; ny /= len;
      const miter = 5000 / (nx * b[0] + ny * b[1]);
      return [r6((p[0] + side * miter * nx) / sx), r6((p[1] + side * miter * ny) / sy)];
    }));
    const ring = [...lados[0], ...lados[1].reverse()]; ring.push([...ring[0]]);
    return { type: 'Polygon', coordinates: [ring] };
  }

  // 3. Cadastros (municipio, recorte, ati_municipio, registro_variavel).
  const recortes = [];
  const adicionarRecorte = (id, tipo, nome, geometria, municipio = '', uf = '', extra = {}) => {
    const r = { id, tipo, nome, geometria, municipio, uf, simulado: true, ...extra }; recortes.push(r); return r;
  };
  const municipios = [];
  for (let i = 0; i < 200; i++) {
    const col = i % 20, row = Math.floor(i / 20), x = -43.15 + col * .16, y = -20 + row * .14;
    const id = 'MUN_' + String(i + 1).padStart(3, '0');
    const nome = 'Município simulado ' + String(i + 1).padStart(3, '0');
    municipios.push(adicionarRecorte(id, 'MUNICIPIO', nome, retangulo(x, y, x + .16, y + .14), nome, col < 15 ? 'MG' : 'ES', { novo_acordo: i < 49 }));
  }
  const linhasRio = [
    [[-43.10, -19.95], [-42.85, -19.72], [-42.62, -19.50], [-42.40, -19.30]],
    [[-42.40, -19.30], [-42.20, -19.04], [-41.95, -18.90], [-41.58, -19.10]],
    [[-41.58, -19.10], [-41.23, -19.29], [-40.78, -19.53], [-40.35, -19.46], [-39.95, -19.50]]
  ];
  ['Alto Rio Doce', 'Médio Rio Doce', 'Baixo Rio Doce'].forEach((nome, i) =>
    adicionarRecorte(['BUF_ALTO', 'BUF_MEDIO', 'BUF_BAIXO'][i], 'BUFFER', nome, corredor5km(linhasRio[i]), '', i < 2 ? 'MG' : 'MG / ES', { largura_km: 5, observacao: 'Buffer aproximado sobre eixo esquemático, sem validade territorial.' }));

  const assentamentos = [
    adicionarRecorte('AST_001', 'ASSENTAMENTO', 'Assentamento Nova Alvorada', octogono(-42.36, -19.29, .085, .064), 'Município simulado 106', 'MG'),
    adicionarRecorte('AST_002', 'ASSENTAMENTO', 'Assentamento Vale Verde', octogono(-42.29, -19.28, .085, .064), 'Município simulado 106', 'MG'),
    adicionarRecorte('AST_003', 'ASSENTAMENTO', 'Assentamento Sementes do Vale', octogono(-41.92, -18.91, .075, .06), 'Município simulado 148', 'MG')
  ];
  for (let i = 3; i < 14; i++) {
    const m = municipios[20 + (i * 13) % 140], b = bounds(m.geometria);
    assentamentos.push(adicionarRecorte('AST_' + String(i + 1).padStart(3, '0'), 'ASSENTAMENTO', 'Assentamento demonstrativo ' + String(i + 1).padStart(2, '0'), octogono((b[0] + b[2]) / 2, (b[1] + b[3]) / 2, .055, .045), m.nome, m.uf));
  }
  const atiMunicipio = [];
  for (let i = 0; i < 3; i++) {
    const membros = municipios.filter((m, idx) => idx % 20 >= i * 6 && idx % 20 < i * 6 + 6 && Math.floor(idx / 20) >= 2 && Math.floor(idx / 20) < 7);
    const id = 'ATI_' + String(i + 1).padStart(3, '0');
    // Municípios contíguos; o contorno dissolvido é este retângulo esquemático.
    const boxes = membros.map(m => bounds(m.geometria));
    const geom = retangulo(Math.min(...boxes.map(b => b[0])), Math.min(...boxes.map(b => b[1])), Math.max(...boxes.map(b => b[2])), Math.max(...boxes.map(b => b[3])));
    adicionarRecorte(id, 'ATI', ['ATI demonstrativa Alto Vale', 'ATI demonstrativa Médio Vale', 'ATI demonstrativa Baixo Vale'][i], geom, '', i === 2 ? 'MG / ES' : 'MG');
    membros.forEach(m => atiMunicipio.push({ id_ati: id, id_municipio: m.id }));
  }
  adicionarRecorte('TI_001', 'TERRA_INDIGENA', 'Terra indígena demonstrativa do Vale', octogono(-41.23, -19.29, .10, .08), 'Município simulado 113', 'MG');
  adicionarRecorte('TI_002', 'TERRA_INDIGENA', 'Terra indígena demonstrativa da Foz', octogono(-40.32, -19.44, .09, .065), 'Município simulado 098', 'ES', { observacao: 'CAR: cobertura ainda indisponível nesta fixture.' });
  adicionarRecorte('TQ_001', 'QUILOMBOLA', 'Território quilombola demonstrativo da Serra', octogono(-41.91, -18.88, .07, .05), 'Município simulado 148', 'MG');
  adicionarRecorte('TQ_002', 'QUILOMBOLA', 'Território quilombola demonstrativo do Rio', { type: 'MultiPolygon', coordinates: [octogono(-42.20, -19.03, .04, .035).coordinates, octogono(-42.10, -19.07, .035, .03).coordinates] }, 'Município simulado 127', 'MG');

  const registros = { PTR: [], ASSENTAMENTOS: [], CAR: [] };
  const adicionarRegistro = (v, id, geometria, atributos) => {
    const r = { id, geometria, atributos: { id, ...atributos, data_atualizacao: '2026-11-04' } }; registros[v].push(r); return r;
  };
  assentamentos.forEach((a, i) => adicionarRegistro('ASSENTAMENTOS', a.id, a.geometria, {
    nome: a.nome, municipio_referencia: a.municipio, uf: a.uf, area_declarada_ha: 230 + i * 37.25,
    familias_previstas: 18 + i * 4, ano_criacao: 2010 + i % 12, fase: i % 2 ? 'Em estruturação' : 'Consolidado'
  }));
  function adicionarCar(id, geometria, numero) {
    return adicionarRegistro('CAR', id, geometria, { nome: 'Imóvel demonstrativo ' + String(numero).padStart(3, '0'),
      codigo_demonstrativo: 'SIM-CAR-' + String(numero).padStart(5, '0'), area_declarada_ha: r6(12.5 + numero * 2.75),
      condicao: numero % 3 ? 'Em análise' : 'Análise demonstrativa concluída', categoria_imovel: numero % 2 ? 'Pequena propriedade' : 'Imóvel rural', ano_referencia: 2026,
      observacao: 'Área declarada fictícia; não calculada a partir do desenho esquemático.' });
  }
  // Fixture explícita de união: MUN_001={1,2,3}, MUN_002={3,4} => quatro CAR.
  adicionarCar('CAR_001', retangulo(-43.13, -19.98, -43.10, -19.95), 1);
  adicionarCar('CAR_002', retangulo(-43.07, -19.98, -43.04, -19.95), 2);
  adicionarCar('CAR_003', retangulo(-43.01, -19.97, -42.97, -19.93), 3);
  adicionarCar('CAR_004', retangulo(-42.95, -19.98, -42.92, -19.95), 4);
  for (let i = 5; i <= 94; i++) {
    const m = municipios[10 + (i * 7) % 165], b = bounds(m.geometria), cx = (b[0] + b[2]) / 2, cy = (b[1] + b[3]) / 2;
    adicionarCar('CAR_' + String(i).padStart(3, '0'), octogono(cx, cy, .033 + (i % 3) * .006, .027), i);
  }
  // Registros próximos aos exemplos usados na demonstração, sem dados pessoais.
  adicionarCar('CAR_095', octogono(-42.36, -19.29, .022, .019), 95);
  adicionarCar('CAR_096', octogono(-42.29, -19.28, .022, .019), 96);
  adicionarCar('CAR_097', octogono(-40.32, -19.44, .022, .019), 97);
  for (let i = 1; i <= 164; i++) {
    const m = municipios[3 + (i * 11) % 181], b = bounds(m.geometria);
    const lng = r6(b[0] + .035 + (i % 5) * .02), lat = r6(b[1] + .035 + (i % 4) * .02);
    adicionarRegistro('PTR', 'PTR_' + String(i).padStart(3, '0'), { type: 'Point', coordinates: [lng, lat] }, {
      nome: 'Registro fictício PTR ' + String(i).padStart(3, '0'), situacao: 'Aprovada', competencia: '2026-11',
      categoria: i % 2 ? 'Exemplo A' : 'Exemplo B', latitude: lat, longitude: lng,
      observacao: 'Um registro fictício corresponde a um ponto apenas para validação de UX; não define a unidade real de PTR.'
    });
  }
  adicionarRegistro('PTR', 'PTR_165', { type: 'Point', coordinates: [-42.36, -19.29] }, {
    nome: 'Registro fictício PTR 165', situacao: 'Aprovada', competencia: '2026-11', categoria: 'Exemplo A', latitude: -19.29, longitude: -42.36,
    observacao: 'Representação pontual provisória.'
  });

  // 4. Edições imutáveis em consulta: metadados separados por edição.
  const registrosPorEdicao = { [edicaoAtual]: registros };
  registrosPorEdicao.ED_2026_09 = Object.fromEntries(variaveis.map(v => [v.id, registros[v.id].map(r => ({ ...r,
    atributos: { ...r.atributos, data_atualizacao: '2026-09-01', ...(v.id === 'PTR' ? { competencia: '2026-09' } : {}) }
  }))]));
  const recortePorId = new Map(recortes.map(r => [r.id, r]));
  const variavelPorId = new Map(variaveis.map(v => [v.id, v]));
  const vinculos = [], cobertura = [];
  const indiceVinculos = new Map(), indiceCobertura = new Map();
  const chave = (edicao, recorte, variavel) => [edicao, recorte, variavel].join('|');
  // Pré-processamento único. Navegação somente agrega IDs destes vínculos.
  const relacoesBase = new Map();
  for (const r of recortes) for (const v of variaveis) {
    const ids = registros[v.id].filter(obj => intersecta(r.geometria, obj.geometria)).map(obj => obj.id);
    relacoesBase.set(r.id + '|' + v.id, ids);
  }
  for (const edicao of edicoes) for (const r of recortes) for (const v of variaveis) {
    const pendente = r.id === 'TI_002' && v.id === 'CAR';
    const reprocessando = edicao.id === 'ED_2026_09' && r.id === 'ATI_002' && v.id === 'PTR';
    const status = pendente ? 'indisponivel' : reprocessando ? 'em_processamento' : 'completa';
    const c = { id_edicao: edicao.id, id_recorte: r.id, id_variavel: v.id, estado: status,
      atualizado_em: edicao.data, motivo: pendente ? 'Cruzamento ainda não validado.' : reprocessando ? 'Cruzamento em reprocessamento nesta edição.' : '' };
    cobertura.push(c); indiceCobertura.set(chave(edicao.id, r.id, v.id), c);
    const ids = status === 'completa' ? relacoesBase.get(r.id + '|' + v.id) : [];
    indiceVinculos.set(chave(edicao.id, r.id, v.id), new Set(ids));
    for (const id of ids) vinculos.push({ id_edicao: edicao.id, id_recorte: r.id, id_variavel: v.id, id_registro: id });
  }

  // 5. Acervo independente: somente referência visual/inspeção, nunca seleção.
  const feature = (id, nome, geometry, extra = {}) => ({ type: 'Feature', id, geometry, properties: { nome, simulado: true, ...extra } });
  const acervo = [
    { id: 'AC_MUNICIPIOS', nome: 'Grade municipal de referência', descricao: 'Os 200 limites esquemáticos; apenas referência, sem seleção analítica.', cor: '#87958a',
      features: municipios.map(m => feature(m.id, m.nome, m.geometria, { tipo: 'Município simulado' })) },
    { id: 'AC_RIO', nome: 'Eixo esquemático do Rio Doce', descricao: 'Traçado simplificado para orientar a demonstração; não é hidrografia oficial.', cor: '#72a9b7',
      features: linhasRio.map((linha, i) => feature('RIO_' + i, ['Trecho alto', 'Trecho médio', 'Trecho baixo'][i], { type: 'LineString', coordinates: linha })) },
    { id: 'AC_REFERENCIAS', nome: 'Pontos de referência demonstrativos', descricao: 'Locais fictícios para testar inspeção independente da consulta.', cor: '#76817d',
      features: [[-42.38, -19.34], [-41.95, -18.86], [-40.48, -19.48]].map((p, i) => feature('REF_' + i, 'Referência demonstrativa ' + (i + 1), { type: 'Point', coordinates: p })) }
  ];

  // 6. Adaptador substituível por API. Não faz testes espaciais nas consultas.
  const normalizar = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim();
  const api = {
    listarRecortes(tipo, termo = '') {
      const q = normalizar(termo);
      return recortes.filter(r => r.tipo === tipo && normalizar([r.nome, r.id, r.municipio, r.uf].join(' ')).includes(q));
    },
    consultar(idsRecortes, idsVariaveis, edicao = edicaoAtual) {
      const ids = [...new Set(idsRecortes)], saida = {};
      for (const vid of new Set(idsVariaveis)) {
        if (!variavelPorId.has(vid)) continue;
        if (!ids.length) { saida[vid] = { estado: 'sem_recortes', registros: [], total: null, pendentes: [], edicao }; continue; }
        const pendentes = ids.map(id => indiceCobertura.get(chave(edicao, id, vid)) || {
          id_edicao: edicao, id_recorte: id, id_variavel: vid, estado: 'indisponivel', motivo: 'Não existe cobertura validada para esta edição e recorte.'
        }).filter(c => c.estado !== 'completa');
        if (pendentes.length) { saida[vid] = { estado: 'indisponivel', registros: [], total: null, pendentes, edicao }; continue; }
        const registrosIds = new Set();
        ids.forEach(id => indiceVinculos.get(chave(edicao, id, vid)).forEach(rid => registrosIds.add(rid)));
        const completos = registrosPorEdicao[edicao][vid].filter(r => registrosIds.has(r.id));
        saida[vid] = { estado: 'completo', registros: completos, total: completos.length, pendentes: [], edicao };
      }
      return saida;
    },
    selecionarPorDesenho(tipo, geometria) {
      const erro = validaPoligono(geometria);
      if (erro) return { ids: [], erro };
      if (!tipos.some(t => t.id === tipo)) return { ids: [], erro: 'Escolha um tipo de recorte antes de desenhar.' };
      return { ids: recortes.filter(r => r.tipo === tipo && intersecta(r.geometria, geometria)).map(r => r.id), erro: null };
    },
    idsNovoAcordo() { return municipios.filter(m => m.novo_acordo).map(m => m.id); },
    obterRecorte(id) { return recortePorId.get(id) || null; },
    obterRegistro(variavel, id, edicao = edicaoAtual) { return registrosPorEdicao[edicao]?.[variavel]?.find(r => r.id === id) || null; }
  };

  global.BI = {
    tipos, recortes, municipios, variaveis, registros, registrosPorEdicao, edicoes, edicaoAtual,
    vinculos, cobertura, atiMunicipio, acervo, api,
    espacial: { intersecta, validaPoligono, bounds, retangulo },
    fixtures: { uniao: ['MUN_001', 'MUN_002'], uniaoCarIds: ['CAR_001', 'CAR_002', 'CAR_003', 'CAR_004'],
      zero: 'MUN_200', indisponivel: 'TI_002', variavelIndisponivel: 'CAR', assentamentosSobrepostos: ['AST_001', 'AST_002'],
      reprocessamentoAnterior: 'ATI_002' },
    notas: [
      '200 municípios e composição dos 49 inteiramente simulados; não correspondem à lista oficial.',
      'Todas as geometrias são esquemáticas. Os buffers aproximam 5 km por lado de um eixo fictício.',
      'PTR: um identificador fictício por ponto; unidade e geometria reais ainda pendentes de definição.',
      'Áreas e famílias nos atributos são exemplos e não cálculos geométricos ou dados pessoais.'
    ]
  };
})(typeof window !== 'undefined' ? window : globalThis);
