# Changelog

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/);
versionamento [SemVer](https://semver.org/lang/pt-BR/).

## [1.0.0] - 2026-10-20

Primeira release estável.

### Adicionado
- Especificação técnica definitiva (As-Built) em `docs/spec/ESPECIFICACAO-AS-BUILT.md`.
- Relatório de cobertura (`npm run test:coverage`) e script `typecheck`.
- Serviço `test` no `docker-compose.yml`: `docker compose run --rm test`.
- ADR 0007 (atualização de dependências), retrospectiva do projeto e roteiro do vídeo de demonstração.
- Relatório ético-técnico sobre o uso de agentes de IA e log de erros lógicos.

### Alterado
- Next.js 14 → 15.5.28 e React 18 → 19 (corrige avisos críticos de segurança; ver ADR 0007).
- `xlsx` passa a usar o pacote oficial da SheetJS 0.20.3 (corrige poluição de protótipo e ReDoS).
- Node.js 22 no CI e no Docker; o CI passa a rodar checagem de tipos e cobertura.
- Compose: as variáveis do Supabase são opcionais (o app funciona offline sem elas).

### Corrigido
- `formatDate` devolvia texto inválido para datas malformadas e dia incorreto em timestamps ISO.
- Projeção de fechamento extrapolava meses já encerrados.
- Comparação de tendência incluía meses futuros na média.

### Removido
- Dependências não usadas: `clsx`, `framer-motion`.
- Código morto: estado `typeFilter` e `newCatIcon` sem uso, prop `totalIncome` do `MainBudgetCard`, tipo `MonthlyBudgetSummary`, variáveis e imports não usados.

### Limitações conhecidas
Ver `docs/spec/ESPECIFICACAO-AS-BUILT.md`, seção 9 (PIN sem sal, RLS permissivo, remoto prevalece na carga, sem testes de interface).

## [0.2.0]
Versão anterior à governança: aplicação funcional com lançamentos, categorias, importação de extrato, análises, sincronização e PIN.
