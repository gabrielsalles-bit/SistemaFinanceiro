# ADR 0001 — Next.js (App Router) como framework principal

## Status
Aceito

## Contexto
O sistema precisa funcionar como aplicativo instalável (PWA) em celular e
desktop, com build de produção simples de hospedar em um serviço gratuito, e
com uma única base de código em TypeScript cobrindo UI e qualquer lógica de
servidor eventualmente necessária.

## Decisão
Usar Next.js 14 com App Router, React 18 e TypeScript.

## Alternativas consideradas
- **Vite + React puro (SPA)**: mais simples, mas exigiria configurar manualmente
  roteamento, PWA e build de produção que o Next.js já resolve de fábrica.
- **Uma stack com backend próprio (Express/Fastify + React)**: rejeitada por
  aumentar a superfície de infraestrutura sem necessidade — o app não tem
  lógica de servidor própria além de servir arquivos estáticos, já que todo
  o estado é gerenciado via Supabase e localStorage no cliente.

## Consequências
- Deploy trivial em Vercel (integração nativa com Next.js, deploy automático
  a cada push).
- App Router permite estrutura de arquivos simples mesmo o app sendo, na
  prática, uma única página (SPA-like) com componentes internos.
- Acopla o projeto ao ecossistema Next.js/Vercel — aceitável dado que ambos
  são gratuitos no nível de uso deste projeto.
