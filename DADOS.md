# Dados da plataforma

## Finalidade e estado do catálogo

Este arquivo descreve todos os tipos de recorte e variáveis do escopo atual, o significado de seus registros, os atributos da demonstração e os insumos necessários para usar dados reais. A interface está em [FUNCIONAMENTO_PLATAFORMA.md](FUNCIONAMENTO_PLATAFORMA.md) e as relações entre os dados estão em [MODELO_LOGICO.md](MODELO_LOGICO.md).

O inventário abaixo foi conferido em [prototipo/js/data.js](prototipo/js/data.js). Os nomes, identificadores, geometrias e atributos desse arquivo são simulados. As fontes de produção e seus responsáveis precisam ser confirmados nas pendências ao final. Os nomes de campos apresentados aqui permitem localizar os exemplos no código e orientar o dicionário das fontes reais.

## 1. Recortes territoriais

Um recorte é uma unidade territorial cadastrada que o usuário pode selecionar inteira. Cada unidade possui identificação estável, tipo, nome e geometria de área. Os recortes podem se sobrepor e participar de uma seleção conjunta.

| Código do tipo | Nome na interface | O que representa | Unidades e identidades na demonstração | Geometria e observações |
| --- | --- | --- | --- | --- |
| BUFFER | Buffer de 5 km do rio | Faixa territorial associada aos trechos alto, médio e baixo Rio Doce. | 3 unidades, BUF_ALTO, BUF_MEDIO e BUF_BAIXO. | Polígonos aproximados a partir de um eixo fictício, com 5 km por lado na simulação. Delimitação e metodologia oficiais pendentes. |
| MUNICIPIO | Municípios da bacia | Unidades municipais do universo territorial do projeto. A referência funcional considera aproximadamente 200 municípios. | 200 unidades, MUN_001 a MUN_200, nomeadas Município simulado 001 a 200. | Polígonos retangulares em uma grade fictícia, com indicação de MG ou ES. Universo e limites oficiais pendentes. |
| ASSENTAMENTO | Assentamentos | Territórios de assentamentos usados para delimitar a consulta. | 14 unidades, AST_001 a AST_014. | Polígonos. Identidades e geometrias compartilhadas com a variável ASSENTAMENTOS. |
| ATI | ATIs | Agrupamentos de municípios cadastrados para seleção territorial. | 3 unidades, ATI_001, ATI_002 e ATI_003. | Polígonos que representam o contorno de grupos municipais simulados. A composição é registrada explicitamente. |
| TERRA_INDIGENA | Terras indígenas | Unidades territoriais indígenas disponibilizadas para consulta. | 2 unidades, TI_001 e TI_002. | Polígonos demonstrativos. A identificação e a delimitação de produção dependem da fonte aprovada. |
| QUILOMBOLA | Territórios quilombolas | Unidades territoriais quilombolas disponibilizadas para consulta. | 2 unidades, TQ_001 e TQ_002. | TQ_001 é Polygon e TQ_002 é MultiPolygon com duas partes. Todas as partes representam uma única unidade. |

O catálogo simulado contém **224 recortes**. Os intervalos acima cobrem todas as unidades. A lista completa, com suas coordenadas, é produzida deterministicamente pelo arquivo de dados do protótipo.

### Exemplos nomeados e agrupamentos

| Conjunto | Conteúdo da demonstração | Significado para a plataforma |
| --- | --- | --- |
| Trechos do buffer | Alto Rio Doce, Médio Rio Doce e Baixo Rio Doce. | Três unidades selecionáveis do tipo BUFFER. |
| Assentamentos nomeados | AST_001 é Assentamento Nova Alvorada, AST_002 é Assentamento Vale Verde e AST_003 é Assentamento Sementes do Vale. AST_004 a AST_014 usam nomes demonstrativos numerados. | AST_001 e AST_002 se sobrepõem para verificar seleção e consulta. |
| ATIs | ATI_001 é ATI demonstrativa Alto Vale, ATI_002 é ATI demonstrativa Médio Vale e ATI_003 é ATI demonstrativa Baixo Vale. | Cada ATI tem 30 municípios associados na simulação, registrados em atiMunicipio. A composição real está pendente. |
| Terras indígenas | TI_001 é Terra indígena demonstrativa do Vale e TI_002 é Terra indígena demonstrativa da Foz. | TI_002 também serve ao exemplo de cobertura indisponível para CAR. |
| Territórios quilombolas | TQ_001 é Território quilombola demonstrativo da Serra e TQ_002 é Território quilombola demonstrativo do Rio. | O segundo exemplo verifica unidades compostas por partes separadas. |
| Municípios do novo acordo | MUN_001 a MUN_049 possuem novo_acordo igual a verdadeiro na demonstração. | O atalho acrescenta um grupo de 49 unidades do catálogo municipal. A lista oficial deve ser validada para produção. |

