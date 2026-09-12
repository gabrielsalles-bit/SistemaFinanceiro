# ADR 0003 — Lançamento manual como fluxo principal, sem integração bancária automática

## Status
Aceito

## Contexto
Integração bancária automática (Open Finance) resolveria o problema de
digitação manual, mas exige um provedor de agregação bancária — serviços
desse tipo são pagos acima de um uso trivial, e introduzem uma dependência
externa crítica (se o provedor sair do ar ou mudar de preço, a
funcionalidade central do app quebra).

## Decisão
O lançamento manual é o fluxo principal e não depende de nenhuma
integração bancária automática. Para reduzir o trabalho de digitação sem
reintroduzir essa dependência, o sistema oferece importação assistida de
extrato via arquivo CSV/Excel exportado manualmente pelo próprio usuário do
banco, com uma tela de revisão obrigatória antes de confirmar qualquer
lançamento importado.

## Alternativas consideradas
- **Integração via Open Finance (ex.: Pluggy)**: rejeitada — modelo pago,
  incompatível com o requisito de custo operacional zero, e desnecessária
  para um app de uso pessoal de baixo volume.
- **Importação automática sem revisão**: rejeitada — lançamentos mal
  formatados ou duplicados entrariam no sistema sem controle do usuário.

## Consequências
- Nenhum dado bancário sensível (senha do banco, token de acesso a conta)
  trafega pelo sistema — o único dado que entra é o extrato que o próprio
  usuário exportou e escolheu importar.
- O usuário mantém controle total sobre o que é registrado, ao custo de
  precisar exportar o extrato manualmente do app do banco quando quiser
  importar em lote.
- Detecção de duplicata (mesma data + valor + descrição) é necessária como
  rede de segurança, já que a importação pode ser rodada mais de uma vez
  sobre o mesmo período.
