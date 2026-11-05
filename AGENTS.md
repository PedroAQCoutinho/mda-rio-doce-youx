# Orientações para o agente

## Entender a tarefa e localizar as referências

1. Leia [README.md](README.md) para conhecer o objetivo e a estrutura do projeto.
2. Leia [FUNCIONAMENTO_PLATAFORMA.md](FUNCIONAMENTO_PLATAFORMA.md) para entender a interface, os comportamentos esperados e os critérios de aceite.
3. Consulte [DADOS.md](DADOS.md) para identificar recortes, variáveis, atributos e pendências das fontes.
4. Leia [MODELO_LOGICO.md](MODELO_LOGICO.md) para compreender identidades, cruzamentos e formação dos resultados.
5. Explore [prototipo/index.html](prototipo/index.html) e o código correspondente antes de alterar a experiência.

## Como interpretar a entrega

| Referência | Como utilizar |
| --- | --- |
| Pedido atual do usuário | Define o trabalho autorizado e pode atualizar as decisões anteriores. |
| Funcionamento da plataforma | Especifica o comportamento esperado. Use os identificadores das linhas para localizar funcionalidades e critérios de aceite. |
| Catálogo de dados | Define o significado de cada conjunto e registra o que depende de confirmação. |
| Modelo lógico | Orienta a implementação das relações e dos resultados. As escolhas físicas devem atender a essas regras. |
| Protótipo | Referência de aparência e interação. A seção de diferenças em FUNCIONAMENTO_PLATAFORMA.md identifica pontos a completar. |

Se encontrar divergência entre documentação, código e pedido, explicite o ponto e sua consequência. Resolva com o contexto disponível e peça esclarecimento quando faltar uma decisão que altere o resultado. Registre decisões novas no documento responsável pelo assunto.

## Onde trabalhar

| Caminho | Responsabilidade |
| --- | --- |
| `prototipo/index.html` | Estrutura dos painéis e controles. |
| `prototipo/css/styles.css` | Aparência, organização e adaptação às telas desktop. |
| `prototipo/js/app.js` | Estado da interface, interações, mapa, tabelas e exportação. |
| `prototipo/js/data.js` | Catálogos simulados, registros, vínculos, cobertura e adaptador `BI.api`. |
| `prototipo/tests/` | Testes espaciais, exemplos de consulta e verificação dos arquivos da entrega. |
| `.github/workflows/validar.yml` | Execução automatizada das verificações a cada push e pull request. |

## Implementar

- Responda em português. Confira o estado do Git e as instruções aplicáveis antes de editar. Preserve alterações preexistentes do usuário.
- Faça a menor mudança que atenda à tarefa. Reutilize os componentes existentes quando eles atendem ao comportamento solicitado.
- Mantenha as definições de dados em DADOS.md, as interações em FUNCIONAMENTO_PLATAFORMA.md e as relações em MODELO_LOGICO.md. Atualize exemplos e verificações afetados por mudanças de regra.
- Para consultas, preserve união de recortes, identificação estável dos registros, deduplicação por variável e consistência entre quantidade, mapa, tabela e exportação.
- Use os vínculos previamente preparados para consultar variáveis. A seleção por desenho identifica recortes cadastrados inteiros.
- Trate resultado completo com zero, dados indisponíveis e falha de consulta como estados distintos. Fixe a edição dos dados usada em cada resultado.
- Consulte as pendências de DADOS.md antes de usar fontes reais. Definição de PTR, composição oficial dos 49 e identificadores dependem de confirmação.
- Identifique dados simulados. Mantenha credenciais e dados de autenticação fora do código e da documentação. Use somente os insumos autorizados para a tarefa.
- Ao implementar o backend, conecte o acesso aos dados ao adaptador da interface e entregue incrementos verificáveis. Registre as decisões técnicas e os scripts necessários para reproduzir o banco quando ele for implementado.

## Verificar e relatar

- Execute `node prototipo/tests/run-tests.cjs` com Node.js 22 ou superior. A suíte verifica 25 casos espaciais e de dados, seis exemplos de consulta e referências locais.
- A suíte de dados também roda ao abrir `prototipo/tests/data_checks.html` no navegador.
- Em alterações de interface, abra `prototipo/index.html`, percorra o fluxo afetado e confira 1366 × 768 e 1920 × 1080. Use os critérios de aceite da documentação.
- Em alterações de exportação, confira o XLSX gerado e a correspondência entre registros exportados e resultado consultado.
- Ao concluir, informe o que mudou, onde está, quais verificações foram executadas e quais pendências restam. Diferencie evidências do protótipo das verificações da implementação de produção.
