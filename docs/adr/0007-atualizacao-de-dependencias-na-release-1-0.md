# ADR 0007 — Atualização de dependências na release 1.0

## Status
Aceito

## Contexto
Na auditoria de higienização da release final, `npm audit` apontou
vulnerabilidades em dependências de produção: Next.js 14.2.35 (incluindo
avisos críticos corrigidos apenas na linha 15) e `xlsx` 0.18.5 do registro npm
(poluição de protótipo e ReDoS, corrigidos apenas nas versões distribuídas
pela SheetJS fora do npm). Além disso, `clsx` e `framer-motion` estavam
declaradas e nunca importadas.

## Decisão
1. **Next.js 14 → 15.5.28 e React 18 → 19.** Sem Server Actions, middleware,
   `next/image` ou rotas de API, a migração não exigiu mudança de código;
   build, tipos, testes e renderização da tela inicial foram verificados.
2. **`xlsx` passa a vir do tarball oficial da SheetJS 0.20.3**
   (`cdn.sheetjs.com`), versão que corrige os dois avisos. A API usada
   (`XLSX.read`/`sheet_to_json`) é a mesma.
3. **Remover `clsx` e `framer-motion`**, que não eram usadas.
4. **Node 22 como runtime** de CI e Docker, necessário para o relatório de
   cobertura nativo com filtro de arquivos.

## Alternativas consideradas
- **Permanecer no Next 14 e documentar o risco:** rejeitada, pois os avisos
  críticos eram de segurança e a migração mostrou-se de baixo custo.
- **Next 16:** a correção dos avisos restantes (moderado no `next` e
  `postcss`/`source-map-js` do build) exige a linha 16; adiada por ser nova
  troca de versão maior fora do escopo da release.
- **Trocar `xlsx` por outra biblioteca:** rejeitada por exigir reescrever o
  parser sem necessidade.

## Consequências
- Produção sem avisos críticos no `npm audit`; restam avisos de ferramentas de
  build, registrados em `docs/spec/ESPECIFICACAO-AS-BUILT.md` (L3).
- `xlsx` depende de um host fora do npm; o `package-lock.json` fixa o
  tarball. Se o CDN ficar indisponível, `npm ci` falha.
- A migração do React 19 não tem teste automatizado de interface: foi
  verificada por build e renderização, e a verificação visual completa é
  manual.
