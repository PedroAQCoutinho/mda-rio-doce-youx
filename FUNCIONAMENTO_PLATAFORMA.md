# Funcionamento da plataforma

## Objetivo e leitura

Permitir que o usuário selecione recortes territoriais e variáveis de interesse para identificar quantos e quais registros dessas variáveis intersectam os territórios selecionados. Os resultados são apresentados em quantidade, mapa, tabela de atributos e planilha XLSX.

Cada linha das tabelas descreve uma ação ou um comportamento observável da interface. O identificador permite referenciar a funcionalidade durante a implementação e a revisão. Os exemplos de aceite mostram como verificar a resposta esperada.

O [catálogo de dados](DADOS.md) define os recortes e as variáveis. O [modelo lógico](MODELO_LOGICO.md) explica como as seleções produzem os resultados. A pasta [prototipo/](prototipo/) contém a referência navegável. Os estados específicos de integração e as diferenças em relação ao protótipo estão indicados ao final deste documento.

## 1. Organização da interface

| ID | Local ou elemento | Comportamento esperado | Verificação |
| --- | --- | --- | --- |
| UI01 | Página | Apresentar uma experiência desktop em português brasileiro, com o mapa ocupando a área central e principal. | Utilizar a ferramenta em 1366 × 768 e 1920 × 1080. |
| UI02 | Cabeçalho | Identificar a consulta territorial do Rio Doce e o contexto MDA / ANATER. Usar apresentação institucional, legível e discreta. | Identificar o projeto ao abrir a página. |
| UI03 | Cabeçalho e rodapé | Na demonstração, identificar permanentemente o uso de dados simulados e limites esquemáticos. | A indicação permanece visível durante a consulta. |
| UI04 | Painel esquerdo | Organizar a primeira interação em torno da pergunta “Qual recorte você quer ver?”, seguida por tipo, busca, desenho e seleção acumulada. | Encontrar os meios de selecionar territórios no mesmo painel. |
| UI05 | Painel esquerdo | Apresentar a escolha de uma ou mais variáveis após os controles de recortes. | Identificar as etapas de escolha do território e da informação. |
| UI06 | Mapa central | Disponibilizar navegação, legenda, enquadramento da seleção e acesso às camadas do acervo. | Operar os controles sem encobrir permanentemente o mapa. |
| UI07 | Painel de resultados | Apresentar edição dos dados, contexto da consulta e resultados separados por variável. | Selecionar duas variáveis e distinguir seus resultados. |
| UI08 | Tabela expansível | Abrir os atributos da variável solicitada em painel próprio, com fechamento e rolagem. | Consultar colunas extensas sem ultrapassar os limites da página. |
| UI09 | Controles e mensagens | Usar rótulos, foco de teclado e sinais de seleção além das cores. Informar por que uma ação está desabilitada. | Reconhecer a seleção e operar busca e botões por teclado. |
| UI10 | Painéis | Acomodar nomes longos, múltiplas seleções e tabelas por rolagem interna. | Controles permanecem acessíveis com os 49 municípios selecionados. |
| UI11 | Ajuda | Explicar seleção acumulada, união, uso do desenho e natureza dos dados. Permitir abrir e fechar a ajuda. | Consultar a orientação sem perder a seleção. |

## 2. Entrada e tipo de recorte

| ID | Ação ou situação | Resposta da plataforma | Critério de aceite |
| --- | --- | --- | --- |
| EN01 | Abrir a ferramenta | Centralizar inicialmente o mapa na região do Rio Doce e apresentar o seletor de tipo vazio. Iniciar com recortes e variáveis sem seleção. | A entrada solicita o tipo e a escolha dos recortes. |
| EN02 | Ainda não escolher um tipo | Manter busca e desenho desabilitados, com orientação para escolher o tipo. | Nenhuma unidade territorial é selecionada automaticamente. |
| EN03 | Abrir o seletor de tipo | Oferecer os seis tipos cadastrados em DADOS.md. | Cada tipo do catálogo pode ser acessado. |
| EN04 | Escolher um tipo | Exibir as unidades desse tipo como camada selecionável e habilitar a busca correspondente. | Escolher Municípios disponibiliza municípios no mapa e na busca. |
| EN05 | Trocar o tipo ativo | Substituir a camada selecionável, limpar o texto da busca e encerrar eventual desenho em andamento. Conservar recortes acumulados, variáveis e resultados. | Selecionar um município e trocar para ATI conserva o município na seleção. |
| EN06 | Retornar a um tipo usado anteriormente | Reexibir suas unidades, destacando aquelas que já estão selecionadas. | O município selecionado reaparece destacado ao retornar a Municípios. |
| EN07 | Escolher Buffer de 5 km do rio | Disponibilizar Alto, Médio e Baixo Rio Doce como três unidades do mesmo tipo. | Selecionar um ou mais trechos pelo fluxo comum. |

