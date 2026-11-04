/* Rio Doce — interface local. Consulta síncrona por adaptador BI.api; sem backend. */
'use strict';
(() => {
  if (!window.BI) return;
  const $ = id => document.getElementById(id);
  const numero = n => Number(n).toLocaleString('pt-BR');
  const dom = (tag, text, className) => {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  };
  const state = {
    tipo: '', recortes: new Set(), variaveis: new Set(), edicao: BI.edicaoAtual,
    resultados: {}, acervo: new Set(), tabela: null, pagina: 1, tamanho: 10,
    ordem: { campo: 'id', direcao: 1 }, inspecionado: null,
    sugestoes: [], ativo: -1, desenho: null, exportando: false
  };
  const recortePorId = new Map(BI.recortes.map(r => [r.id, r]));
  const variavelPorId = new Map(BI.variaveis.map(v => [v.id, v]));
  const tipoNome = id => BI.tipos.find(t => t.id === id)?.nome || '';
  let map, selectable, selectedOverlay, resultsLayers, archiveLayers, drawingLayer, inspectionLayer;
  let toastTimer, resizeTimer;
  const mapRecords = new Map();

  function aviso(id, texto) {
    if ($(id)) return;
    const n = dom('div', texto, 'error'); n.id = id; $('errors').append(n);
  }
  function notificar(texto) {
    $('toast').textContent = texto; $('toast').hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { $('toast').hidden = true; }, 5200);
  }
  function refreshMapSize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => map?.invalidateSize({ pan: false }), 40);
  }
  function openPanel(id, open, trigger) {
    $(id).hidden = !open;
    if (trigger) $(trigger).setAttribute('aria-expanded', String(open));
  }

  // ── Seleção e consulta: a navegação não faz cruzamentos das variáveis ──────
  function trocarTipo(tipo) {
    cancelarDesenho(false);
    state.tipo = tipo; $('territory-type').value = tipo; $('search').value = '';
    fecharSugestoes(); renderizarControles(); renderizarRecortes();
  }
  function adicionarRecortes(ids, focalizar = false) {
    let adicionados = 0;
    for (const id of ids) if (recortePorId.has(id) && !state.recortes.has(id)) {
      state.recortes.add(id); adicionados++;
    }
    if (adicionados) atualizarConsulta();
    if (focalizar && ids.length) enquadrarIds(ids);
    return adicionados;
  }
  function alternarRecorte(id) {
    if (state.recortes.has(id)) { state.recortes.delete(id); atualizarConsulta(); }
    else adicionarRecortes([id]);
  }
  function selecionarBusca(id) {
    const added = adicionarRecortes([id], true);
    notificar(added ? 'Recorte adicionado à seleção.' : 'Este recorte já está selecionado. Mapa focalizado.');
    $('search').value = ''; $('search').focus({ preventScroll: true }); fecharSugestoes();
  }
  function limparRecortes() {
    state.recortes.clear(); cancelarDesenho(false); atualizarConsulta();
    notificar('Recortes limpos. Variáveis, tipo ativo e acervo foram preservados.');
  }
  function alternarVariavel(id) {
    state.variaveis.has(id) ? state.variaveis.delete(id) : state.variaveis.add(id);
    if (!state.variaveis.has(state.tabela)) fecharTabela();
    atualizarConsulta();
  }
  function atualizarConsulta() {
    // A implementação atual é síncrona: não há respostas assíncronas obsoletas.
    // Uma API futura deverá validar um identificador de requisição antes de aplicar a resposta.
    state.resultados = BI.api.consultar([...state.recortes], [...state.variaveis], state.edicao);
    state.pagina = 1; state.inspecionado = null;
    map?.closePopup(); inspectionLayer?.clearLayers();
    renderizarControles(); renderizarRecortes(); renderizarResultadosMapa();
    renderizarResultados(); renderizarTabela();
  }
  function renderizarControles() {
    $('search').disabled = !state.tipo;
    $('draw-start').disabled = !state.tipo || !map || !!state.desenho;
    $('agreement-block').hidden = state.tipo !== 'MUNICIPIO';
    $('clear').disabled = !state.recortes.size;
    $('frame').disabled = !state.recortes.size || !map;
    $('selected-count').textContent = numero(state.recortes.size);
    $('selection-empty').hidden = !!state.recortes.size;
    const list = $('selected-list'); list.replaceChildren();
    for (const id of state.recortes) {
      const r = recortePorId.get(id), row = dom('li');
      const label = dom('button', undefined, 'selected-label');
      label.title = 'Focalizar ' + r.nome;
      label.append(dom('strong', r.nome), dom('small', tipoNome(r.tipo) + ' · ' + r.id));
      label.onclick = () => map ? enquadrarIds([id]) : notificar('O mapa está indisponível. Sua seleção está preservada.');
      const remove = dom('button', '×', 'remove'); remove.setAttribute('aria-label', 'Remover ' + r.nome);
      remove.onclick = () => { state.recortes.delete(id); atualizarConsulta(); };
      row.append(label, remove); list.append(row);
    }
    document.querySelectorAll('.variable').forEach(b => {
      const checked = state.variaveis.has(b.dataset.id);
      b.setAttribute('aria-pressed', String(checked)); b.querySelector('.checkbox').textContent = checked ? '✓' : '';
    });
    $('map-layer-title').textContent = state.tipo ? tipoNome(state.tipo) + ' · camada selecionável' : 'Escolha um tipo para exibir os recortes';
    $('map-hint').textContent = !state.tipo ? 'Escolha um tipo de recorte para começar.' :
      state.recortes.size ? 'Clique: adiciona ou remove. A busca apenas adiciona e focaliza.' : 'Clique em um recorte ou desenhe para selecionar vários.';
    renderizarLegenda();
  }

  // ── Busca acessível, sempre restrita ao tipo ativo ────────────────────────
  function fecharSugestoes() {
    $('suggestions').hidden = true; $('search').setAttribute('aria-expanded', 'false');
    $('search').removeAttribute('aria-activedescendant'); state.ativo = -1;
  }
  function mostrarSugestoes() {
    if (!state.tipo) return;
    state.sugestoes = BI.api.listarRecortes(state.tipo, $('search').value); state.ativo = -1;
    const list = $('suggestions'); list.replaceChildren();
    if (!state.sugestoes.length) list.append(dom('div', 'Nenhum território encontrado. Tente outro nome ou identificador.', 'search-empty'));
    else {
      if (!$('search').value.trim()) list.append(dom('div', numero(state.sugestoes.length) + ' recortes disponíveis. Digite para filtrar.', 'search-empty'));
      state.sugestoes.forEach((r, i) => {
        const row = dom('div', undefined, 'suggestion'); row.id = 'sugestao-' + i;
        row.setAttribute('role', 'option'); row.setAttribute('aria-selected', 'false');
        row.append(dom('strong', (state.recortes.has(r.id) ? '✓ ' : '') + r.nome),
          dom('small', [r.id, r.municipio, r.uf, state.recortes.has(r.id) ? 'Já selecionado' : ''].filter(Boolean).join(' · ')));
        row.onmousedown = e => e.preventDefault(); row.onclick = () => selecionarBusca(r.id); list.append(row);
      });
    }
    list.hidden = false; $('search').setAttribute('aria-expanded', 'true');
  }
  function buscaTeclado(e) {
    if (e.key === 'Escape' || e.key === 'Tab') { fecharSugestoes(); return; }
    if (!['ArrowDown', 'ArrowUp', 'Enter'].includes(e.key)) return;
    if ($('suggestions').hidden) mostrarSugestoes();
    const n = state.sugestoes.length; if (!n) return; e.preventDefault();
    if (e.key === 'Enter') { if (state.ativo >= 0) selecionarBusca(state.sugestoes[state.ativo].id); return; }
    state.ativo = state.ativo < 0 ? (e.key === 'ArrowDown' ? 0 : n - 1) : (state.ativo + (e.key === 'ArrowDown' ? 1 : -1) + n) % n;
    document.querySelectorAll('.suggestion').forEach((row, i) => {
      row.classList.toggle('active', i === state.ativo); row.setAttribute('aria-selected', String(i === state.ativo));
    });
    const active = $('sugestao-' + state.ativo); $('search').setAttribute('aria-activedescendant', active.id);
    active.scrollIntoView({ block: 'nearest' });
  }

  // ── Mapa: acervo, camada ativa, seleção, resultados e inspeção separados ───
  function iniciarMapa() {
    if (!window.L || window.estiloMapaFalhou) { aviso('erro-mapa', 'Não foi possível carregar o mapa. Verifique a conexão e recarregue. A busca e as tabelas continuam disponíveis.'); return; }
    map = L.map('map', { zoomControl: false, minZoom: 6, maxZoom: 17 }).setView([-19.45, -41.9], 8);
    L.control.zoom({ position: 'bottomright', zoomInTitle: 'Aproximar', zoomOutTitle: 'Afastar' }).addTo(map);
    for (const [name, z, events] of [['acervo', 310, 'none'], ['resultados', 410, 'none'], ['pontos', 420, 'none'], ['recortes', 430, 'auto'], ['inspecao', 450, 'none'], ['desenho', 460, 'auto']]) {
      const pane = map.createPane(name); pane.style.zIndex = z; pane.style.pointerEvents = events;
    }
    L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 17, attribution: 'Mapa: © <a href="https://www.esri.com/" target="_blank" rel="noopener">Esri</a>, HERE, Garmin, USGS, Intermap, increment P, GEBCO, FAO, NPS, NRCAN, GeoBase, IGN, Kadaster NL, OS, METI, Esri China, © OpenStreetMap contributors, GIS User Community'
    }).on('tileerror', () => aviso('erro-tiles', 'O mapa-base não pôde ser carregado. Geometrias simuladas e consultas continuam disponíveis.')).addTo(map);
    archiveLayers = L.layerGroup().addTo(map); resultsLayers = L.layerGroup().addTo(map);
    selectable = L.layerGroup().addTo(map); selectedOverlay = L.layerGroup().addTo(map);
    inspectionLayer = L.layerGroup().addTo(map); drawingLayer = L.layerGroup().addTo(map);
    map.on('click', e => { if (state.desenho) adicionarVertice([e.latlng.lng, e.latlng.lat]); });
    map.on('popupopen', e => {
      const b = e.popup.getElement().querySelector('.leaflet-popup-close-button');
      if (b) { b.setAttribute('aria-label', 'Fechar detalhes'); b.title = 'Fechar detalhes'; }
    });
    renderizarRecortes(); renderizarResultadosMapa(); renderizarAcervo(); renderizarControles();
  }
  function estiloRecorte(r, hover = false) {
    const selected = state.recortes.has(r.id);
    return { pane: 'recortes', color: selected ? '#285b38' : hover ? '#467b51' : '#788e6c',
      weight: selected ? 2.3 : hover ? 2 : 1, fillColor: '#a1c18b',
      fillOpacity: selected ? .15 : hover ? .14 : .035, dashArray: selected ? '' : '5 4' };
  }
  function renderizarRecortes() {
    if (!map) return;
    selectable.clearLayers(); selectedOverlay.clearLayers();
    // Somente unidades do tipo ativo são selecionáveis ou destacadas aqui.
    for (const r of BI.api.listarRecortes(state.tipo, '')) {
      const layer = L.geoJSON(r.geometria, { pane: 'recortes', interactive: !state.desenho, style: () => estiloRecorte(r) });
      const tip = dom('div'); tip.append(dom('strong', r.nome), dom('div', tipoNome(r.tipo) + ' · ' + r.id));
      layer.bindTooltip(tip, { sticky: true });
      layer.on('mouseover', () => layer.setStyle(estiloRecorte(r, true)));
      layer.on('mouseout', () => layer.setStyle(estiloRecorte(r)));
      layer.on('click', e => cliqueRecorte(e.latlng)); layer.addTo(selectable);
    }
  }
  function cliqueRecorte(latlng) {
    if (state.desenho) return;
    const p = { type: 'Point', coordinates: [latlng.lng, latlng.lat] };
    const candidates = BI.api.listarRecortes(state.tipo, '').filter(r => BI.espacial.intersecta(r.geometria, p));
    if (candidates.length === 1) { alternarRecorte(candidates[0].id); return; }
    if (candidates.length > 1) {
      const box = dom('div'); box.append(dom('div', 'Qual recorte deseja alterar?', 'popup-title'));
      for (const r of candidates) {
        const b = dom('button', (state.recortes.has(r.id) ? '− Remover ' : '+ Adicionar ') + r.nome + ' · ' + r.id, 'choice');
        b.onclick = () => { map.closePopup(); alternarRecorte(r.id); }; box.append(b);
      }
      L.popup().setLatLng(latlng).setContent(box).openOn(map);
    }
  }
  function enquadrarIds(ids) {
    if (!map) return;
    const features = ids.map(id => recortePorId.get(id)).filter(Boolean).map(r => ({ type: 'Feature', properties: {}, geometry: r.geometria }));
    if (!features.length) return;
    map.fitBounds(L.geoJSON(features).getBounds(), { paddingTopLeft: [28, 100], paddingBottomRight: [28, 70], maxZoom: 14 });
  }
  function renderizarResultadosMapa() {
    if (!map) return;
    resultsLayers.clearLayers(); mapRecords.clear();
    for (const id of state.variaveis) {
      const result = state.resultados[id], v = variavelPorId.get(id);
      if (result?.estado !== 'completo') continue;
      for (const record of result.registros) {
        const layer = L.geoJSON(record.geometria, {
          pane: 'resultados', interactive: false,
          style: feature => feature.geometry.type === 'Point' ? { color: '#fff', weight: 1.2, fillColor: v.cor, fillOpacity: .95 } : { color: v.cor, weight: 2, fillColor: v.cor, fillOpacity: .22 },
          pointToLayer: (_, latlng) => L.circleMarker(latlng, { pane: 'pontos', interactive: false, radius: 5.5, color: '#fff', weight: 1.2, fillColor: v.cor, fillOpacity: .95 })
        });
        layer.addTo(resultsLayers); mapRecords.set(id + '|' + record.id, layer);
      }
    }
  }
  function renderizarLegenda() {
    const legend = $('legend'); legend.replaceChildren();
    const add = (label, cls, color) => { const span = dom('span'), i = dom('i', '', cls); if (color) i.style.color = color; span.append(i, document.createTextNode(label)); legend.append(span); };
    if (state.tipo) { add('Disponível', 'available'); add('Selecionado', 'selected'); }
    for (const id of state.variaveis) { const v = variavelPorId.get(id); if (state.resultados[id]?.estado === 'completo') add(v.nome, id === 'PTR' ? 'point' : '', v.cor); }
    if (state.acervo.size) add('Acervo', 'archive');
    legend.hidden = !legend.childElementCount;
  }

  // ── Desenho: interseção apenas para seleção de recortes cadastrados ─────────
  function iniciarDesenho() {
    if (!map || !state.tipo) return;
    state.desenho = []; map.closePopup(); map.doubleClickZoom.disable();
    openPanel('acervo', false, 'acervo-toggle'); $('draw-tools').hidden = false;
    $('workspace').classList.add('drawing'); renderizarRecortes(); renderizarControles(); desenharVertices();
  }
  function adicionarVertice(point) {
    if (!state.desenho) return;
    state.desenho.push(point); desenharVertices();
  }
  function desenharVertices() {
    drawingLayer?.clearLayers(); if (!state.desenho || !map) return;
    const ll = state.desenho.map(([x, y]) => [y, x]);
    if (ll.length > 1) L.polyline(ll, { pane: 'desenho', interactive: false, color: '#9154ab', dashArray: '5 4', weight: 2 }).addTo(drawingLayer);
    ll.forEach((p, i) => {
      const marker = L.circleMarker(p, { pane: 'desenho', radius: 4, color: '#9154ab', fillColor: '#fff', fillOpacity: 1, bubblingMouseEvents: false }).addTo(drawingLayer);
      if (i === 0) { marker.bindTooltip('Clique para concluir'); marker.on('click', concluirDesenho); }
    });
    $('draw-instruction').textContent = `${numero(ll.length)} vértices. Conclua com pelo menos 3 pontos ou clique no primeiro vértice.`;
    $('draw-finish').disabled = ll.length < 3; $('draw-undo').disabled = !ll.length;
  }
  function aplicarDesenho(geometry) {
    const found = BI.api.selecionarPorDesenho(state.tipo, geometry);
    if (found.erro) { notificar(found.erro); return found; }
    const added = adicionarRecortes(found.ids);
    notificar(found.ids.length ? `${numero(found.ids.length)} recortes encontrados; ${numero(added)} adicionados à seleção.` : 'Nenhum recorte do tipo ativo intersecta o desenho.');
    return found;
  }
  function concluirDesenho() {
    if (!state.desenho || state.desenho.length < 3) return;
    const ring = [...state.desenho.map(p => [...p]), [...state.desenho[0]]];
    const found = aplicarDesenho({ type: 'Polygon', coordinates: [ring] });
    if (!found.erro) cancelarDesenho(false);
  }
  function cancelarDesenho(notify = true) {
    if (!state.desenho) return;
    state.desenho = null; drawingLayer?.clearLayers(); map?.doubleClickZoom.enable();
    $('draw-tools').hidden = true; $('workspace').classList.remove('drawing'); renderizarRecortes(); renderizarControles();
    if (notify) notificar('Desenho cancelado. A seleção foi preservada.');
  }

  // ── Acervo: painel e inspeção independentes da análise ─────────────────────
  function renderizarAcervo() {
    archiveLayers?.clearLayers();
    if (map) for (const layer of BI.acervo) if (state.acervo.has(layer.id)) {
      L.geoJSON(layer.features, { pane: 'acervo', interactive: false,
        style: { color: '#738795', weight: 1.3, dashArray: '2 5', fillColor: '#a4b4bd', fillOpacity: .06 },
        pointToLayer: (_, ll) => L.circleMarker(ll, { pane: 'acervo', interactive: false, color: '#738795', radius: 3 })
      }).addTo(archiveLayers);
    }
    renderizarLegenda();
  }
  function alternarAcervo(id, checked) {
    checked ? state.acervo.add(id) : state.acervo.delete(id); renderizarAcervo();
  }
  function inspecionarAcervo(layer) {
    const content = dom('div'); content.append(dom('div', layer.nome, 'popup-title'), dom('p', layer.descricao), dom('p', 'Camada do acervo · não participa da consulta.', 'popup-row'));
    if (map && layer.features.length) {
      const bounds = L.geoJSON(layer.features).getBounds(); map.fitBounds(bounds, { padding: [40, 90] });
      L.popup().setLatLng(bounds.getCenter()).setContent(content).openOn(map);
    } else notificar(layer.nome + ': ' + layer.descricao);
  }

  // ── Resultados por variável, sem total geral ───────────────────────────────
  function renderizarResultados() {
    const container = $('results'); container.replaceChildren();
    $('result-summary').textContent = !state.recortes.size ? 'Adicione recortes para iniciar a consulta.' :
      !state.variaveis.size ? 'Escolha uma ou mais variáveis para avaliar a seleção.' :
        `${numero(state.recortes.size)} recorte${state.recortes.size === 1 ? '' : 's'} em união · ${numero(state.variaveis.size)} variáve${state.variaveis.size === 1 ? 'l' : 'is'}`;
    if (!state.variaveis.size) { container.append(dom('div', 'Selecione variáveis no painel à esquerda para ver quantos registros existem e quais são eles.', 'empty-result')); return; }
    for (const id of state.variaveis) {
      const v = variavelPorId.get(id), result = state.resultados[id];
      const card = dom('section', undefined, 'result-card'); card.dataset.variable = id; card.style.setProperty('--var-color', v.cor); card.append(dom('h3', v.nome));
      if (!state.recortes.size) card.append(dom('p', 'Selecione pelo menos um recorte.', 'source'));
      else if (result?.estado === 'completo') {
        card.append(dom('div', numero(result.total), 'result-number'), dom('p', result.total === 1 ? 'registro único na seleção' : 'registros únicos na seleção', 'result-unit'));
        if (!result.total) card.append(dom('p', 'Consulta completa, sem correspondências.', 'source'));
        card.append(dom('p', v.fonte, 'source'));
        const button = dom('button', 'Ver tabela de atributos →', 'outline'); button.onclick = () => abrirTabela(id); card.append(button);
      } else {
        card.append(dom('p', 'Dados indisponíveis', 'pending'));
        card.append(dom('p', 'Cruzamentos incompletos nesta edição. Nenhuma contagem parcial é exibida.', 'pending-detail'));
        const names = (result?.pendentes || []).map(p => typeof p === 'string' ? recortePorId.get(p)?.nome || p : recortePorId.get(p.id_recorte)?.nome || p.id_recorte || p.motivo).filter(Boolean);
        if (names.length) card.append(dom('p', 'Pendente: ' + names.slice(0, 3).join('; ') + (names.length > 3 ? ` e mais ${names.length - 3}.` : '.'), 'source'));
      }
      const details = dom('details', undefined, 'source-details'); details.append(dom('summary', 'Sobre esta variável'), dom('p', v.descricao, 'source')); card.append(details); container.append(card);
    }
  }

  // ── Tabela genérica: colunas, tipos, ordem e visibilidade do catálogo ───────
  const colunas = v => [...v.colunas].filter(c => c.visivel).sort((a, b) => a.ordem - b.ordem);
  const valorCampo = (record, campo) => campo === 'id' ? record.id : record.atributos[campo];
  function formatar(value, col) {
    if (value === null || value === undefined || value === '') return '—';
    if (col?.tipo === 'booleano' || typeof value === 'boolean') return value ? 'Sim' : 'Não';
    if (col?.tipo === 'numero' || col?.tipo === 'inteiro' || typeof value === 'number') {
      const opts = col?.formato === 'coordenada' ? { minimumFractionDigits: 6, maximumFractionDigits: 6, useGrouping: false } : col?.formato === 'ano' ? { maximumFractionDigits: 0, useGrouping: false } : col?.tipo === 'inteiro' ? { maximumFractionDigits: 0 } : { maximumFractionDigits: 2 };
      const text = Number(value).toLocaleString('pt-BR', opts);
      return col?.formato === 'ha' ? text + ' ha' : col?.formato === 'm2' ? text + ' m²' : text;
    }
    if (col?.tipo === 'data' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value.slice(8, 10) + '/' + value.slice(5, 7) + '/' + value.slice(0, 4);
    return String(value);
  }
  function registrosOrdenados() {
    const records = state.resultados[state.tabela]?.registros || [];
    const v = variavelPorId.get(state.tabela), c = v?.colunas.find(c => c.campo === state.ordem.campo);
    return [...records].sort((a, b) => {
      const aa = valorCampo(a, state.ordem.campo), bb = valorCampo(b, state.ordem.campo);
      let diff;
      if (aa == null || bb == null) diff = aa == null ? (bb == null ? 0 : 1) : -1;
      else if (typeof aa === 'number' && typeof bb === 'number') diff = aa - bb;
      else if (c?.tipo === 'data') diff = String(aa).localeCompare(String(bb));
      else diff = String(aa).localeCompare(String(bb), 'pt-BR', { numeric: true, sensitivity: 'base' });
      return diff * state.ordem.direcao || a.id.localeCompare(b.id, 'pt-BR', { numeric: true });
    });
  }
  function abrirTabela(id) {
    state.tabela = id; state.pagina = 1; state.ordem = { campo: 'id', direcao: 1 };
    $('table-panel').hidden = false; $('workspace').classList.add('has-table');
    renderizarTabela(); refreshMapSize();
  }
  function fecharTabela() {
    state.tabela = null; $('table-panel').hidden = true; $('workspace').classList.remove('has-table'); refreshMapSize();
  }
  function renderizarTabela() {
    if (!state.tabela) return;
    if (!state.recortes.size || !state.variaveis.has(state.tabela)) { fecharTabela(); return; }
    const v = variavelPorId.get(state.tabela), result = state.resultados[state.tabela], cols = colunas(v);
    $('table-title').textContent = v.nome;
    const head = $('metadata-table').querySelector('thead'), body = $('metadata-table').querySelector('tbody'); head.replaceChildren(); body.replaceChildren();
    const tr = dom('tr'); tr.append(dom('th', 'Mapa'));
    for (const col of cols) {
      const th = dom('th'), button = dom('button', col.rotulo + (state.ordem.campo === col.campo ? (state.ordem.direcao === 1 ? ' ↑' : ' ↓') : ' ↕'));
      th.setAttribute('aria-sort', state.ordem.campo === col.campo ? (state.ordem.direcao === 1 ? 'ascending' : 'descending') : 'none');
      button.onclick = () => { state.ordem = { campo: col.campo, direcao: state.ordem.campo === col.campo ? -state.ordem.direcao : 1 }; state.pagina = 1; renderizarTabela(); };
      th.append(button); tr.append(th);
    }
    head.append(tr);
    const records = result?.estado === 'completo' ? registrosOrdenados() : [], pages = Math.max(1, Math.ceil(records.length / state.tamanho));
    state.pagina = Math.min(state.pagina, pages);
    const start = (state.pagina - 1) * state.tamanho;
    for (const record of records.slice(start, start + state.tamanho)) {
      const row = dom('tr'); row.dataset.id = record.id; row.classList.toggle('inspected', state.inspecionado === state.tabela + '|' + record.id);
      const cell = dom('td'), inspect = dom('button', 'Localizar ↗', 'inspect-button'); inspect.disabled = !map;
      inspect.setAttribute('aria-label', 'Inspecionar ' + record.id + ' no mapa'); inspect.onclick = () => inspecionarRegistro(state.tabela, record.id); cell.append(inspect); row.append(cell);
      for (const col of cols) { const text = formatar(valorCampo(record, col.campo), col), td = dom('td', text); td.title = text; row.append(td); }
      body.append(row);
    }
    $('table-empty').hidden = !!records.length;
    $('table-empty').textContent = result?.estado === 'completo' ? 'Consulta completa: nenhum registro encontrado na união selecionada.' : 'Dados indisponíveis nesta edição. A tabela não exibe resultados parciais.';
    $('table-caption').textContent = records.length ? `${numero(start + 1)}–${numero(Math.min(start + state.tamanho, records.length))} de ${numero(records.length)} registros · ${v.fonte}` : result?.estado === 'completo' ? '0 registros · consulta completa' : 'Cobertura incompleta';
    $('page-label').textContent = `${state.pagina} / ${pages}`;
    $('page-prev').disabled = state.pagina <= 1; $('page-next').disabled = state.pagina >= pages;
    $('table-export').disabled = !records.length || !window.XLSX || state.exportando;
    $('table-export').title = !window.XLSX ? 'Biblioteca XLSX indisponível; verifique sua conexão.' : !records.length ? 'Não há registros completos para exportar.' : 'Exportar todos os registros desta variável, não apenas esta página';
    $('table-export').querySelector('span').textContent = state.exportando ? 'Gerando planilha…' : 'Baixar tabela (.xlsx)';
  }
  function inspecionarRegistro(idVariavel, idRegistro) {
    const result = state.resultados[idVariavel];
    if (result?.estado !== 'completo') return;
    const record = result.registros.find(r => r.id === idRegistro), v = variavelPorId.get(idVariavel);
    if (!record || !map) return;
    state.inspecionado = idVariavel + '|' + idRegistro; inspectionLayer.clearLayers();
    const highlight = L.geoJSON(record.geometria, {
      pane: 'inspecao', interactive: false, style: { color: '#9d6b16', weight: 4, fillColor: '#f3cb71', fillOpacity: .4 },
      pointToLayer: (_, ll) => L.circleMarker(ll, { pane: 'inspecao', interactive: false, radius: 10, color: '#9d6b16', fillColor: '#f3cb71', fillOpacity: .8 })
    }).addTo(inspectionLayer);
    const popup = dom('div'); popup.append(dom('div', v.nome + ' · ' + record.id, 'popup-title'));
    for (const col of [...v.colunas].sort((a, b) => a.ordem - b.ordem)) {
      const row = dom('div', undefined, 'popup-row'); row.append(dom('b', col.rotulo + ': '), document.createTextNode(formatar(valorCampo(record, col.campo), col))); popup.append(row);
    }
    popup.append(dom('p', 'Registro simulado · inspeção não altera a seleção.', 'source'));
    map.fitBounds(highlight.getBounds(), { paddingTopLeft: [45, 100], paddingBottomRight: [45, 65], maxZoom: 13 });
    L.popup({ maxWidth: 320, autoPan: false }).setLatLng(highlight.getBounds().getCenter()).setContent(popup).openOn(map);
    renderizarTabela();
  }

  // ── Exportação: registros completos, incluindo campos não visíveis ─────────
  function criarPlanilha(id, snapshot = null) {
    const v = variavelPorId.get(id), s = snapshot || { result: state.resultados[id], ids: [...state.recortes], edicao: state.edicao };
    if (s.result?.estado !== 'completo') throw new Error('Cobertura incompleta');
    const rows = s.result.registros.map(r => ({ id: r.id, ...r.atributos, geometria_geojson: JSON.stringify(r.geometria) }));
    const wb = XLSX.utils.book_new(), sheet = XLSX.utils.json_to_sheet(rows);
    sheet['!cols'] = Object.keys(rows[0] || {}).map(key => ({ wch: key === 'geometria_geojson' ? 50 : 24 }));
    XLSX.utils.book_append_sheet(wb, sheet, 'Dados');
    const meta = [['Campo', 'Informação'], ['Variável', v.nome], ['Fonte', v.fonte], ['Edição', s.edicao], ['Total exportado', rows.length], ['Operação', 'União com deduplicação por identificador'], ['Data da geração', new Date().toISOString()], ['Natureza', 'Protótipo — dados simulados; geometrias esquemáticas'], ['Cobertura', 'Completa para todos os recortes selecionados']];
    for (const idRecorte of s.ids) { const r = recortePorId.get(idRecorte); meta.push(['Recorte', r.id + ' · ' + tipoNome(r.tipo) + ' · ' + r.nome]); }
    const consulta = XLSX.utils.aoa_to_sheet(meta); consulta['!cols'] = [{ wch: 24 }, { wch: 85 }];
    XLSX.utils.book_append_sheet(wb, consulta, 'Consulta'); return wb;
  }
  async function exportarPlanilha() {
    if (state.exportando || !window.XLSX || !state.tabela || state.resultados[state.tabela]?.estado !== 'completo' || !state.resultados[state.tabela].registros.length) return;
    const id = state.tabela, snapshot = { result: state.resultados[id], ids: [...state.recortes], edicao: state.edicao };
    state.exportando = true; renderizarTabela();
    try {
      await new Promise(resolve => setTimeout(resolve, 80));
      XLSX.writeFile(criarPlanilha(id, snapshot), 'Rio_Doce__' + id + '__' + snapshot.edicao + '.xlsx', { compression: true });
      notificar('Planilha gerada com todos os registros da variável.');
    } catch (e) { notificar('Não foi possível gerar a planilha. Verifique a conexão e tente novamente.'); }
    finally { state.exportando = false; renderizarTabela(); }
  }

  // ── Inicialização e dependências externas isoladas ─────────────────────────
  for (const tipo of BI.tipos) { const option = dom('option', tipo.nome); option.value = tipo.id; $('territory-type').append(option); }
  for (const edition of BI.edicoes) { const option = dom('option', edition.nome); option.value = edition.id; $('edition').append(option); }
  $('edition').value = state.edicao;
  for (const v of BI.variaveis) {
    const b = dom('button', undefined, 'variable'); b.dataset.id = v.id; b.setAttribute('aria-pressed', 'false');
    const symbol = dom('i', '', 'var-symbol' + (v.id === 'PTR' ? ' point' : '')); symbol.style.color = v.cor;
    b.append(dom('span', '', 'checkbox'), dom('span', v.nome), symbol); b.onclick = () => alternarVariavel(v.id); $('variables').append(b);
  }
  for (const layer of BI.acervo) {
    const box = dom('div', undefined, 'archive-item'), label = dom('label'), check = dom('input'); check.type = 'checkbox'; check.dataset.layer = layer.id;
    check.onchange = () => alternarAcervo(layer.id, check.checked); label.append(check, document.createTextNode(layer.nome));
    const inspect = dom('button', 'Inspecionar camada ↗', 'link-button'); inspect.onclick = () => inspecionarAcervo(layer);
    box.append(label, dom('p', layer.descricao), inspect); $('acervo-items').append(box);
  }
  $('territory-type').onchange = e => trocarTipo(e.target.value);
  $('edition').onchange = e => { state.edicao = e.target.value; atualizarConsulta(); };
  $('search').oninput = mostrarSugestoes; $('search').onfocus = mostrarSugestoes; $('search').onkeydown = buscaTeclado;
  document.addEventListener('click', e => { if (!e.target.closest('.search-wrap')) fecharSugestoes(); });
  $('clear').onclick = limparRecortes;
  $('agreement').onclick = () => { const n = adicionarRecortes(BI.api.idsNovoAcordo()); notificar(`${numero(n)} municípios adicionados. Grupo demonstrativo de 49 municípios, sem duplicatas.`); enquadrarIds(BI.api.idsNovoAcordo()); };
  $('draw-start').onclick = iniciarDesenho; $('draw-finish').onclick = concluirDesenho;
  $('draw-cancel').onclick = () => cancelarDesenho(); $('draw-undo').onclick = () => { state.desenho?.pop(); desenharVertices(); };
  $('frame').onclick = () => enquadrarIds([...state.recortes]);
  $('acervo-toggle').onclick = () => openPanel('acervo', $('acervo').hidden, 'acervo-toggle');
  $('acervo-close').onclick = () => openPanel('acervo', false, 'acervo-toggle');
  $('help-toggle').onclick = () => openPanel('help', $('help').hidden, 'help-toggle');
  $('help-close').onclick = () => { openPanel('help', false, 'help-toggle'); $('help-toggle').focus(); };
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { cancelarDesenho(); openPanel('help', false, 'help-toggle'); openPanel('acervo', false, 'acervo-toggle'); } });
  $('table-close').onclick = fecharTabela; $('table-export').onclick = exportarPlanilha;
  $('page-size').onchange = e => { state.tamanho = Number(e.target.value); state.pagina = 1; renderizarTabela(); };
  $('page-prev').onclick = () => { state.pagina--; renderizarTabela(); };
  $('page-next').onclick = () => { state.pagina++; renderizarTabela(); };
  function carregarScript(url) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script'); let settled = false;
      const finish = ok => { if (settled) return; settled = true; clearTimeout(timeout); ok ? resolve() : reject(new Error('Dependência indisponível')); };
      const timeout = setTimeout(() => finish(false), 12000);
      script.src = url; script.onload = () => finish(true); script.onerror = () => finish(false); document.head.append(script);
    });
  }
  atualizarConsulta();
  carregarScript('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js').then(iniciarMapa).catch(() => aviso('erro-mapa', 'Não foi possível carregar o mapa. Verifique a conexão e recarregue. A busca, as seleções e as tabelas continuam disponíveis.'));
  carregarScript('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js').then(renderizarTabela).catch(() => aviso('erro-xlsx', 'Exportação XLSX indisponível: a biblioteca não carregou. Verifique sua conexão e recarregue.'));
  // Interface de diagnóstico usada pelos testes locais, sem dados de autenticação.
  window.RioDoce = { state, trocarTipo, adicionarRecortes, alternarRecorte, selecionarBusca, limparRecortes,
    alternarVariavel, atualizarConsulta, abrirTabela, fecharTabela, registrosOrdenados,
    alternarAcervo, inspecionarAcervo, inspecionarRegistro, iniciarDesenho, adicionarVertice, concluirDesenho,
    cancelarDesenho, aplicarDesenho, criarPlanilha, cliqueRecorte,
    get map() { return map; }, get mapRecords() { return mapRecords; }, get selectable() { return selectable; } };
})();
