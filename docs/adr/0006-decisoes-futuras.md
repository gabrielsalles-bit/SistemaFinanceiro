# ADR 0006 — Escopo explicitamente adiado (não implementado nesta entrega)

## Status
Proposto (não implementado)

## Contexto
Durante o planejamento, algumas funcionalidades foram discutidas e
conscientemente adiadas para não comprometer o prazo nem a estabilidade do
que já está implementado e testado. Registrar isso como ADR evita que
pareçam esquecidas por descuido.

## Itens adiados

### Distinção entre débito e crédito (fatura do cartão)
Hoje todo lançamento reduz o saldo do mês em que foi feito. A evolução
proposta é: compra no crédito não reduz o saldo do mês corrente, e vira uma
"fatura" deduzida do saldo do mês seguinte. Desenho já discutido: cartão
único (sem múltiplos cartões), sem parcelamento, regra simples de "+1 mês"
em vez de rastrear data exata de fechamento de fatura. Não implementado
nesta entrega.

### Múltiplos cartões / parcelamento
Consequência natural de um sistema de crédito mais completo, mas teria custo
de modelagem (parcela como lançamento futuro recorrente) desproporcional ao
ganho para o caso de uso atual de um usuário só.

## Decisão
Não implementar estes itens nesta entrega. Mantê-los documentados aqui como
próximos passos válidos, para que uma decisão futura de retomar o trabalho
comece a partir do desenho já discutido, em vez de do zero.

## Consequências
- O sistema atual não diferencia débito de crédito — todo gasto é tratado
  como redução imediata do saldo do mês, o que é uma simplificação
  conhecida e aceita, não um defeito não percebido.
