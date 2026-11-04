# MDA / ANATER — Rio Doce · BI territorial

Protótipo desktop para validar com a equipe de UX a seleção territorial, a consulta de múltiplas variáveis e a futura integração com o backend. Mantém a tecnologia e a direção visual do protótipo anterior: HTML, CSS, JavaScript, Leaflet e mapa como elemento principal.

**Protótipo — dados simulados.** Os registros, limites, municípios, composição das ATIs e grupo de 49 municípios usados na interface são demonstrativos. As geometrias são esquemáticas e não constituem delimitações oficiais. Os dados municipais já existentes em `dados/` foram preservados; não foram adotados como fonte nem homologados por esta implementação.

## Abrir localmente

Abra `index.html` por duplo clique em um navegador desktop. Mantenha as pastas `css/` e `js/` ao lado do arquivo. Não é necessário instalar pacotes, executar build, configurar servidor, autenticar no GitHub ou conectar a um banco.

O navegador lê os scripts locais diretamente por `<script src>`. Não há `fetch` de arquivos locais nem leitura de `.env`.

É necessária internet para carregar:

- Leaflet **1.9.4**, pelo unpkg: navegação e renderização do mapa.
- SheetJS **0.18.5**, pelo jsDelivr: exportação de planilhas XLSX.
- Mapa-base topográfico da **Esri**, com atribuição exibida no mapa.

Os cadastros, registros, atributos e vínculos analíticos são locais. A interface informa falhas de dependências; a indisponibilidade do mapa-base não transforma registros ausentes em zero. Sem a biblioteca XLSX, a exportação fica indisponível.

## Estrutura

| Arquivo/pasta | Responsabilidade |
| --- | --- |
| `index.html` | Estrutura da interface e entrada local. |
| `css/styles.css` | Identidade visual, layout desktop e estados dos controles. |
| `js/app.js` | Estado da seleção, controles, mapa, resultados, tabelas e exportação. |
| `js/data.js` | Catálogos, fixtures, geometrias, vínculos preparados e adaptador de consulta. |
| `tests/data.test.js` | Verificações automatizadas do modelo e das regras espaciais. |
| `tests/data_checks.html` | Página local que executa os testes de dados no navegador. |
| `README.md` | Uso, regras, decisões provisórias e integração. |
| `dados/` | Arquivos municipais preexistentes, preservados sem alteração. |

