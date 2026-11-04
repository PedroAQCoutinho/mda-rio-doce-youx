# Cooperação e entrega incremental

## Responsabilidades a confirmar na reunião

| Frente | Responsabilidade |
| --- | --- |
| Negócio / responsáveis pelas fontes | Confirmar regras, unidade de contagem, identificadores, fontes e resultados esperados. |
| UX | Validar seleção, estados, leitura do mapa e acesso aos atributos. |
| Desenvolvimento | Propor arquitetura física, implementar carga/API/interface e demonstrar aderência aos testes. |
| Equipe conjunta | Resolver pendências, revisar mudanças e aceitar cada entrega. |
| IA | Auxiliar análise, implementação e testes sob as referências do repositório. Não aprovar regras em nome da equipe. |

## Fluxo

1. Abrir uma issue com regra afetada, exemplo e critério de aceite.
2. Acordar o comportamento e identificar a decisão responsável.
3. Implementar uma parte revisável em uma branch, com apoio de IA.
4. Abrir PR com mudanças, testes e limitações. Atualizar contrato e documentação quando necessário.
5. Conferir os testes automáticos, revisar funcionalmente e integrar.
6. Marcar uma versão de referência para entrega; usar a tag, não uma branch móvel, como base de aceite.

Cada PR deve passar em `node tests/run-tests.cjs`. A suíte atual valida o modelo local e a integridade do contrato. Quando houver backend, adicionar testes HTTP e geoespaciais contra a implementação real, usando os mesmos exemplos de referência.

## Próximas entregas propostas

1. **Acordo funcional:** confirmar regras, pendências, contrato e responsáveis.
2. **Fatia completa de CAR:** carregar recortes e CAR de homologação, preparar vínculos/cobertura, consultar e ligar o protótipo à API.
3. **Demais variáveis:** incorporar assentamentos e PTR após definição da fonte, preservando a tabela genérica.
4. **Homologação:** medir volumes e desempenho, validar controles de acesso, atualização por edição e operação.

Nenhuma etapa equivale a autorização para conectar a banco de produção ou publicar dados reais.

## Pendências para decidir

| ID | Decisão / insumo | Consequência |
| --- | --- | --- |
| P01 | Definição de PTR, unidade, aprovação, chave e geometria | Pontos e contagem do protótipo são provisórios. |
| P02 | Universo municipal e lista oficial dos 49 | Atalho de produção depende de lista validada, não apenas da quantidade. |
| P03 | Identidades e composição municipal das ATIs | Conferir associação e limites correspondentes. |
| P04 | Buffer oficial e trechos; versões de assentamentos, TIs e quilombolas | Substituir geometrias esquemáticas. |
| P05 | Colunas reais, fontes, chaves e periodicidade | Fechar dicionário de atributos e política de edições. |
| P06 | Contrato HTTP e arquitetura de implantação | OpenAPI é proposta; serviço ainda não existe. |
| P07 | Volumes, acesso e operação | Definir metas e requisitos de produção com evidências. |

## Instrução inicial para a IA da equipe receptora

> Leia README.md e AGENTS.md. Use as regras de negócio e os exemplos de aceite como referência. Identifique lacunas e conflitos antes de assumir decisões. Implemente a tarefa acordada em uma parte revisável, preserve o protótipo e demonstre os testes executados. Não apresente uma API proposta como já implementada.

## Referência e histórico

`cooperacao-v0.1` é a base inicial para discussão. Os documentos extensos anteriores e os dados brutos foram retirados da árvore atual para reduzir ambiguidade; permanecem no histórico Git. As regras consolidadas, o modelo lógico e o contrato atual são os pontos de entrada desta entrega. Não há scripts SQL prometidos e ausentes na lista de entregáveis.