### Informações dos recortes

| Informação | Significado e uso | Representação atual |
| --- | --- | --- |
| Identificador | Distinguir cada unidade entre todos os tipos. Deve ser conservado na seleção e nos vínculos. | id, como MUN_001. |
| Tipo | Definir em qual opção de seleção a unidade aparece. | tipo, com os seis códigos do catálogo. |
| Nome | Apresentar a unidade na busca, lista e mapa. | nome. |
| Geometria | Delimitar a unidade inteira, inclusive partes separadas e eventuais furos. | geometria em GeoJSON Polygon ou MultiPolygon. |
| Município e UF de referência | Ajudar a desambiguar nomes quando a informação estiver disponível. | municipio e uf. |
| Identificador de origem | Permitir correspondência com o cadastro oficial e atualização consistente. | A confirmar nas fontes reais, incluindo códigos municipais. |
| Participação no novo acordo | Identificar municípios integrantes do grupo do atalho. | novo_acordo no cadastro municipal simulado. |
| Composição municipal de ATI | Registrar quais municípios integram uma ATI. | Pares id_ati e id_municipio em atiMunicipio. |
| Informação do buffer | Explicar o trecho e o critério de distância aplicado na preparação. | largura_km e observacao nos exemplos. |
| Natureza dos dados | Informar se a unidade é demonstrativa ou validada para o projeto. | simulado igual a verdadeiro no protótipo. |

## 2. Variáveis consultáveis

Uma variável identifica uma categoria de informação. Um registro é uma ocorrência individual dessa categoria, com identificador, geometria e atributos próprios. A quantidade apresentada corresponde ao número de registros únicos encontrados para a variável.

| Sigla | Nome na interface | Unidade de contagem | Representação e inventário simulado | Fonte exibida e definição pendente |
| --- | --- | --- | --- | --- |
| PTR | PTRs aprovadas | Um registro fictício aprovado. A unidade de negócio real de PTR está pendente. | 165 pontos, PTR_001 a PTR_165. | Cadastro demonstrativo de PTRs. Confirmar significado de PTR, regra de aprovação, unidade, chave, fonte e geometria real. |
| ASSENTAMENTOS | Assentamentos | Um assentamento identificado no cadastro. | 14 polígonos, AST_001 a AST_014, compartilhados com os recortes de assentamento. | Cadastro demonstrativo de assentamentos. Confirmar fonte, versão, identidade oficial e atributos. |
| CAR | CAR | Um registro de imóvel do cadastro adotado. A correspondência e a deduplicação dos identificadores oficiais dependem da fonte. | 97 polígonos, CAR_001 a CAR_097. | Cadastro demonstrativo de CAR. Confirmar fonte, chave, versão e campos disponíveis. |

O total de **276 registros simulados** descreve o inventário das três categorias. A interface apresenta quantidades por variável. A sigla ASSENTAMENTOS identifica a variável, enquanto ASSENTAMENTO identifica o tipo de recorte no código demonstrativo.

### Atributos de PTR

