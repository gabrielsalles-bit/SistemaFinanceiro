# Erros lógicos identificados e loop de re-especificação

Registro dos defeitos encontrados durante o desenvolvimento, como foram
descobertos, como foram corrigidos e se a especificação precisou mudar.
Todo defeito corrigido tem teste de regressão no mesmo commit da correção.

| # | Defeito | Como foi encontrado | Correção | Teste de regressão | Spec alterada? |
|---|---|---|---|---|---|
| E1 | `projectMonthEndTotal` extrapolava a média diária também para meses já encerrados, inflando o valor projetado | Revisão de código após a implementação da análise | Projeção só se aplica ao mês corrente; meses passados devolvem o total real | `projectMonthEndTotal extrapolates…` e `…day-1 currentDate…` em `insights.test.ts` | Sim — v2.1 (RF08) |
| E2 | `getExpenseTrend` comparava o mês consultado com a média de **todos** os outros meses, inclusive futuros | Revisão de código | Média restrita a meses cronologicamente anteriores | `getExpenseTrend only averages months chronologically before the queried month…` | Sim — v2.1 (RF07) |
| E3 | `formatDate` aceitava qualquer texto com dois hífens: `'not-a-date'` virava `'date/0a/ot'`; timestamp ISO completo (`2026-03-05T10:30:00Z`) gerava dia inválido | Teste de borda escrito para cumprir a regra de cobertura do `CLAUDE.md` (o teste falhou na primeira execução, antes da correção) | Validação por expressão regular `^\d{4}-\d{1,2}-\d{1,2}`; entrada fora do padrão é devolvida sem alteração | `formatDate converts ISO to DD/MM/YY and tolerates empty or malformed input` em `formatters.test.ts` | Sim — v3.1 (RNF06 reescrito) |

## Estratégia adotada

1. **Teste antes da correção quando possível**: em E3 o teste foi escrito
   primeiro, falhou com a saída real (`'date/0a/ot'`) e só então a função
   foi alterada.
2. **Correção na função, não no teste**: o teste de E3 descreve o
   comportamento esperado; a função foi ajustada para cumpri-lo.
3. **Regressão permanente**: os testes ficam na suíte e rodam no CI a cada
   push e Pull Request.

## Loop de re-especificação

O histórico completo de versões está na seção 8 de
[`../spec/ESPECIFICACAO.md`](../spec/ESPECIFICACAO.md). Resumo do que os
testes/revisões forçaram a mudar na especificação:

- **v2.1** — RF07/RF08 não diziam que projeção e comparação dependem do mês
  corrente e da ordem cronológica; E1 e E2 mostraram a ambiguidade.
- **v3.1** — RNF06 exigia teste para "toda a lógica em `src/utils/`", mas o
  critério era vago sobre o que conta como lógica testável. A auditoria
  mostrou funções que dependem de `File`/DOM (`parseCSVFile`,
  `parseXLSXFile`) e dados de apresentação (`categoryIcons`). A regra foi
  reescrita para **funções puras** e as de I/O foram explicitadas como fora
  da suíte unitária.
