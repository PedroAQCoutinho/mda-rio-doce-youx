# Orientações para colaboração com IA

## Ordem de leitura

1. `README.md` — estado da entrega e execução.
2. `docs/regras-de-negocio.md` — comportamento de referência.
3. `docs/modelo-logico.md` — identidades e regra de consulta.
4. `contratos/openapi.json` e `exemplos/consultas.json` — entradas e saídas propostas.
5. `docs/cooperacao.md` — decisões pendentes e divisão do trabalho.

## Como trabalhar

- Responda em português e preserve alterações existentes. Confira `git status` antes de editar.
- Não altere uma regra de negócio silenciosamente. Registre a dúvida ou decisão na issue/PR e atualize a especificação e os testes juntos.
- As regras de negócio orientam o comportamento; o protótipo demonstra a experiência. O contrato HTTP é uma proposta, não uma API já implantada. Em conflito entre arquivos, explicite o conflito e resolva-o com a equipe responsável.
- Não infira a definição de PTR, fontes reais, limites oficiais ou composição dos 49. As lacunas estão em `docs/cooperacao.md`.
- Mantenha recortes acumulados, união e deduplicação por variável. As consultas analíticas usam vínculos prontos; desenho seleciona recortes inteiros.
- Preserve diferença entre zero completo, cobertura indisponível e erro. Nunca publique um total parcial como completo.
- Mantenha código, exemplos e testes determinísticos. Evite novas dependências sem necessidade concreta.
- Dados simulados permanecem identificados. Não leia, copie ou publique `.env`, credenciais, chaves ou dados pessoais. Não reutilize dados brutos locais sem tarefa e fonte definidas.
- Para tarefas de backend, implemente em partes: contrato, carga, processamento, consulta e integração. Não reescreva o protótipo inteiro sem necessidade.

## Verificação

- Execute `node tests/run-tests.cjs` (Node.js 22+; sem dependências).
- Para UI, abra `prototipo/index.html`; teste o fluxo alterado e as resoluções desktop 1366×768 e 1920×1080.
- `tests/data_checks.html` executa a suíte de dados no navegador.
- Registre o que foi testado e qualquer limite. Não afirme que o backend foi validado enquanto só existir o protótipo.
