# BI territorial — MDA / Rio Doce
## Especificação funcional e requisitos de dados · versão 1.0

**Data:** 4 de novembro de 2026  
**Destinatários:** equipes de UX e arquitetura de dados  
**Status:** primeira versão para revisão conjunta. Consolida as decisões da conversa e identifica propostas operacionais e lacunas cadastrais.  
**Escopo desta entrega:** especificação funcional e contratos conceituais de dados. O modelo físico, o SQL de implantação e o novo protótipo serão derivados deste documento em etapas seguintes.

## 1. Objetivo

Permitir consultar quantos e quais registros de uma ou mais variáveis estão associados a um conjunto de recortes territoriais do Rio Doce. A experiência começa pela escolha do tipo de recorte e pela seleção de suas unidades no mapa ou na busca. O usuário pode acumular recortes de tipos diferentes e analisar várias variáveis simultaneamente.

A plataforma se destina inicialmente ao uso em computador. As relações espaciais entre cada recorte cadastrado e os registros de cada variável serão processadas antecipadamente. A navegação consulta essas relações prontas.

## 2. Decisões consolidadas

| ID | Regra | Consequência para implementação |
|---|---|---|
| RF01 | Seleção múltipla de recortes, inclusive de tipos diferentes. | A seleção é uma coleção de identificadores, sem duplicatas. |
| RF02 | Todos os recortes selecionados são combinados por união. | Um registro entra se estiver relacionado a pelo menos um recorte selecionado. Não haverá botão de interseção. |
| RF03 | Cada registro é contado uma única vez dentro de sua variável. | Quantidades por recorte não podem ser simplesmente somadas. |
| RF04 | Apenas o tipo de recorte ativo é oferecido no mapa para seleção. | Trocar o tipo muda a camada selecionável, preservando a seleção acumulada. |
| RF05 | Clique, busca textual e desenho selecionam recortes cadastrados. | Desenhar não cria um novo recorte de análise. |
| RF06 | O desenho seleciona recortes que intersectam ou encostam no polígono. | A seleção usa interseção espacial, incluindo fronteiras, restrita ao tipo ativo. |
| RF07 | Camadas do acervo podem ser ligadas e desligadas independentemente. | Visibilidade não altera seleção nem resultados. |
| RF08 | PTRs aprovadas, assentamentos e CAR são variáveis iniciais, com seleção múltipla. | Cada variável tem quantidade, registros e tabela de atributos próprios. |
| RF09 | CAR e assentamentos têm geometria poligonal. Contato parcial já inclui o registro. | Não há exigência de contenção, área mínima ou cálculo proporcional. |
| RF10 | Cruzamentos recorte × variável são previamente processados. | Contagem e listagem não executam cruzamento espacial durante a navegação. |
| RF11 | Cada variável possui sua própria tabela de metadados, com colunas específicas. | O catálogo descreve dinamicamente as colunas de cada variável. |
| RF12 | Novas variáveis serão incorporadas posteriormente. | A interface não pode depender de colunas fixas de CAR, PTR ou assentamentos. |

**Precisão sobre “touch”:** a regra funcional é ter qualquer ponto em comum, inclusive contato de borda, sobreposição ou contenção. Na implementação geoespacial, o predicado deve representar essa regra; um predicado que reconheça apenas contato de fronteira seria insuficiente.

## 3. Catálogo de recortes

| Tipo exibido | Unidade selecionável | Observação |
|---|---|---|
| Buffer de 5 km do rio | Alto, médio e baixo Rio Doce, individualmente | Um único tipo; a antiga “mancha” foi eliminada. Geometrias oficiais serão fornecidas à carga. |
| Municípios da bacia | Cada município | Universo informado de aproximadamente 200 municípios. Cadastro deve identificar os 49 do novo acordo. |
| Assentamentos | Cada assentamento | A mesma entidade territorial também pode aparecer como registro da variável assentamentos. |
| ATIs | Cada agrupamento de municípios | Cadastrar composição municipal e geometria correspondente. |
| Terras indígenas | Cada terra indígena | Usar identificador estável e nome da fonte. |
| Territórios quilombolas | Cada território quilombola | Usar identificador estável e nome da fonte. |