## 3. Seleção por clique e busca textual

| ID | Ação ou situação | Resposta da plataforma | Critério de aceite |
| --- | --- | --- | --- |
| SE01 | Passar o cursor sobre um recorte ativo | Destacar a geometria e exibir nome, tipo e identificador. | Reconhecer o recorte antes de selecioná-lo. |
| SE02 | Clicar em um recorte disponível | Adicionar o recorte inteiro, destacar sua seleção e atualizar a lista e a consulta. Focalizar sua geometria na experiência final. | A mesma unidade pode ser obtida pelo clique ou pela busca. |
| SE03 | Clicar novamente em um recorte selecionado | Remover o recorte e atualizar os resultados. | A seleção alterna com um clique, sem exigir Ctrl ou Shift. |
| SE04 | Clicar em uma posição com vários recortes do tipo ativo | Apresentar os candidatos com nome, identificador e ação de adicionar ou remover. | Em assentamentos sobrepostos, o usuário escolhe qual alterar. |
| SE05 | Abrir a busca com texto vazio | Apresentar as unidades disponíveis do tipo ativo e orientar a digitação. | A lista ajuda a descobrir os recortes disponíveis. |
| SE06 | Digitar nome ou identificador | Filtrar as sugestões somente no tipo ativo, ignorando diferenças de caixa e acentuação. | Uma busca por nome sem acento encontra o nome acentuado. |
| SE07 | Examinar sugestões | Exibir nome, identificador, município e UF quando disponíveis, além do estado já selecionado. | Diferenciar registros de nomes semelhantes. |
| SE08 | Escolher uma sugestão nova | Adicionar o recorte, centralizar e ajustar o mapa à geometria, atualizar a lista e a consulta. | Buscar MUN_001 e escolhê-lo focaliza e inclui essa unidade. |
| SE09 | Escolher uma sugestão já selecionada | Focalizar a geometria e avisar que o recorte já pertence à seleção. | A quantidade de recortes selecionados permanece igual. |
| SE10 | Usar o teclado na busca | Setas percorrem sugestões, Enter escolhe a sugestão ativa, Escape fecha a lista e Tab permite seguir para o próximo controle. | Completar uma seleção sem usar o mouse. |
| SE11 | Buscar um termo sem correspondência | Exibir mensagem de ausência e permitir ajustar o texto. | A seleção e os resultados existentes permanecem disponíveis. |
| SE12 | Clicar fora das sugestões | Fechar a lista de sugestões. | Retomar o mapa ou os controles sem alterar a consulta. |

## 4. Seleção por desenho

| ID | Ação ou situação | Resposta da plataforma | Critério de aceite |
| --- | --- | --- | --- |
| DE01 | Acionar “Desenhar para selecionar” | Exigir tipo ativo e mapa disponível. Iniciar desenho temporário e apresentar instruções, Desfazer, Concluir e Cancelar. | O usuário entende que deve marcar vértices. |
| DE02 | Clicar no mapa durante o desenho | Adicionar vértices e mostrar o traçado em construção. | Os cliques constroem o desenho sem alternar recortes. |
| DE03 | Desfazer | Remover o último vértice e atualizar o traçado. | Corrigir um ponto antes de concluir. |
| DE04 | Concluir um desenho válido | Encontrar os recortes do tipo ativo que intersectam ou tocam o desenho e adicioná-los integralmente. | Um município tocado apenas na borda é selecionado inteiro. |
| DE05 | Encontrar recortes já selecionados | Acrescentar somente os novos identificadores. | Repetir o desenho mantém a seleção sem duplicatas. |
| DE06 | Concluir um desenho inválido | Informar o problema e permitir correção ou cancelamento. Exigir ao menos três vértices distintos e uma área válida, sem autointerseção. | Um desenho cruzado ou degenerado não gera uma consulta. |
| DE07 | Concluir sem encontrar unidades | Informar que nenhum recorte do tipo ativo foi encontrado. | A seleção anterior continua disponível. |
| DE08 | Cancelar ou pressionar Escape | Descartar o desenho temporário e retornar à navegação. | A seleção anterior permanece disponível. |
| DE09 | Consultar após o desenho | Usar os recortes cadastrados encontrados como seleção analítica. | Registros fora do desenho, mas relacionados a um município selecionado, entram no resultado. |