A implementação foi feita com base no briefing da nova versão. Os documentos [Especificação funcional](Especificacao_Funcional_BI_Rio_Doce_v1.md) e [Modelo de dados e diagramas](Modelo_de_Dados_BI_Rio_Doce_v1.md#4-diagramas-de-relacionamentos), adicionados posteriormente ao projeto, estão agora versionados como referências. Os arquivos `01_modelo_bi_rio_doce.sql` e `02_consultas_interface.sql` não estão presentes no repositório.

## Seleção e consulta

1. Escolha o tipo de recorte. Somente suas unidades ficam disponíveis para seleção no mapa. Os tipos são buffer de 5 km do rio (alto, médio e baixo), municípios da bacia, assentamentos, ATIs, terras indígenas e territórios quilombolas.
2. Adicione recortes por clique, busca ou desenho de polígono. No tipo Municípios, também existe o atalho dos 49 municípios do novo acordo, com composição simulada explicitamente identificada.
3. Selecione uma ou mais variáveis: **PTRs aprovadas**, **Assentamentos** e **CAR**. Cada variável mantém sua própria contagem, conjunto de feições e tabela de atributos.
4. Abra a tabela para ordenar, paginar e inspecionar registros. A inspeção destaca a geometria sem modificar os recortes escolhidos.

### Regras de seleção

- A seleção é acumulada entre tipos e combinada exclusivamente por **união**. Alterar o tipo ativo troca a camada selecionável e preserva recortes e resultados anteriores.
- Clique no mapa alterna a inclusão do recorte. Quando houver candidatos sobrepostos do tipo ativo, a interface permite escolher entre eles.
- A busca considera somente o tipo ativo, ignora caixa e acentos e aceita nome ou identificador. Escolher uma sugestão adiciona e focaliza o recorte. Se ele já estiver selecionado, apenas o focaliza e informa a situação.
- O desenho seleciona **recortes cadastrados inteiros** que intersectem ou encostem no polígono. Não é uma área livre de consulta. A conclusão valida a geometria; cancelamento e desenho sem correspondências não removem seleções anteriores.
- O atalho adiciona os mesmos 49 identificadores à seleção existente. Repetições não duplicam itens, e cada município pode ser removido individualmente.
- **Limpar recortes** remove apenas os recortes. Preserva tipo ativo, variáveis e visibilidade das camadas do acervo.
- Sem recortes, não é realizada consulta sobre toda a bacia. Sem variáveis, a interface solicita sua escolha.

### Registros e cobertura

Para cada variável, a consulta reúne os identificadores vinculados a todos os recortes escolhidos e elimina repetições. Por exemplo, CAR 1, 2 e 3 vinculados a um recorte e CAR 3 e 4 vinculados a outro produzem quatro registros únicos de CAR. Não existe soma geral entre variáveis.

CAR e assentamentos são polígonos. Qualquer contato espacial é suficiente: borda compartilhada, sobreposição parcial ou contenção. Não há limiar de área nem contagem proporcional. Os assentamentos têm a mesma identidade e a mesma geometria como recorte e como registro da variável; por isso, a consulta inclui o próprio assentamento e os outros que o intersectem.

**Zero** significa consulta válida com cobertura completa e nenhuma correspondência. Se faltar cobertura para qualquer combinação recorte × variável × edição consultada, o resultado da variável é **indisponível**: não é apresentado um total parcial como completo. A contagem, o mapa, a tabela e a exportação devem usar o mesmo conjunto autorizado pelo estado de cobertura.

### Acervo independente

As camadas do acervo servem como referência visual. Ligar, desligar ou inspecionar suas feições não altera seleção analítica, variáveis, contagens ou tabelas. Uma camada municipal do acervo não torna municípios selecionáveis enquanto o tipo ativo é Terra indígena. A representação do acervo é distinta da camada de seleção e dos resultados.

## Dados simulados e decisões provisórias

- O conjunto contém 224 recortes: 200 municípios, três buffers, 14 assentamentos, três ATIs, duas terras indígenas e dois territórios quilombolas. As variáveis contêm 165 registros pontuais de PTR, 14 assentamentos e 97 CAR.
- Fixtures determinísticas possuem identidades estáveis e coordenadas GeoJSON em WGS84, na ordem longitude/latitude. Recortes e registros são esquemáticos na região do Rio Doce.
- O cadastro municipal e o subconjunto de 49 servem para testar escala de navegação e adição em lote. Não constituem a relação oficial do novo acordo.
- Os três buffers representam unidades esquemáticas para testar a interação. Não são o resultado de cálculo métrico de um buffer de 5 km sobre uma hidrografia oficial.
- ATIs são agrupamentos simulados de municípios, com associação explícita; não se atribui outro significado à sigla.
- **PTRs aprovadas:** cada registro fictício é contado por seu identificador e exibido como ponto. A definição de PTR, sua unidade real de contagem e sua geometria ainda precisam ser fornecidas. Nenhuma definição de negócio foi inferida.
- As colunas específicas por variável são exemplos plausíveis, não um esquema de produção homologado. Os registros não contêm dados pessoais reais.
- A edição dos dados identifica um conjunto coerente de registros e vínculos. Alterações de dados em produção exigirão nova edição e reprocessamento da cobertura correspondente, antes de sua publicação como completa.

Para alterar exemplos, edite os catálogos e as fixtures de `js/data.js`. Para incluir uma variável, acrescente seu cadastro, registros, colunas de apresentação e cobertura/vínculos. O componente de tabela usa o catálogo de colunas, em vez de codificar campos de CAR ou PTR.

## Integração com o backend

O objeto `BI.api` de `js/data.js` separa o acesso aos dados da interface. Os vínculos são preparados uma única vez na inicialização; a navegação consulta identificadores já vinculados. O teste espacial executado ao desenhar é exclusivamente um mecanismo de seleção de recortes existentes.

Não é necessário preparar cada combinação possível de recortes. No backend, a união corresponde a buscar vínculos pelos identificadores selecionados, agrupar por variável e aplicar `DISTINCT` ao identificador do registro dentro da edição solicitada. A cobertura deve ser verificada antes de publicar resultados.

| Objeto conceitual | Papel no protótipo e futura integração |
| --- | --- |
| `tipo_recorte` | Catálogo do seletor e filtro da camada selecionável/busca. |
| `recorte` | Identidade, nome, tipo e geometria de cada unidade selecionável. |
| `municipio` | Unidades municipais e atributo que identifica o subconjunto do acordo. |
| `ati_municipio` | Associações que compõem cada ATI; permite formar sua geometria a partir dos municípios. |
| `variavel` | Nome, fonte, representação geométrica e configuração de cada variável. |
| `registro_variavel` | Identificador estável e geometria de cada registro, associados à variável e à edição. |
| Tabelas próprias de metadados | Atributos específicos de PTRs aprovadas, CAR e assentamentos; recuperados pelo identificador do registro. |
| `coluna_variavel` | Campo, rótulo, tipo, ordem, visibilidade e formatação usados pela tabela genérica. |
| `recorte_registro` | Vínculos pré-processados entre recortes e registros; base da união deduplicada. |
| `cobertura_cruzamento` | Estado de processamento por recorte, variável e edição; diferencia zero completo de indisponibilidade. |
| `edicao_dados` | Versão coerente do conjunto de dados e seus cruzamentos. |
| `camada_acervo` | Catálogo e feições de referência, independentes da consulta analítica. |

Ao substituir o adaptador local por chamadas assíncronas, use um identificador crescente de consulta ou cancelamento de requisições. Só aplique respostas cujo identificador ainda corresponda à seleção e à edição atuais. Ordenação, paginação e exportação devem usar o mesmo filtro e a mesma edição; não recalcule contagens pela área visível do mapa.

### Matriz de ações

| Ação da interface | Dados consultados | Efeito esperado |
| --- | --- | --- |
| Escolher tipo | `tipo_recorte`, `recorte` | Trocar camada selecionável e sugestões; preservar seleção acumulada. |
| Buscar e escolher recorte | `recorte` do tipo ativo | Adicionar sem duplicar e focalizar geometria. |
| Clicar em recorte | Geometrias de `recorte` do tipo ativo | Escolher candidato quando necessário e alternar sua inclusão. |
| Concluir desenho | Geometrias de `recorte` do tipo ativo | Adicionar todos os recortes que intersectem ou toquem o desenho. |
| Adicionar os 49 | `municipio` com indicador do acordo | Acrescentar o subconjunto sem duplicação ou perda de outros tipos. |
| Selecionar variável/alterar recortes | `edicao_dados`, `cobertura_cruzamento`, `recorte_registro`, `registro_variavel` | Produzir conjunto único por variável, se toda a cobertura estiver disponível. |
| Abrir/ordenar/paginar tabela | `coluna_variavel` e tabela própria de metadados | Exibir os atributos do mesmo conjunto consultado, com ordenação estável. |
| Inspecionar registro | `registro_variavel` e metadados | Mostrar atributos e destacar geometria sem mudar recortes. |
| Exportar XLSX | Registros completos e contexto da consulta | Exportar o conjunto atual com seus atributos e parâmetros. |
| Ligar/desligar/inspecionar acervo | `camada_acervo` | Alterar somente referências visuais. |
| Limpar recortes | Estado local da seleção | Esvaziar recortes/resultados e preservar variáveis, tipo e acervo. |

## Casos reproduzíveis

As fixtures de `js/data.js` incluem cenários conhecidos:

| Caso | Identificadores | Resultado esperado |
| --- | --- | --- |
| União com registro repetido | `MUN_001` + `MUN_002`, variável `CAR` | Quatro CAR únicos; `CAR_003` tem vínculo com os dois municípios e entra uma vez. |
| Zero completo | `MUN_200`, edição `ED_2026_11` | Zero para cada uma das três variáveis, com cobertura completa. |
| Cobertura indisponível | `TI_002`, variável `CAR`, edição `ED_2026_11` | Total indisponível e nenhum resultado parcial publicado. |
| Assentamento nos dois papéis | `AST_001` (Assentamento Nova Alvorada), variável `ASSENTAMENTOS` | Inclui `AST_001` e `AST_002` (Vale Verde), que se sobrepõem. |
| Adição repetida em lote | Atalho dos 49, tipo `MUNICIPIO` | Acrescenta `MUN_001` a `MUN_049`; repetir não duplica. |
| Edições | `ATI_002`, variável `PTR`, edições `ED_2026_11` e `ED_2026_09` | A edição de novembro tem cobertura completa; setembro indica reprocessamento e resultado indisponível. |

Os tipos no adaptador são `BUFFER`, `MUNICIPIO`, `ASSENTAMENTO`, `ATI`, `TERRA_INDIGENA` e `QUILOMBOLA`; as variáveis são `PTR`, `ASSENTAMENTOS` e `CAR`. O cadastro municipal contém 200 unidades fictícias (`MUN_001` a `MUN_200`).

## Roteiro de verificação

Abra `tests/data_checks.html` diretamente no navegador para executar a suíte de dados e regras espaciais, sem bibliotecas externas. Os passos abaixo complementam essa suíte com navegação e inspeção visual.

1. Selecione um município e uma variável, troque para outro tipo e selecione outro recorte. Confirme que o município e os resultados permanecem, com união sem duplicações.
2. Volte a Municípios e acione duas vezes o atalho dos 49. Confirme que a segunda ação não altera a seleção; remova um item individualmente.
3. Busque um item já selecionado. Confirme que permanece selecionado; clique novamente em sua geometria para removê-lo.
4. Desenhe um polígono que atravesse ou toque a borda de recortes do tipo ativo. Confirme a seleção das unidades inteiras, a restrição ao tipo ativo e a preservação da seleção anterior. Teste cancelamento, desenho inválido e nenhum resultado.
5. Escolha as três variáveis. Confirme três seções, colunas distintas, paginação e ordenação estável. Compare contagem, quantidade de registros na tabela e feições no mapa.
6. Inspecione um registro e alterne camadas do acervo. Confirme que recortes, resultados e tabelas não mudam.
7. Selecione um assentamento como recorte e como variável. Confirme a presença de seu próprio registro e dos assentamentos que o intersectam.
8. Teste seleção vazia, consulta completa com zero e cobertura indisponível. Confirme que apenas o segundo caso exibe zero e que nenhum resultado antigo permanece.
9. Limpe recortes. Confirme a preservação das variáveis, tipo ativo e visibilidade do acervo.
10. Abra o HTML diretamente e examine os estados inicial, selecionado, tabela e inspeção em 1366 × 768 e 1920 × 1080. Simule a falha das dependências e verifique avisos claros.

## Verificação executada nesta entrega

Em 4 de novembro de 2026, o HTML foi aberto por `file://` no Chrome local e validado em **1366 × 768** e **1920 × 1080**, incluindo mapa, seleção e tabela expansível.

- **25 testes de dados e geometria aprovados**, disponíveis em `tests/data_checks.html` e `tests/data.test.js`.
- **32 verificações de integração aprovadas** no navegador: estado inicial, preservação entre tipos, busca aditiva, clique de alternância, repetição dos 49, remoção individual, acervo independente, limpeza, desenho por contato de borda, desenho inválido/vazio, conclusão/cancelamento, zero, cobertura incompleta, catálogo de colunas, paginação, ordenação, inspeção, edições, exportação e falha das dependências.
- Comparação dos identificadores de contagem, mapa e tabela para todas as consultas completas dos **224 recortes × três variáveis** da edição atual.
- Interações reais de teclado na busca e de mouse no mapa, incluindo lista de candidatos sobrepostos e desenho de quatro vértices, aprovadas.
- XLSX das três variáveis gerados e lidos independentemente com **openpyxl**: 41 PTRs, 22 CAR e dois assentamentos na seleção dos 49. Conferidos identificadores, total, todos os atributos, geometria GeoJSON e aba `Consulta`; o botão de download também foi acionado.
- Teste de conteúdo textual no popup, sem execução de HTML fornecido nos atributos.
- Nenhum erro de JavaScript observado nos fluxos testados. Falhas de Leaflet e SheetJS foram simuladas, mantendo a consulta por busca e a tabela utilizáveis.

As ferramentas de automação e de leitura de XLSX foram usadas apenas para verificação; não são dependências de execução do protótipo. Não foram testados outros navegadores nem a abertura das planilhas no Excel/LibreOffice. Não houve integração com uma API ou banco de produção.

## Pendências para produção

Homologar as fontes e listas oficiais, a composição das ATIs e dos 49 municípios; substituir as geometrias esquemáticas; definir PTR; pactuar os campos e tipos de cada variável; implementar publicação por edição, processamento e cobertura dos cruzamentos; e substituir `BI.api` pelo serviço definitivo. Não há conexão com banco de produção nesta entrega.