O total de municípios e a lista dos 49 serão validados contra as bases recebidas. Esses números não devem ser usados para inventar registros ou forçar o resultado de uma carga incompleta.

## 4. Organização da interface

Proposta operacional para o próximo protótipo: controles à esquerda, mapa no centro e painel de resultados expansível. A posição final pode ser ajustada por UX, preservando os comportamentos descritos aqui.

| Área | Componentes | Informação exibida |
|---|---|---|
| Recortes | Seletor de tipo, busca, ferramenta de desenho, atalho dos 49 | Tipo ativo e opções de seleção. |
| Seleção acumulada | Etiquetas ou lista com remoção individual e “Limpar recortes” | Nome e tipo de cada recorte, inclusive dos tipos que não estão visíveis no mapa. |
| Variáveis | Controles independentes para PTRs aprovadas, assentamentos e CAR | Variáveis selecionadas. |
| Mapa | Camada selecionável do tipo ativo, controles do acervo, legenda | Polígonos disponíveis, seleção do tipo ativo e camadas visuais habilitadas. |
| Resultados | Uma seção por variável, com “Quantos” e “Quais” | Total de registros únicos e tabela específica da variável. |

Não haverá seletor “União / Interseção”. Junto à seleção, um texto breve informa: “A consulta considera o conjunto dos recortes selecionados, sem duplicar registros”.

## 5. Fluxo e comportamento da seleção

### 5.1 Estado inicial

Nenhum tipo de recorte, recorte ou variável é selecionado automaticamente. O mapa pode abrir com uma referência geral da bacia, sem oferecer todos os tipos de recorte simultaneamente. A chamada inicial é “Qual recorte você quer ver?”. Resultados orientam o usuário a selecionar recortes e variáveis.

### 5.2 Escolher ou trocar o tipo de recorte

O seletor apresenta os seis tipos do catálogo. Ao escolher um tipo, sua camada passa a ser a única selecionável. A camada selecionável anterior é retirada. Os identificadores já selecionados permanecem na lista e continuam compondo a consulta, mesmo quando não estão visíveis.

Ao retornar a um tipo, seus recortes anteriormente selecionados reaparecem destacados. Recortes de outros tipos continuam identificados na lista; não se tornam camadas selecionáveis de fundo. O campo de busca informa o tipo ativo e limpa a expressão anterior ao trocar de tipo.

### 5.3 Clique no mapa

Clicar em um recorte adiciona seu identificador à seleção. Clicar novamente no mesmo recorte remove-o. Não é necessário pressionar Ctrl ou Shift. O destaque e a lista devem refletir a alteração imediatamente.

Quando um clique atingir mais de um recorte do tipo ativo, exibir uma lista de candidatos com nome e identificador para escolha explícita. Não selecionar silenciosamente todos eles. Esta é uma proposta operacional para resolver sobreposições.

### 5.4 Busca textual

A busca é restrita ao tipo ativo. Pesquisa por nome e identificadores cadastrados, com tratamento de maiúsculas/minúsculas e acentuação. Resultados devem informar nome, tipo e um desambiguador disponível, como município ou UF.

Escolher um resultado adiciona o recorte à seleção e enquadra sua geometria no mapa. Se já estiver selecionado, apenas focaliza e sinaliza “Já selecionado”; não duplica nem remove o item. A remoção é feita pelo clique no polígono ou pela lista.

### 5.5 Desenho de polígono

A ferramenta só fica disponível com um tipo ativo. Ao concluir um desenho válido, a plataforma encontra todos os recortes desse tipo que tenham qualquer ponto em comum com ele, inclusive contato de borda. Os identificadores encontrados são adicionados à seleção existente, com eliminação de duplicatas.

O desenho é uma ferramenta transitória de seleção. Sua geometria não restringe os registros de variáveis e não entra como recorte adicional: depois da seleção, vale a geometria integral de cada recorte cadastrado selecionado. Por exemplo, um desenho que toca um município seleciona o município inteiro para a análise.

Ao concluir, informar quantos recortes foram encontrados e quantos foram adicionados. Desenho sem candidatos preserva a seleção e informa “Nenhum recorte encontrado”. Desenho inválido solicita correção; cancelar o desenho não altera a seleção. A operação espacial sobre o desenho é admitida em tempo de uso, pois seleciona recortes, sem cruzar variáveis.