## 5. Seleção acumulada e novo acordo

| ID | Ação ou situação | Resposta da plataforma | Critério de aceite |
| --- | --- | --- | --- |
| AC01 | Adicionar territórios | Acumular vários recortes, inclusive de tipos diferentes, combinados por união. | Um município e uma ATI participam juntos da consulta. |
| AC02 | Consultar a lista de selecionados | Exibir nome, tipo e identificador de cada unidade, total de unidades e remoção individual. | Identificar recortes de tipos que estão inativos no mapa. |
| AC03 | Clicar no nome de um item selecionado | Enquadrar a geometria correspondente. | Recuperar a localização de um território da lista. |
| AC04 | Remover um item da lista | Retirar somente esse recorte e recalcular o conjunto de registros únicos. | Os demais recortes continuam selecionados. |
| AC05 | Acionar “Limpar recortes” | Esvaziar recortes e resultados, encerrar desenho e limpar a inspeção. Conservar variáveis, tipo ativo, edição e acervo. | A ferramenta orienta uma nova seleção territorial. |
| AC06 | Ativar o tipo Municípios | Exibir o atalho “Adicionar os 49 municípios do novo acordo”. | O atalho está associado à seleção municipal. |
| AC07 | Acionar o atalho | Acrescentar as unidades cadastradas no grupo e enquadrá-las, preservando outros recortes selecionados. | Uma ATI selecionada continua na lista após o atalho. |
| AC08 | Repetir o atalho | Eliminar duplicatas e informar quantos municípios foram acrescentados. | Duas ativações produzem os mesmos 49 municípios únicos. |
| AC09 | Remover município acrescentado pelo atalho | Aplicar a remoção individual comum. | O usuário pode trabalhar com parte do grupo. |
| AC10 | Preparar o atalho para dados reais | Habilitar o grupo após validação de sua lista oficial e de suas 49 identidades. Informar indisponibilidade quando a lista estiver incompleta. | A composição validada corresponde à fonte aprovada em DADOS.md. |

## 6. Variáveis e contagem

| ID | Ação ou situação | Resposta da plataforma | Critério de aceite |
| --- | --- | --- | --- |
| VA01 | Consultar as opções | Apresentar as três variáveis iniciais de DADOS.md, com rótulos e indicação de seleção. | Encontrar PTRs aprovadas, assentamentos e CAR. |
| VA02 | Selecionar uma variável | Consultar seus registros nos recortes selecionados e abrir uma seção de resultado. | Selecionar CAR apresenta sua quantidade e seus registros. |
| VA03 | Selecionar outra variável | Adicionar um resultado independente, mantendo os demais. | PTR e CAR apresentam quantidades e tabelas próprias. |
| VA04 | Desmarcar uma variável | Remover sua seção e suas geometrias de resultado, fechando a tabela correspondente se estiver aberta. | Os resultados das outras variáveis continuam presentes. |
| VA05 | Consultar a quantidade | Contar identificadores únicos por variável na união dos recortes. Usar formatação numérica brasileira. | MUN_001 e MUN_002 retornam quatro CAR na edição atual simulada. |
| VA06 | Consultar várias variáveis | Apresentar as contagens por variável, preservando a unidade de cada uma. | Cada seção identifica o que está contando. |
| VA07 | Encontrar um registro que toca a borda, sobrepõe parte ou está contido no recorte | Incluir o registro inteiro, conforme o vínculo preparado. | Um CAR que toca a borda conta como um registro. |
| VA08 | Escolher assentamento como recorte e assentamentos como variável | Aplicar a mesma regra espacial, incluindo o próprio assentamento e os demais intersectados. | AST_001 retorna ao menos AST_001 e AST_002. |
| VA09 | Ler uma seção de resultado | Identificar variável, fonte disponível, estado do processamento e acesso aos atributos. | O usuário entende de onde vem a informação apresentada. |
| VA10 | Alterar recortes, variáveis ou edição | Atualizar resultados e remover geometrias e inspeções que deixaram de pertencer à consulta. | Uma consulta com zero não conserva registros da consulta anterior. |

## 7. Mapa e inspeção

