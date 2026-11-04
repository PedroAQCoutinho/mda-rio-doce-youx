# Rio Doce — base de cooperação para o BI territorial

**Entrega v0.1:** regras de negócio, modelo lógico, protótipo, contrato proposto de API e testes de referência. Este repositório permite que equipes de negócio, UX e desenvolvimento trabalhem com IA sobre os mesmos critérios de aceite.

A plataforma responde **quantos e quais registros de cada variável se relacionam aos territórios selecionados**, sem duplicação. Os cruzamentos são preparados antes da navegação.

## Comece por aqui

1. Leia as [regras de negócio](docs/regras-de-negocio.md).
2. Veja o [modelo lógico e o diagrama](docs/modelo-logico.md).
3. Abra [prototipo/index.html](prototipo/index.html) por duplo clique.
4. Consulte o [contrato de API](contratos/openapi.json) e os [exemplos de aceite](exemplos/consultas.json).
5. Execute `node tests/run-tests.cjs` com Node.js 22 ou superior. Sem instalação de pacotes.

O protótipo não exige servidor ou build. Mantenha suas subpastas juntas. Internet é necessária para Leaflet 1.9.4, SheetJS 0.18.5 e mapa-base Esri; falhas têm avisos. Dados e geometrias são simulados. Também é possível abrir [tests/data_checks.html](tests/data_checks.html) para executar os 25 testes espaciais e de dados no navegador, sem internet.

## O que está definido e o que está proposto

| Estado | Conteúdo |
| --- | --- |
| Regras consolidadas do pedido | União dos recortes, registros únicos por variável, contato de borda, acervo independente e distinção entre zero e indisponibilidade. |
| Implementado para demonstração | Protótipo local com seleção, mapa, tabelas e XLSX; fixtures e testes determinísticos. |
| Proposto para acordo entre equipes | Modelo lógico, contrato HTTP, estratégia de edição e divisão das entregas. A API ainda não está implementada. |
| Pendente de homologação | Definição de PTR, fontes e identificadores reais, campos, composição dos 49, limites e ATIs. |

## Arquivos essenciais

| Caminho | Finalidade |
| --- | --- |
| `AGENTS.md` | Instruções para trabalhar com IA neste repositório. |
| `docs/regras-de-negocio.md` | Comportamentos e critérios de aceite. |
| `docs/modelo-logico.md` | Identidades, cruzamentos e ligação com a interface. |
| `docs/cooperacao.md` | Responsabilidades, processo de mudança e pendências. |
| `docs/roteiro-reuniao.md` | Roteiro de cinco minutos. |
| `docs/diagramas/` | Ilustração de apoio e prompt de geração. |
| `contratos/openapi.json` | Proposta de API em OpenAPI 3.0.3. |
| `exemplos/consultas.json` | Entradas e resultados esperados para conferência. |
| `prototipo/` | Referência navegável, com adaptador `BI.api` substituível. |
| `tests/` | Testes de dados, contratos e exemplos. |
| `.github/` | Automação de testes e modelos de issue/pull request. |

## Como cooperar

Mudanças de regra começam por uma issue. A equipe responsável confirma o comportamento; a implementação e o teste chegam juntos em um pull request. Uma IA pode propor e executar alterações, mas regras pendentes não devem ser inventadas. Veja [o fluxo de cooperação](docs/cooperacao.md).

A referência entregue é a tag **`cooperacao-v0.1`**; `main` pode continuar evoluindo. O histórico anterior foi preservado. Dados brutos, arquivos de ambiente e documentos substituídos não integram a árvore atual de entrega. Os dados brutos preexistentes continuam localmente em `dados/`, ignorados pelo Git, e nas revisões anteriores; não alimentam o protótipo.

## Verificação e limites

A suíte automatizada cobre as regras espaciais e de consulta, exemplos do contrato, integridade de referências e estrutura OpenAPI. A validação formal adicional usa `tests/validar_openapi.py` e `openapi-spec-validator==0.9.0`, instalado apenas no ambiente de testes/CI. O workflow a executa a cada push/PR. O protótipo foi anteriormente verificado no Chrome em 1366 × 768 e 1920 × 1080, com interação por teclado/mouse e leitura independente dos XLSX. A reorganização preserva sua lógica.

Esses testes não comprovam desempenho com bases reais nem a execução de uma API de produção. Não há banco, migrações SQL ou serviço HTTP implantados nesta entrega. O contrato será validado também contra a implementação quando ela existir.