### 5.6 Selecionar os 49 municípios do novo acordo

O comando “Adicionar os 49 municípios do novo acordo” aparece no tipo Municípios. Consulta o vínculo cadastrado com o novo acordo e adiciona o conjunto retornado à seleção, preservando os demais recortes. Repetir o comando não cria duplicatas.

A seleção recebe os municípios individualmente, permitindo remoção de qualquer um. O rótulo ou a mensagem de retorno deve informar a quantidade efetivamente adicionada. Se a carga não tiver os 49 vínculos validados, apresentar a indisponibilidade do atalho; não anunciar seleção completa.

### 5.7 Remover e limpar

Remover uma etiqueta exclui apenas aquele recorte e atualiza os resultados. “Limpar recortes” esvazia todos os recortes selecionados, preservando o tipo ativo, as variáveis e a visibilidade do acervo. Não há ação implícita de selecionar toda a bacia quando a seleção está vazia.

## 6. Variáveis, quantos, quais e metadados

### 6.1 Seleção múltipla de variáveis

Selecionar uma variável abre sua seção de resultados. Desmarcá-la fecha essa seção e remove sua representação de resultados do mapa, se estiver exibida. As demais variáveis e os recortes permanecem selecionados.

PTRs aprovadas, assentamentos e CAR são conjuntos independentes. Não existe total geral somando variáveis: um CAR não é uma unidade comparável a uma PTR ou a um assentamento.

### 6.2 Quantos

A quantidade representa o número de registros distintos da variável vinculados a pelo menos um dos recortes selecionados. Um registro relacionado a dois municípios e uma terra indígena continua valendo um na sua variável.

A identidade é a chave canônica do registro na variável, não a linha de origem da importação nem cada parte de uma geometria multipartida. O tratamento de duplicações na fonte será definido no mapeamento da carga.

**Exemplo:** o recorte A está vinculado aos CAR 1, 2 e 3; o recorte B, aos CAR 3 e 4. Selecionar A e B retorna quatro CAR. O CAR 3 aparece uma única vez na listagem.

### 6.3 Quais

“Ver registros” abre a tabela da variável com o mesmo universo usado na contagem. A tabela é paginada, tem ordenação estável e mostra suas colunas próprias. O total exibido corresponde à contagem; a quantidade de linhas da página não substitui esse total.

Selecionar uma linha permite localizar o registro no mapa e consultar seus atributos. Essa ação não adiciona recortes à seleção. A representação cartográfica deve ser distinguível da camada selecionável de recortes e não capturar seus cliques quando não estiver em modo de inspeção.

### 6.4 Metadados específicos por variável

Neste documento, “tabela de metadados” designa a tabela de atributos dos registros de uma variável, conforme o uso do termo na solicitação. Cada variável possui uma tabela própria, com uma chave que a conecta ao registro canônico e com suas colunas específicas. Não será exigido um conjunto idêntico de colunas para PTRs, CAR e assentamentos.

Separadamente, um catálogo técnico informa à interface quais colunas existem e como apresentá-las. Para cada coluna, deverá informar nome técnico, rótulo, tipo de dado, ordem, visibilidade e, quando aplicável, unidade ou formatação. Esse catálogo descreve a tabela; não substitui os atributos por uma tabela única de chave/valor.

Campos específicos de cada base serão definidos após conhecer os arquivos reais. Fonte e data de referência da base podem aparecer na seção da variável como informações gerais, sem serem confundidas com as colunas de seus registros.

### 6.5 Assentamentos nos dois papéis

Um assentamento selecionado como recorte define território de consulta. Assentamentos selecionados como variável são o conjunto a consultar. Cada papel tem seu próprio controle na interface, embora ambos usem a mesma identidade territorial de origem.

Selecionar o assentamento X como recorte e a variável assentamentos retorna X e quaisquer outros assentamentos que intersectem X, conforme os vínculos preparados, inclusive contato de borda. Não há exclusão automática do próprio assentamento nem restrição a igualdade de identificador.

## 7. Camadas do acervo