| Campo | Rótulo | Tipo e formato | Significado no exemplo | Visível na tabela |
| --- | --- | --- | --- | --- |
| id | Identificador | Texto | Identidade estável do registro fictício. | Sim |
| nome | Nome demonstrativo | Texto | Nome para reconhecer a ocorrência. | Sim |
| situacao | Situação | Texto | Todos os exemplos estão como Aprovada. | Sim |
| competencia | Competência | Texto no formato ano-mês | Referência temporal demonstrativa. | Sim |
| categoria | Categoria demonstrativa | Texto | Classificação fictícia Exemplo A ou Exemplo B. | Sim |
| data_atualizacao | Atualização | Data | Data atribuída à edição demonstrativa. | Sim |
| latitude | Latitude | Número com formato de coordenada | Coordenada do ponto. | Sim |
| longitude | Longitude | Número com formato de coordenada | Coordenada do ponto. | Sim |
| observacao | Observação | Texto | Explicação da natureza fictícia e da representação provisória. | Disponível em detalhes e exportação |

### Atributos de assentamentos

| Campo | Rótulo | Tipo e formato | Significado no exemplo | Visível na tabela |
| --- | --- | --- | --- | --- |
| id | Identificador | Texto | Mesma identidade do recorte correspondente. | Sim |
| nome | Assentamento | Texto | Nome do assentamento demonstrativo. | Sim |
| municipio_referencia | Município de referência | Texto | Informação descritiva do cadastro. A relação espacial é verificada pela geometria. | Sim |
| uf | UF | Texto | Unidade federativa de referência. | Sim |
| area_declarada_ha | Área declarada (ha) | Número decimal | Área fictícia declarada, independente da geometria esquemática. | Sim |
| familias_previstas | Famílias previstas | Número inteiro | Atributo demonstrativo do assentamento. A contagem da consulta usa assentamentos. | Sim |
| ano_criacao | Ano de criação | Número inteiro com formato de ano | Ano demonstrativo. | Sim |
| fase | Fase demonstrativa | Texto | Consolidado ou Em estruturação. | Sim |
| data_atualizacao | Atualização | Data | Data atribuída à edição demonstrativa. | Sim |

### Atributos de CAR

| Campo | Rótulo | Tipo e formato | Significado no exemplo | Visível na tabela |
| --- | --- | --- | --- | --- |
| id | Identificador | Texto | Identidade estável do imóvel demonstrativo. | Sim |
| nome | Imóvel demonstrativo | Texto | Nome para apresentação do registro. | Sim |
| codigo_demonstrativo | Código demonstrativo | Texto | Código fictício com prefixo SIM-CAR. | Sim |
| area_declarada_ha | Área declarada (ha) | Número decimal | Área fictícia declarada. A consulta conta registros inteiros. | Sim |
| condicao | Condição demonstrativa | Texto | Situação fictícia de análise. | Sim |
| categoria_imovel | Categoria do imóvel | Texto | Classificação demonstrativa do imóvel. | Sim |
| ano_referencia | Ano de referência | Número inteiro com formato de ano | Ano demonstrativo 2026. | Sim |
| data_atualizacao | Atualização | Data | Data atribuída à edição demonstrativa. | Sim |
| observacao | Observação | Texto | Explicação sobre a área fictícia declarada. | Disponível em detalhes e exportação |

As linhas das tabelas de atributos seguem a ordem de apresentação atual. Cada coluna possui campo, rótulo, tipo, ordem, visibilidade e formato no catálogo do protótipo. Todas as variáveis também possuem geometria própria. A exportação inclui os atributos completos e o campo geometria_geojson, que contém essa geometria serializada.

## 3. Acervo cartográfico

| Identificador | Camada | Conteúdo atual | Papel |
| --- | --- | --- | --- |
| AC_MUNICIPIOS | Grade municipal de referência | 200 polígonos municipais esquemáticos. | Contexto visual independente do tipo selecionável. |
| AC_RIO | Eixo esquemático do Rio Doce | 3 linhas, correspondentes aos trechos alto, médio e baixo. | Orientação visual na região demonstrativa. |
| AC_REFERENCIAS | Pontos de referência demonstrativos | 3 locais fictícios. | Inspeção de referências sem alterar a consulta. |

As camadas do acervo podem reutilizar uma fonte também usada como recorte. O papel de referência visual permanece independente da seleção analítica. O catálogo definitivo do acervo depende da equipe responsável pelos dados. O mapa-base Esri é uma dependência externa de visualização do protótipo.

## 4. Edições e disponibilidade

