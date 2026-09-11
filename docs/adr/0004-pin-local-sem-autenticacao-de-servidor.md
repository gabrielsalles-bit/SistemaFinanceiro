# ADR 0004 — PIN local como trava de interface, sem autenticação de servidor

## Status
Aceito

## Contexto
O app é de uso pessoal/single-tenant por instância (uma URL do Supabase =
um usuário/casal, não um sistema multiusuário). Implementar autenticação
completa (Supabase Auth, sessões, recuperação de senha) adicionaria
complexidade sem benefício real nesse cenário, e o schema v1 do projeto já
havia tentado depender de `auth.users` sem que o app nunca autenticasse de
fato — todo insert falhava silenciosamente.

## Decisão
Controle de acesso via PIN numérico local: o hash SHA-256 do PIN
(`src/utils/pin.ts`, via Web Crypto API) fica salvo em
`user_preferences.pin_hash`, e a tela de bloqueio (`AppSecurityLock`)
apenas esconde a interface até o PIN correto ser digitado. Não há sessão de
servidor nem token de autenticação.

## Alternativas consideradas
- **Supabase Auth completo (e-mail/senha)**: rejeitado por complexidade
  desnecessária para uso pessoal de uma única pessoa/casal por instância, e
  por exigir fluxo de recuperação de senha (e-mail transacional, que foi
  removido do escopo — ver README).
- **Sem nenhuma proteção**: rejeitado — o PIN evita que alguém que pegue o
  celular desbloqueado do usuário veja os dados sem nenhuma fricção.

## Consequências
- **Limitação explícita e documentada**: o PIN protege a *interface*, não o
  *banco*. Como a política de RLS do Supabase é permissiva (`using (true)`)
  e a chave anônima é pública por natureza, quem descobrir a URL do projeto
  Supabase e ler o bundle JavaScript publicado tem acesso direto à API REST,
  independentemente do PIN. Essa limitação está documentada em comentário
  no topo de `supabase_schema.sql` para não ser esquecida.
- Adequado ao modelo de ameaça real do projeto (uso pessoal, URL não
  divulgada publicamente) — não adequado se o projeto crescer para
  múltiplos usuários ou dados mais sensíveis, caso em que autenticação real
  no lado do servidor (Supabase Auth + RLS por `user_id`) precisaria
  substituir esta abordagem.