O painel “Camadas do acervo” controla somente exibição. Ligar uma camada carrega e mostra suas feições; desligá-la as oculta. A seleção de recortes, variáveis e contagens permanece inalterada.

Uma camada de municípios exibida pelo acervo não torna municípios selecionáveis quando o tipo ativo é Terra indígena. A legenda e os controles devem diferenciar “Recortes para seleção”, “Camadas do acervo” e “Resultados”. A inspeção de uma feição do acervo, se oferecida, abre uma ficha sem alterar a seleção.

## 8. Estado da aplicação e atualização

| Estado | Conteúdo | Persistência proposta |
|---|---|---|
| tipo_recorte_ativo | Identificador de um tipo, ou vazio | Sessão da interface. |
| recortes_selecionados | Conjunto de identificadores canônicos de recorte | Sessão da interface; permite tipos mistos. |
| variaveis_selecionadas | Conjunto de identificadores de variável | Sessão da interface. |
| camadas_visiveis | Identificadores das camadas do acervo habilitadas | Sessão da interface, independente da consulta. |
| estado_tabela_por_variavel | Página e ordenação de cada tabela | Independente por variável. |
| versao_publicada | Identificador da edição consistente de dados consultada | Retornado pelo backend e mantido entre contagem e listagem. |

Não se exige nesta versão gravar seleções em tabelas de usuário ou criar contas. Uma mudança nos recortes atualiza todas as variáveis selecionadas e reinicia suas paginações. Uma mudança em uma variável atualiza apenas sua seção. Trocar o tipo ativo ou alternar uma camada do acervo não recalcula resultados enquanto a seleção permanecer igual.

Durante uma atualização, mostrar carregamento em cada seção afetada. Uma resposta antiga não pode sobrescrever resultados de uma seleção mais recente. Contagem e listagem devem ser vinculadas à mesma seleção e edição dos dados.

## 9. Contrato conceitual de dados

Os nomes abaixo são referências para conectar UX e arquitetura. Não constituem ainda o modelo físico definitivo.

| Objeto proposto | Campos ou vínculos essenciais | Finalidade |
|---|---|---|
| tipo_recorte | id, nome, ordem, ativo | Alimentar o seletor e restringir mapa/busca. |
| recorte | id, tipo_recorte_id, identificador_origem, nome, geometria, edicao | Representar cada unidade selecionável. |
| municipio | recorte_id, cd_mun, nm_mun, sigla_uf, novo_acordo | Sustentar cadastro municipal e atalho dos 49. |
| ati_municipio | ati_recorte_id, municipio_recorte_id | Registrar composição de cada ATI; não confundir composição com cruzamento espacial. |
| variavel | id, nome, ativo, referencia da tabela de metadados | Alimentar o seletor e localizar os atributos de cada conjunto. |
| registro_variavel | id, variavel_id, identificador_origem, geometria, edicao | Dar identidade única e geometria aos registros analisados. |
| metadados_ptr / metadados_car / metadados_assentamento | registro_id e colunas específicas de cada base | Guardar os atributos próprios; relação de um registro para uma ficha nesta proposta. |
| coluna_variavel | variavel_id, nome_coluna, rotulo, tipo, ordem, visivel, formato | Configurar a tabela exibida na interface. |
| recorte_registro | edicao, recorte_id, registro_id | Guardar pares que atendem à regra espacial; cada par é único na edição. |
| camada_acervo | id, nome, descrição, referência de serviço/dados, estilo | Controlar camadas visuais sem alterar a seleção. |
| edicao_dados | id, referência temporal, estado de publicação, situação dos cruzamentos | Publicar geometria, atributos e vínculos de forma consistente. |

Assentamentos precisam de um vínculo estável entre o recorte e o registro da variável correspondente, preferencialmente derivado de uma entidade territorial comum. Não se devem manter cópias independentes sem controle de identidade e atualização.

O backend resolve referências de tabelas e colunas por catálogo controlado. A interface envia identificadores, sem indicar livremente nomes de tabelas para consulta.

## 10. Matriz de interação → dados → retorno

