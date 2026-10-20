# Retrospectiva do projeto

Avaliação final do grupo sobre o uso de agentes de IA no fluxo de
Especificação Dirigida por Testes (SDD). Os fatos citados vêm do histórico do
repositório; o que é julgamento está dito como tal.

## O que o fluxo SDD com agente de IA entregou

- **Rastreabilidade.** Cada decisão relevante virou ADR no momento em que foi
  tomada (7 ADRs), e a especificação evoluiu em versões registradas (v1 até
  v4.0). Dá para explicar não só o que o sistema faz, mas por que.
- **Velocidade na parte mecânica.** O agente produziu rapidamente a estrutura
  do projeto, os testes, o Docker, o CI e a documentação. Não medimos o ganho
  em horas; a avaliação é qualitativa: o esforço humano migrou de escrever
  para especificar, revisar e decidir.
- **Qualidade verificável.** Suíte de 30 testes, 92,4% de cobertura de linhas
  nos módulos de `src/utils/` e CI com tipos, testes, cobertura e build.

## Dificuldades superadas

| Dificuldade | Como foi superada |
|---|---|
| Código gerado com aparência correta e cálculo errado (3 erros lógicos, E1 a E3) | Revisão humana e testes de borda; correção com teste de regressão |
| Especificação ambígua (projeção de mês fechado, escopo de teste) | Re-especificação registrada (v2.1, v3.1) |
| Escopo grande com requisito de custo zero | Corte consciente de Open Finance (ADR 0003) |
| Dependências com falhas de segurança descobertas só na auditoria final | Atualização de Next/React e SheetJS (ADR 0007) |
| Projeto dentro do OneDrive deixou o `npm install` muito lento, e uma instalação interrompida corrompeu o `node_modules` | Reinstalação limpa a partir do `package-lock.json`, o que mostrou o valor do lockfile |
| Cobrir lógica com testes sem testar interface | Regras isoladas em funções puras (ADR 0005); interface verificada manualmente |

## Lições sobre governança em equipe

- **O que funcionou:** fluxo `feature` → `develop` → `main` com Pull Request,
  template de PR com checklist, CI obrigatório e `main` protegida.
- **O que faltou:** revisão entre pares registrada. Os PRs foram revisados
  pelo próprio autor, e a proteção da `main` não exige aprovação de outro
  integrante. Em projeto de grupo isso deveria estar ativo desde o início
  (*Require approvals*).
- **Descrição de PR é parte da entrega.** O PR #5 saiu com o template em
  branco e precisou ser corrigido depois.
- **Auditoria só no fim custa caro.** `npm audit` e a busca por código morto
  deveriam rodar a cada PR, e não só na release.

## Sobre o uso de agentes de IA

- A IA acelera, mas **não valida a si mesma**: o agente escreve o código e o
  teste, e ambos podem repetir o mesmo erro. Os erros E1 e E2 só apareceram
  na revisão humana.
- Regras escritas (`CLAUDE.md`) mudam o comportamento do agente: sem segredos,
  sem commit na `main`, teste junto de cada correção.
- O agente declarou o que não conseguia verificar (CI e proteção de branch no
  GitHub) em vez de afirmar. Essa honestidade sobre limites foi tão útil
  quanto o código.
- A ferramenta pesa menos que o processo: gestão de prompts, skills, MCPs e
  revisão humana determinam o resultado.

## O que faríamos na próxima versão

1. Testes de interface e e2e (Playwright) para o fluxo principal.
2. Fila de pendências offline, para que o remoto não sobrescreva lançamentos
   feitos sem rede (limitação L8 da especificação).
3. Autenticação real no Supabase e RLS por usuário, no lugar do PIN como trava.
4. Next 16, para fechar os últimos avisos do `npm audit`.
5. Aprovação obrigatória de outro integrante nos PRs.
