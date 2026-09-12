# Documentação do projeto

Índice de tudo que documenta este projeto além do código. Comece por aqui.

| Documento | O que encontra |
|---|---|
| [`spec/ESPECIFICACAO.md`](spec/ESPECIFICACAO.md) | Especificação técnica (SDD): requisitos funcionais e não funcionais, decomposição do sistema em módulos, modelo de dados, histórico de refinamento da especificação e critérios de aceitação |
| [`adr/`](adr/README.md) | Registros de decisão de arquitetura (ADRs) — por que cada escolha técnica foi feita, alternativas consideradas e consequências |
| [`test-evidence/`](test-evidence/) | Evidência salva de execução da suíte de testes automatizada (complementa o [pipeline de CI](../.github/workflows/ci.yml), que roda a cada push/PR) |
| [`../CLAUDE.md`](../CLAUDE.md) | Como o projeto foi construído com um agente de IA (Claude Code) e regras para qualquer sessão futura de agente que trabalhe neste repositório |
| [`../README.md`](../README.md) | Visão geral do projeto, como rodar localmente e via Docker, e fluxo de contribuição (branches/PRs) |

## Ordem de leitura sugerida para avaliação

1. `../README.md` — visão geral e como rodar o projeto
2. `spec/ESPECIFICACAO.md` — o que o sistema faz e por quê
3. `adr/README.md` — por que foi construído do jeito que foi
4. `test-evidence/` + aba **Actions** do GitHub — prova de que os testes passam
5. `../CLAUDE.md` — como o processo de desenvolvimento com IA foi conduzido