| Ação ou controle | Estado afetado | Objetos/campos consultados | Retorno esperado |
|---|---|---|---|
| Abrir a ferramenta | Estado inicial | tipo_recorte; variavel; camada_acervo | Opções disponíveis, mapa de referência e instrução inicial. |
| Escolher tipo de recorte | tipo_recorte_ativo | recorte.tipo_recorte_id, id, nome, geometria | Apenas os recortes desse tipo ficam selecionáveis. |
| Buscar texto | Expressão transitória | recorte.nome, identificador_origem; município para desambiguação, quando aplicável | Candidatos do tipo ativo. |
| Escolher resultado da busca | recortes_selecionados | recorte.id e geometria | Adição sem duplicação e foco no mapa. |
| Clicar em polígono | recortes_selecionados | recorte.id do tipo ativo | Alternância da seleção desse recorte. |
| Concluir desenho | recortes_selecionados | recorte.geometria e tipo_recorte_id | IDs dos recortes que intersectam o desenho; adição ao conjunto. |
| Adicionar os 49 | recortes_selecionados | municipio.novo_acordo e recorte_id | Inclusão dos municípios vinculados, sem remover seleção anterior. |
| Remover etiqueta | recortes_selecionados | ID já presente no estado | Remoção individual e atualização dos resultados. |
| Limpar recortes | recortes_selecionados | Nenhuma consulta espacial | Seleção vazia e orientação para escolher recortes. |
| Marcar variável | variaveis_selecionadas | variavel.id; recorte_registro; registro_variavel | Seção própria, quantidade e acesso aos registros. |
| Desmarcar variável | variaveis_selecionadas | Nenhum cruzamento novo | Remoção apenas da seção e da representação dessa variável. |
| Atualizar “Quantos” | Resultado por variável | recorte_registro.recorte_id, registro_id; registro_variavel.variavel_id | Contagem distinta dos registros associados a qualquer recorte selecionado. |
| Abrir “Quais” / mudar página | estado_tabela_por_variavel | Mesmo conjunto distinto; tabela própria de metadados; coluna_variavel | Página de registros e colunas específicas; total coerente com “Quantos”. |
| Clicar em registro | Registro em inspeção | registro_variavel.geometria e respectiva ficha de metadados | Destaque e atributos, preservando os recortes. |
| Ligar/desligar camada | camadas_visiveis | camada_acervo | Exibição ou ocultação, sem alterar resultados. |

## 11. Processamento antecipado e consulta

O processamento prepara, para cada edição publicada, as relações entre todos os recortes e todos os registros de cada variável disponível. A regra é qualquer interseção geométrica, incluindo borda. Não é preciso preparar combinações de recortes.

Para uma variável V e um conjunto de recortes S, a consulta retorna os registros distintos de V que tenham pelo menos um vínculo com algum recorte de S. Quantos e quais usam exatamente esse mesmo conjunto de identificadores. A consulta não calcula união de geometrias, área de sobreposição ou cruzamento espacial com variáveis em tempo de navegação.

Alterações de geometria, inclusões ou exclusões de registros exigem atualização dos vínculos afetados antes de publicar nova edição. Contagens e listagens não devem misturar geometrias novas com vínculos antigos. A publicação deve permitir distinguir os seguintes casos:

| Situação | Apresentação |
|---|---|
| Cruzamento concluído sem correspondências | “0 registros”. |
| Cruzamento ainda não processado ou carga indisponível | “Dados indisponíveis para esta consulta”, com indicação da variável afetada. |
| Falha ao consultar | Mensagem de erro e ação para tentar novamente. |

Ausência de linhas na tabela de vínculos, sozinha, não distingue zero de processamento incompleto. A carga deve manter um controle de completude por edição, recorte e variável, ou cobertura equivalente verificável.

## 12. Estados vazios e consistência

| Condição | Comportamento |
|---|---|
| Nenhum tipo ativo | Busca e desenho indisponíveis; orientar escolha do tipo. |
| Tipo ativo, sem recorte selecionado | Mostrar recortes selecionáveis; não consultar toda a bacia por padrão. |
| Recortes selecionados, sem variável | Preservar seleção e orientar escolha de variável. |
| Variável selecionada, sem recortes | Preservar variável e orientar escolha de recortes; não exibir zero como se fosse consulta executada. |
| Consulta completa sem correspondências | Exibir zero e tabela vazia na variável. |
| Erro em uma variável | Sinalizar erro nessa seção; manter as demais funcionais. |
| Uma seleção inclui dados sem cobertura processada | Não exibir total parcial como se fosse completo. |
| Campo de metadados sem valor | Exibir ausência de informação de forma uniforme, sem inventar conteúdo. |

