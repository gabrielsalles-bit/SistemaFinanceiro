# ADR 0005 — Lógica de cálculo isolada em módulos puros e testáveis

## Status
Aceito

## Contexto
Toda a análise financeira do app (tendência de gasto, projeção de
fechamento de mês, taxa de poupança, saldo acumulado) envolve regras com
casos de borda fáceis de errar — por exemplo, comparar um mês só com meses
cronologicamente anteriores, ou não projetar um mês que já fechou como se
ainda estivesse em andamento. Dois bugs reais desse tipo foram encontrados
em revisão durante o desenvolvimento (projeção inflando valores de meses
passados, e comparação usando meses futuros).

## Decisão
Toda a lógica de cálculo financeiro e de parsing vive em `src/utils/` como
funções puras (mesma entrada → mesma saída, sem acesso a rede, DOM ou
banco), separada dos componentes de UI e dos serviços de acesso a dados.
Cada função pública nesses módulos tem teste automatizado cobrindo pelo
menos um caso de borda.

## Alternativas consideradas
- **Cálculo feito inline dentro dos componentes React**: era o padrão
  original do projeto para "vs. média dos últimos meses" (lógica de filtro
  embutida direto no componente `AnalysisView`) — foi exatamente onde um
  dos dois bugs de comparação com mês futuro passou despercebido, por não
  ter teste isolado possível sem montar o componente inteiro.

## Consequências
- Testes rodam com o test runner nativo do Node (`node --test`), sem
  precisar de mocks de rede, banco ou DOM — rápido e sem dependência extra
  de framework de teste.
- Qualquer nova regra de cálculo financeiro deve nascer em `src/utils/`,
  não dentro de um componente, para manter essa cobertura possível.
- Ver `docs/test-evidence/` para a evidência de execução da suíte atual.