| ID | Ação ou situação | Resposta da plataforma | Critério de aceite |
| --- | --- | --- | --- |
| MA01 | Exibir camadas | Distinguir recortes disponíveis, recortes selecionados, resultados por variável e referências do acervo por estilo e legenda. | Reconhecer a função de cada representação. |
| MA02 | Apresentar resultados | Usar a geometria própria de cada registro, conforme DADOS.md. Exibir pontos ou polígonos segundo a variável. | CAR e assentamentos aparecem como polígonos e PTR como pontos provisórios na demonstração. |
| MA03 | Navegar com zoom ou arrastar | Mudar apenas a visualização. | A quantidade e os identificadores da consulta permanecem iguais. |
| MA04 | Acionar “Enquadrar seleção” | Ajustar o mapa ao conjunto de recortes selecionados, considerando todos os tipos acumulados. | Recuperar a extensão territorial após navegar pelo mapa. |
| MA05 | Retornar ao tipo de um recorte selecionado | Mostrar novamente seu destaque na camada ativa. | A geometria continua associada ao mesmo item da lista. |
| MA06 | Inspecionar um registro pela tabela | Enquadrar e destacar sua geometria, apresentar identificador e atributos em popup e sinalizar a linha inspecionada. | A inspeção mantém recortes, variáveis e quantidade. |
| MA07 | Fechar a tabela ou os detalhes | Permitir continuar a consulta e navegar pelo mapa. | Fechar uma apresentação de detalhes não remove o registro do resultado. |
| MA08 | Ler atributos no mapa | Tratar textos dos dados como conteúdo e preservar caracteres e acentos. | Um valor textual é exibido literalmente. |
| MA09 | Consultar mapa-base | Manter atribuição ao provedor visível e informar eventual falha de carregamento. | O usuário identifica a fonte cartográfica de fundo. |

## 8. Tabela de atributos

| ID | Ação ou situação | Resposta da plataforma | Critério de aceite |
| --- | --- | --- | --- |
| TA01 | Abrir a tabela de uma variável | Mostrar uma linha por registro único da consulta e identificar a variável e o total. | Quatro CAR produzem quatro linhas no conjunto completo. |
| TA02 | Abrir tabelas de variáveis diferentes | Usar o catálogo de atributos de cada variável para montar colunas, rótulos, ordem e formatos. | A tabela de PTR contém competência e coordenadas, e a de assentamentos contém famílias previstas e ano de criação. |
| TA03 | Aplicar visibilidade de colunas | Mostrar as colunas configuradas para a tabela, conservando os atributos completos para detalhes e exportação. | O campo demonstrativo observacao pode ficar oculto na tabela e aparecer no XLSX. |
| TA04 | Ordenar uma coluna | Alternar ordem crescente e decrescente, respeitando o tipo do valor e usando o identificador para estabilizar empates. | Valores numéricos são ordenados como números. |
| TA05 | Mudar de página | Mostrar outra parte do mesmo conjunto e indicar a página atual e o total. | Paginar mantém a quantidade total do resultado. |
| TA06 | Mudar quantidade por página | Oferecer 10, 25 e 50 registros por página e retornar ao início da paginação. | Navegar em uma tabela longa com tamanho ajustável. |
| TA07 | Atingir primeira ou última página | Desabilitar o comando de navegação correspondente. | A paginação permanece dentro do intervalo válido. |
| TA08 | Inspecionar uma linha | Acionar a inspeção descrita em MA06. | O registro mostrado no mapa corresponde ao identificador da linha. |
| TA09 | Atualizar a consulta com tabela aberta | Recalcular suas linhas e reiniciar a paginação. Fechar a tabela se a variável for desmarcada. Se ficar indisponível, retirar as linhas anteriores e informar a pendência. | A tabela nunca apresenta registros de uma seleção anterior como atuais. |
| TA10 | Abrir tabela de resultado zero | Apresentar cabeçalhos e mensagem de ausência de registros, com exportação desabilitada e motivo visível. | A interface mostra zero com clareza. |

## 9. Exportação XLSX

