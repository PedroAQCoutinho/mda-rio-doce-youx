# Regras de negócio e aceite

Estado: regras consolidadas dos pedidos do projeto, a revisar conjuntamente com a equipe receptora. Dados do protótipo não são oficiais.

## Comportamento

| Regra | Comportamento e aceite observável |
| --- | --- |
| RF01 — Entrada | Sem seleção automática. Escolher um tipo disponibiliza apenas os recortes desse tipo no mapa e na busca. |
| RF02 — Tipos | Buffer de 5 km do rio (alto, médio e baixo), municípios da bacia, assentamentos, ATIs, terras indígenas e territórios quilombolas. CAR é variável, não tipo de recorte. |
| RF03 — Acumulação | Recortes de diferentes tipos permanecem selecionados ao trocar o tipo ativo. Remoção individual é possível. |
| RF04 — União | Um registro entra se tem vínculo com qualquer recorte selecionado. Cada registro conta uma vez por variável. Não há operação de interseção entre recortes. |
| RF05 — Clique e busca | Clique alterna inclusão. Sobreposição oferece candidatos. Busca ignora caixa/acentos; escolher um item adiciona e focaliza. Item já selecionado não é removido nem duplicado pela busca. |
| RF06 — Desenho | Seleciona recortes cadastrados inteiros que intersectem ou toquem o desenho, somente no tipo ativo. Adiciona sem duplicar; permite concluir/cancelar, rejeita geometria inválida e informa nenhuma correspondência. |
| RF07 — Novo acordo | Atalho adiciona os 49 municípios cadastrados, preservando seleção anterior. Repetir não duplica. Em produção, só disponibilizar após validação da lista oficial; não completar artificialmente uma carga. |
| RF08 — Variáveis | PTRs aprovadas, assentamentos e CAR, com seleção múltipla. Contagens e tabelas independentes; não existe total geral entre variáveis. |
| RF09 — Espacial | CAR e assentamentos são polígonos. Qualquer ponto em comum inclui o registro: borda, sobreposição ou contenção. Sem área mínima ou rateio. PTR tem representação pontual provisória no protótipo. |
| RF10 — Assentamentos | Recorte e variável compartilham identidade e geometria. Selecionar um assentamento inclui seu próprio registro e outros que o intersectem. |
| RF11 — Dados | Cruzamentos preparados antes da navegação. Contagem, mapa, tabela completa e XLSX usam os mesmos identificadores únicos e a mesma edição. Zoom/paginação não alteram o conjunto. |
| RF12 — Atributos | Cada variável tem atributos próprios. Catálogo informa campo, rótulo, tipo, ordem, visibilidade e formato. Tabela oferece ordenação estável, paginação e inspeção sem mudar a seleção. |
| RF13 — Acervo | Ligar, desligar ou inspecionar referências não altera seleção, variáveis nem resultados. Não torna recortes de tipos inativos selecionáveis. |
| RF14 — Estados | Sem recortes, orientar seleção; não consultar toda a bacia. Sem variáveis, orientar escolha. Limpar recortes preserva variáveis, tipo ativo e acervo. |
| RF15 — Completude | Zero só após consulta completa. Se faltar cobertura em qualquer recorte da variável, ela fica indisponível, sem total ou registros parciais. Outras variáveis completas continuam funcionando. |
| RF16 — Consistência | Fixar edição e identificar requisições. Uma resposta antiga não pode substituir seleção mais recente. Alterar fonte/geometria exige atualizar os vínculos antes de publicar nova edição. |

## Exemplos mínimos de aceite

- Município A → CAR 1, 2, 3; município B → CAR 3, 4: união retorna **quatro CAR**.
- Desenho que apenas encosta em um município: seleciona o município inteiro.
- CAR que apenas toca um recorte: entra no conjunto, sem porcentagem mínima.
- Cruzamento completo sem vínculos: **0**. Cruzamento não processado: **indisponível**.
- PTR e CAR selecionados: duas contagens e duas tabelas com colunas distintas.
- Limpar recortes: nenhuma contagem; variáveis e acervo permanecem escolhidos.

As fixtures reproduzíveis estão em `exemplos/consultas.json`. A suíte geométrica verifica também bordas, furos, MultiPolygon e desenhos inválidos.

## Fronteira do escopo

Consulta desktop, mapa, atributos e exportação. Autenticação, administração, edição interativa das fontes e política de acesso de produção não são implementadas no protótipo. O buffer oficial chega pronto à carga; não é calculado em graus durante a consulta. Fontes e definições pendentes estão em `cooperacao.md`.
