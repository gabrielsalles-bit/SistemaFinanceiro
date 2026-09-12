# Contexto para agentes de IA

Este arquivo documenta como um agente de IA (Claude Code) foi usado no
desenvolvimento deste projeto e orienta qualquer sessão futura de agente
que trabalhe neste repositório.

## Como este projeto foi construído

O desenvolvimento seguiu um fluxo orientado por especificação
(Specification-Driven Development): primeiro a especificação de requisitos
foi escrita e discutida (`docs/spec/ESPECIFICACAO.md`), depois decomposta
em tarefas executadas incrementalmente, cada uma com implementação seguida
de revisão de código antes de seguir para a próxima. Decisões de
arquitetura relevantes foram registradas como ADRs (`docs/adr/`) no momento
em que foram tomadas, não retroativamente.

Duas revisões de código levaram à correção de bugs reais de cálculo
(projeção de mês fechado inflando valores; comparação de tendência usando
meses futuros) — ambos corrigidos com teste de regressão adicionado junto
da correção, não apenas o patch isolado.

## Regras para um agente trabalhando neste repositório

- **Não commitar segredos.** `.env.local` nunca deve ser versionado —
  apenas `.env.local.example` com placeholders. Antes de qualquer commit,
  confirme que nenhuma chave real do Supabase está no diff.
- **Lógica de cálculo financeiro vive em `src/utils/`, não em
  componentes.** Qualquer nova regra de análise (tendência, projeção, taxa
  de poupança) deve ser uma função pura testável nesse diretório — ver
  [ADR 0005](docs/adr/0005-logica-pura-separada-para-testabilidade.md) para
  o motivo.
- **Toda função pública em `src/utils/` precisa de teste cobrindo pelo
  menos um caso de borda.** Rode `npm run test` antes de considerar
  qualquer mudança em `src/utils/` concluída.
- **Não reintroduzir dependências pagas.** O projeto existe para provar que
  dá para ter um app de finanças completo com custo operacional zero — ver
  [ADR 0002](docs/adr/0002-supabase-backend.md) e
  [ADR 0003](docs/adr/0003-registro-manual-sem-open-finance.md). Qualquer
  proposta de integração externa deve justificar por que continua gratuita
  no uso esperado do app.
- **Mudança de escopo relevante começa como ADR, não direto como código.**
  Se a mudança envolve uma decisão de arquitetura (nova dependência, nova
  forma de autenticação, mudança no modelo de dados), registre a decisão em
  `docs/adr/` antes ou junto da implementação.
- **Commits não vão direto para `main`.** Trabalho novo nasce em
  `feature/<nome-descritivo>` a partir de `develop`, e chega a `develop` (e
  depois a `main`) via Pull Request. Ver `README.md` → seção "Fluxo de
  contribuição".

## Ambiente de desenvolvimento

- `.claude/launch.json` configura o servidor de desenvolvimento
  (`npm run dev` na porta 3001) para uso com o preview integrado do Claude
  Code — não é necessário para rodar o projeto manualmente, apenas
  conveniência para sessões de agente.
- Ver `Dockerfile`/`docker-compose.yml` na raiz para rodar o ambiente de
  forma reprodutível sem depender da máquina local ter Node instalado.