| ID | Ação ou situação | Resposta da plataforma | Critério de aceite |
| --- | --- | --- | --- |
| EX01 | Acionar “Baixar tabela (.xlsx)” | Gerar um arquivo XLSX válido para a variável da tabela aberta. | Abrir o arquivo em um leitor de planilhas. |
| EX02 | Exportar uma tabela paginada | Incluir todos os registros únicos da consulta daquela variável. | Exportar 25 registros com página de 10 gera 25 linhas de dados. |
| EX03 | Formar a aba Dados | Incluir identificador, atributos completos e geometria representada em GeoJSON. Preservar acentos e tipos numéricos. | Campos ocultos na tabela continuam disponíveis na planilha. |
| EX04 | Formar a aba Consulta | Registrar variável, fonte, edição, recortes com nomes/tipos/identificadores, total, operação de união, data de geração, cobertura e indicação de simulação quando aplicável. | O arquivo permite reconstruir o contexto da consulta. |
| EX05 | Nomear o arquivo | Identificar a variável, a edição e o contexto territorial de forma compatível com nomes de arquivo. | Distinguir exportações de consultas diferentes. |
| EX06 | Iniciar geração | Informar andamento, impedir disparos repetidos e fixar os dados e a seleção usados na exportação iniciada. | Uma mudança posterior de seleção mantém a coerência do arquivo em geração. |
| EX07 | Finalizar ou falhar | Informar sucesso ou falha e restabelecer o controle para nova tentativa. | O botão deixa o estado de geração ao terminar. |
| EX08 | Resultado zero, indisponibilidade ou biblioteca ausente | Desabilitar o download e informar o motivo correspondente. | A ação disponível corresponde ao estado da consulta. |

## 10. Camadas do acervo

| ID | Ação ou situação | Resposta da plataforma | Critério de aceite |
| --- | --- | --- | --- |
| AR01 | Abrir “Acervo” | Apresentar as camadas de referência com nome, descrição, controle de visibilidade e inspeção. | Encontrar as referências documentadas em DADOS.md. |
| AR02 | Ligar ou desligar uma camada | Alterar sua visibilidade no mapa de forma independente da consulta. | Quantidades, tabelas, recortes e variáveis permanecem iguais. |
| AR03 | Inspecionar uma camada | Mostrar detalhes e permitir localizar suas feições. | A inspeção mantém a consulta analítica existente. |
| AR04 | Exibir municípios do acervo enquanto outro tipo está ativo | Manter a seleção restrita ao tipo ativo. | Com Terra indígena ativa, a referência municipal conserva apenas seu papel de acervo. |
| AR05 | Fechar o painel | Preservar a visibilidade escolhida para as camadas. | Fechar e reabrir mostra os mesmos controles marcados. |

## 11. Estados e consistência da consulta

| ID | Estado ou evento | Resposta esperada | Critério de aceite |
| --- | --- | --- | --- |
| ES01 | Sem recortes | Orientar a escolha de territórios e apresentar resultados aguardando seleção. | Selecionar uma variável sozinha não consulta toda a bacia. |
| ES02 | Com recortes e sem variáveis | Orientar a escolha das variáveis. | Os territórios permanecem disponíveis para revisão. |
| ES03 | Consulta em carregamento | Informar andamento e vincular o resultado à seleção solicitada. | Resultados de seleção anterior não são apresentados como atuais. |
| ES04 | Consulta completa com registros | Mostrar quantidade e acesso a mapa, tabela e exportação do mesmo conjunto de identificadores. | A quantidade coincide com o total de linhas exportadas. |
| ES05 | Consulta completa sem registros | Exibir 0, mensagem contextual e retirar as geometrias da consulta anterior. | MUN_200 apresenta zero para as três variáveis na edição atual simulada. |
| ES06 | Cruzamentos incompletos para uma variável | Informar “Dados indisponíveis”, recortes afetados e motivo conhecido. Manter o total dessa variável sem valor e seus registros sem apresentação parcial. | Selecionar MUN_001 e TI_002 deixa CAR indisponível. |
| ES07 | Uma variável indisponível e outra completa | Mostrar o estado de cada uma separadamente. | A variável completa continua consultável. |
| ES08 | Falha de comunicação ou processamento | Informar falha e oferecer recuperação apropriada ao serviço. | O erro é distinguível de zero e de cobertura não processada. |
| ES09 | Trocar edição dos dados | Atualizar resultados e atributos usando a edição escolhida. | ATI_002 com PTR na edição anterior indica reprocessamento. |
| ES10 | Receber respostas fora de ordem | Aplicar somente a resposta correspondente à seleção e edição atuais. | Uma consulta lenta anterior não substitui uma consulta mais recente. |
| ES11 | Biblioteca do mapa indisponível | Informar a falha e permitir os controles que funcionam sem mapa, como busca e tabela. | Consultar registros pela busca continua possível no protótipo. |
| ES12 | Mapa-base indisponível com biblioteca carregada | Informar a falha do fundo e manter geometrias e consultas disponíveis. | A consulta continua operável sobre as camadas carregadas. |
| ES13 | Exportação indisponível por dependência externa | Informar o problema e orientar nova tentativa após restabelecer a dependência. | As demais funcionalidades continuam utilizáveis. |

