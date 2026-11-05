# Rio Doce — Consulta Territorial

Base de cooperação para desenvolver a plataforma de BI territorial do projeto MDA / ANATER — Rio Doce, com apoio de IA. O usuário escolhe territórios e variáveis de interesse para descobrir **quantos e quais registros intersectam os recortes selecionados**, visualizar suas geometrias e consultar ou exportar seus atributos.

A seleção pode reunir vários territórios. Os resultados usam cruzamentos previamente preparados e contam cada registro uma vez por variável. Por exemplo, se um município tem CAR 1, 2 e 3 e outro tem CAR 3 e 4, a seleção dos dois retorna quatro CAR.

## Estrutura e ordem de leitura

| Arquivo ou pasta | Conteúdo |
| --- | --- |
| [FUNCIONAMENTO_PLATAFORMA.md](FUNCIONAMENTO_PLATAFORMA.md) | Interface, sequência de interações, comportamentos, estados e critérios de aceite, detalhados em tabelas. |
| [DADOS.md](DADOS.md) | Catálogo de todos os tipos de recorte, variáveis, atributos, fontes e definições pendentes. |
| [MODELO_LOGICO.md](MODELO_LOGICO.md) | Conceitos, relações e formação dos resultados para orientar a implementação. |
| [AGENTS.md](AGENTS.md) | Orientações para o agente navegar no repositório, implementar e verificar seu trabalho. |
| [prototipo/](prototipo/) | Referência visual e interativa, dados simulados e testes executáveis. |

## Abrir e compartilhar o protótipo

Abra [prototipo/index.html](prototipo/index.html) diretamente no navegador. Para enviar a alguém, compacte a pasta `prototipo/` inteira em ZIP. O destinatário extrai a pasta e abre o HTML, mantendo `css/` e `js/` juntas.

O protótipo funciona localmente. O mapa utiliza Leaflet 1.9.4 e mapa-base Esri, e a exportação utiliza SheetJS 0.18.5, carregados pela internet. Todos os dados e limites demonstrativos são simulados.

## Estado da entrega

A documentação define a referência funcional para a equipe e para a IA. O protótipo demonstra o fluxo em desktop. As fontes reais, a definição de PTR e outras pendências estão registradas em [DADOS.md](DADOS.md). A equipe de implementação definirá a arquitetura física, o banco e a integração com as fontes a partir dessas referências.

Para verificar os dados e os exemplos, execute `node prototipo/tests/run-tests.cjs` com Node.js 22 ou superior. A verificação usa apenas recursos do Node. A suíte espacial também pode ser aberta no navegador em [prototipo/tests/data_checks.html](prototipo/tests/data_checks.html).

O histórico Git conserva as versões anteriores da entrega. A pasta local `dados/`, quando presente, reúne insumos anteriores ignorados pelo Git. O protótipo usa os dados simulados de `prototipo/js/data.js`.
