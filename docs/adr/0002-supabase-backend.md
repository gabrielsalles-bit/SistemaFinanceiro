# ADR 0002 — Supabase como backend de sincronização

## Status
Aceito

## Contexto
O sistema precisa sincronizar lançamentos entre dispositivos sem custo
recorrente e sem exigir que o usuário mantenha um servidor próprio.

## Decisão
Usar Supabase (PostgreSQL gerenciado + API REST via PostgREST) no plano
gratuito, acessado diretamente do cliente com `@supabase/supabase-js`.

## Alternativas consideradas
- **Firebase/Firestore**: viável, mas o modelo de dados do app (lançamentos
  com filtros por data/categoria, agregações mensais) mapeia mais
  naturalmente para tabelas SQL do que para um banco de documentos.
- **Backend próprio (Node + Postgres) hospedado em serviço gratuito**:
  rejeitado por exigir manter e hospedar uma API adicional só para expor o
  que o PostgREST do Supabase já expõe de fábrica.

## Consequências
- Sem servidor próprio para manter: o cliente fala diretamente com a API
  REST do Supabase.
- A chave usada no cliente (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) é pública por
  natureza (embutida no bundle JavaScript) — a política de acesso ao banco
  não pode depender de essa chave ser secreta. Essa consequência é tratada
  explicitamente no `supabase_schema.sql` e resumida no
  [ADR 0004](./0004-pin-local-sem-autenticacao-de-servidor.md).
- Limite do plano gratuito do Supabase (armazenamento e requisições) é mais
  que suficiente para o volume de dados de uso pessoal deste app.