## 12. Percursos de aceite

Os casos abaixo verificam a integração entre os controles. IDs e resultados se referem aos dados simulados da edição ED_2026_11, salvo indicação diferente. Os seis exemplos de consulta executáveis ficam em [prototipo/tests/consultas.json](prototipo/tests/consultas.json).

| Caso | Passos | Resultado esperado |
| --- | --- | --- |
| CE01 | Abrir a ferramenta, escolher Municípios, buscar MUN_001 e selecionar CAR. | Encontrar CAR_001, CAR_002 e CAR_003. |
| CE02 | Acrescentar MUN_002 à seleção anterior. | Encontrar CAR_001 a CAR_004, total quatro, com CAR_003 contado uma vez. |
| CE03 | Trocar o tipo ativo para ATI sem alterar a seleção. | Conservar MUN_001 e MUN_002 e os quatro CAR. |
| CE04 | Escolher novamente MUN_001 pela busca. | Apenas focalizar o recorte e informar que ele já está selecionado. |
| CE05 | Adicionar os 49 municípios duas vezes e remover um deles pela lista. | Manter 49 municípios únicos após a repetição e permitir a remoção individual. |
| CE06 | Desenhar sobre unidades do tipo ativo, incluindo um contato de borda. | Selecionar unidades inteiras, acrescidas à seleção prévia e sem duplicatas. |
| CE07 | Selecionar AST_001 e as três variáveis. | Exibir três resultados independentes. Assentamentos inclui AST_001 e AST_002. |
| CE08 | Selecionar MUN_200 com PTR, CAR e assentamentos. | Apresentar zero completo para cada variável. |
| CE09 | Selecionar MUN_001 e TI_002 com CAR. | Apresentar indisponibilidade de CAR e indicar TI_002 como pendência. |
| CE10 | Selecionar ATI_002, PTR e a edição ED_2026_09. | Informar indisponibilidade por reprocessamento. |
| CE11 | Ligar, inspecionar e desligar uma camada do acervo. | Preservar a seleção e os resultados analíticos. |
| CE12 | Ordenar, paginar, inspecionar um registro e exportar uma tabela com resultados. | Manter correspondência entre a quantidade, os registros do mapa e as linhas completas exportadas. |
| CE13 | Limpar recortes com variáveis e acervo selecionados. | Esvaziar resultados e conservar as escolhas de variáveis, tipo, edição e acervo. |
| CE14 | Simular respostas de API fora de ordem. | Preservar somente o resultado da seleção mais recente. Aplicável à integração futura. |

## 13. Referência atual e pontos a completar

| Tema | Situação da referência atual | Orientação para implementação |
| --- | --- | --- |
| Dados e geometrias | Os catálogos são fictícios, com limites esquemáticos e composição demonstrativa dos 49. | Substituir pelos dados validados e resolver as pendências de DADOS.md. |
| Foco após clique no mapa | O clique alterna a seleção. Busca, lista de selecionados e “Enquadrar seleção” já focalizam geometrias. | Completar a focalização automática prevista em SE02 quando esse comportamento for implementado. |
| Nome do XLSX | O protótipo identifica variável e edição no nome e informa os recortes na aba Consulta. | Acrescentar a identificação territorial no nome, conforme EX05. |
| Motivo da indisponibilidade | O protótipo informa cobertura incompleta e identifica recortes pendentes. O motivo detalhado está nos dados. | Apresentar também o motivo conhecido previsto em ES06, como reprocessamento. |
| Carregamento e falha de API | As consultas do protótipo são locais e síncronas. | Implementar ES03, ES08 e ES10 ao integrar o serviço de dados. |
| Banco e serviço | A consulta é demonstrada por estruturas JavaScript e pelo adaptador BI.api. | Implementar persistência, preparação dos cruzamentos e acesso aos dados conforme MODELO_LOGICO.md. |
| Escopo de interface | Consulta desktop, mapa, atributos, acervo e exportação compõem a referência. | Autenticação, administração, edição das fontes, operação de produção e metas de desempenho dependem de definição específica. |