## 13. Critérios de aceite

| ID | Cenário | Resultado esperado |
|---|---|---|
| CA01 | Selecionar município A, trocar para TI e selecionar TI B | Ambos permanecem na lista e compõem a consulta; apenas TIs ficam selecionáveis no mapa. |
| CA02 | Selecionar dois recortes vinculados ao mesmo CAR | O CAR é contado uma vez e aparece uma vez na tabela. |
| CA03 | Desenhar polígono que apenas encosta em um recorte | O recorte é incluído. A análise usa seu território integral. |
| CA04 | Desenhar com o tipo Município ativo sobre uma TI | Só municípios são candidatos à seleção pelo desenho. |
| CA05 | Adicionar os 49 duas vezes | Não surgem duplicatas; recortes anteriores são preservados. |
| CA06 | Selecionar PTRs aprovadas e CAR | Surgem duas seções, cada uma com quantidade e colunas próprias. |
| CA07 | Ligar/desligar camada do acervo | Seleção e contagens permanecem iguais. |
| CA08 | CAR parcialmente sobreposto ou apenas encostado no recorte | O CAR entra na contagem e na listagem pelo vínculo processado. |
| CA09 | Comparar total e tabela de uma variável | Total corresponde aos registros únicos do conjunto completo, independentemente da paginação. |
| CA10 | Usar assentamento como recorte e variável | Papéis permanecem distintos e aplicam a mesma regra espacial. |
| CA11 | Incorporar variável com novas colunas | O catálogo apresenta as colunas sem exigir alterações específicas no componente de tabela. |
| CA12 | Seleção sem recortes | Nenhuma consulta implícita de toda a bacia é executada. |
| CA13 | Cruzamento ainda não processado | Indisponibilidade é exibida; não se apresenta falso zero. |
| CA14 | Alterar rapidamente a seleção | Resposta antiga não substitui o resultado da seleção atual. |
| CA15 | Inspecionar interface e requisições | Não há opção de interseção entre recortes; toda combinação segue união. |

## 14. Informações necessárias para a implementação com bases reais

Estas lacunas não impedem a especificação nem a construção de um protótipo com dados simulados. Devem ser resolvidas antes das cargas e contagens de produção.

| Tema | Informação a fornecer ou validar | Impacto |
|---|---|---|
| PTRs aprovadas | Significado de PTR, unidade de contagem, chave única, critério de aprovação, geometria/localização e campos disponíveis | Evitar assumir que uma linha representa necessariamente uma PTR ou adotar localização incorreta. |
| Buffer | Geometria oficial e delimitação dos trechos alto, médio e baixo | Não gerar limites territoriais por suposição. |
| Municípios | Lista oficial da bacia e vínculo dos 49 com o novo acordo | Validar universo e atalho. |
| ATIs | Identificadores, nomes e composição municipal | Montar cadastro e geometria do agrupamento. |
| Bases das variáveis | Tabelas de origem, chaves e colunas reais de metadados | Fechar dicionário, identidade dos registros e apresentação. |
| Fontes territoriais | Versões de assentamentos, TI e territórios quilombolas | Garantir coerência de geometrias e vínculos. |

## 15. Encaminhamento para as próximas entregas

O modelo de dados deverá detalhar chaves, cardinalidades, tipos, índices, tabelas específicas de metadados e controle das edições e cruzamentos. Deverá preservar os identificadores de regras e critérios deste documento para rastrear decisões.

O novo protótipo deverá materializar seleção por tipo, seleção acumulada, desenho, atalho dos 49, camadas independentes e seções por variável. Usará dados simulados claramente identificados, incluindo um exemplo de registro relacionado a mais de um recorte para demonstrar a eliminação de duplicatas.

A implementação desta especificação elimina a opção de interseção entre recortes. Isso não elimina o teste de interseção geométrica usado para selecionar recortes pelo desenho e para preparar os vínculos recorte × variável: são operações com finalidades distintas.