| Edição simulada | Data de referência | Conteúdo e situação |
| --- | --- | --- |
| ED_2026_11 | 2026-11-04 | Edição inicial ao abrir o protótipo. CAR está indisponível para TI_002. Os demais pares recorte e variável estão completos. |
| ED_2026_09 | 2026-09-01 | Mesmo inventário de registros e geometrias da demonstração, com datas de atualização e competência de PTR ajustadas. CAR permanece indisponível para TI_002 e PTR está em reprocessamento para ATI_002. |

A disponibilidade é identificada por edição, recorte e variável. Um cruzamento completo pode conter zero registros. A data de uma edição demonstrativa serve à validação do fluxo. A periodicidade e o calendário de atualização das fontes reais serão definidos com seus responsáveis.

As geometrias do protótipo usam GeoJSON em WGS84, com longitude antes de latitude. Na preparação de fontes reais, é necessário conhecer o sistema de referência original, conferir as transformações e validar as geometrias. A produção do buffer precisa usar um método adequado à distância em metros.

## 5. Informações a registrar para cada fonte real

| Informação | O que a equipe deve fornecer |
| --- | --- |
| Identificação | Nome do conjunto, instituição ou responsável, localização autorizada da fonte e pessoa responsável por validar o conteúdo. |
| Significado | Definição do registro, unidade de contagem, abrangência territorial e critérios de inclusão. |
| Identidade | Chave oficial, regras de unicidade e relação com identificadores usados pela plataforma. |
| Geometria | Tipo, sistema de referência, tratamento de partes e furos, qualidade e versão dos limites. |
| Atributos | Campos, significado, tipo, unidade, valores possíveis, ausência de informação e disponibilidade para visualização e exportação. |
| Tempo | Data ou período de referência, data de atualização, periodicidade e edição em que a fonte entra na plataforma. |
| Uso | Condições de acesso, uso, divulgação e atribuição informadas pelo responsável. |
| Processamento | Situação dos cruzamentos, data de preparação, pendências e critérios usados na validação. |

## 6. Pendências dos dados

| ID | Conjunto ou tema | Definição necessária | Efeito na entrega |
| --- | --- | --- | --- |
| PD01 | PTR | Significado da sigla, unidade de contagem, aprovação, fonte, chave, geometria e atributos. | Substituir os pontos fictícios e validar o que a quantidade representa. |
| PD02 | Municípios | Universo municipal, identificadores oficiais e versão dos limites. | Substituir a grade simulada pelo catálogo territorial validado. |
| PD03 | Novo acordo | Lista oficial dos 49, fonte, versão e validação de todos os identificadores. | Habilitar o atalho de produção com composição confirmada. |
| PD04 | ATIs | Identidades, nomes, municípios integrantes e limites adotados. | Produzir os recortes e sua composição de forma consistente. |
| PD05 | Buffer | Eixo de referência, divisão dos trechos, metodologia e limite oficial de 5 km. | Substituir os corredores aproximados da demonstração. |
| PD06 | Assentamentos | Fonte, identidade oficial, geometrias, versão e atributos autorizados. | Usar a mesma unidade nos papéis de recorte e variável. |
| PD07 | Terras indígenas e territórios quilombolas | Fontes, critérios de inclusão, identidades e versões dos limites. | Completar o catálogo territorial de produção. |
| PD08 | CAR | Fonte, identificador estável, tratamento de registros repetidos, geometrias, versão e atributos. | Validar a unidade contada e os dados recuperados. |
| PD09 | Acervo | Camadas definitivas, fontes, descrições e condições de uso. | Substituir ou complementar as referências demonstrativas. |
| PD10 | Atualização | Responsáveis, periodicidade, processo de validação e publicação das edições. | Manter atributos, geometrias e cruzamentos coerentes. |
| PD11 | Entrega das bases | Responsabilidade pelo fornecimento, preparação e operação dos dados reais. | Definir os insumos e responsabilidades da cooperação. |

Os insumos antigos eventualmente presentes na pasta local dados/ estão fora da árvore compartilhada atual e permanecem no histórico Git. Sua existência é uma referência para levantamento posterior. A incorporação depende da validação da fonte, da versão e da adequação ao catálogo acima.
