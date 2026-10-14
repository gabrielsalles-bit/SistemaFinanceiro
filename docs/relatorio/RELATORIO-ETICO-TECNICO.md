# Relatório técnico-ético: uso de agentes de IA no ciclo de vida do projeto

> **Como ler este relatório.** **Só o Claude Code foi usado em todo o
> ciclo de desenvolvimento deste repositório**. O
> Antigravity entra na comparação pela avaliação de uso do grupo, não por
> ter sido usado neste repositório. Codex CLI e Cursor não foram usados e
> por isso não são avaliados. As afirmações sobre o Claude Code apontam
> para evidências (commits, testes, ADRs).

## 1. Análise comparativa de ferramentas

| Critério | Claude Code | Antigravity |
|---|---|---|
| Usada neste projeto? | Sim, em todo o ciclo | Não; avaliação de uso do grupo |
| Interface | CLI/extensão de IDE com acesso a arquivos, shell e git | Ambiente de desenvolvimento orientado a agentes |
| Pontos fortes | Raciocínio e lógica de produção: decomposição de requisitos, código, testes, build e commits atômicos; respeita regras do `CLAUDE.md` | Forte em design e interface visual |
| Limitações | Gerou 2 defeitos de cálculo (E1, E2) que só a revisão humana pegou; precisa de regras explícitas para não commitar segredos nem ir direto à `main`; não verifica o que existe só no GitHub (CI, branch protection) sem o `gh` instalado | Menos indicada, na avaliação do autor, para lógica e produção de código do que o Claude |
| Impacto na especificação | Ajudou a decompor requisitos e manter ADRs; a spec só ficou precisa depois que testes e revisão revelaram ambiguidades (v2.1, v3.1) | Não avaliado neste projeto |
| Impacto no código | Alto em velocidade; a qualidade dependeu de teste + revisão (ver [erros lógicos](../qualidade/ERROS-LOGICOS-E-REESPECIFICACAO.md)) | Não avaliado neste projeto |

**Codex CLI e Cursor:** não utilizados; sem avaliação.

**Conclusão.** O Claude se mostrou mais forte em lógica e produção; o
Antigravity, em design. Mas a ferramenta pesa menos que a forma de usá-la:
com boa gestão de prompts, organização do trabalho com IA e uso de recursos
como *skills* e servidores MCP, as duas entregam bom resultado. Neste
projeto, o que sustentou a qualidade foi o processo (spec, testes,
ADRs, revisão humana), não a escolha da ferramenta.

## 2. Alucinação de código e código inseguro ou destrutivo

**O risco é real e aconteceu neste projeto.** Dois defeitos de cálculo (E1:
projeção de mês fechado inflava o valor; E2: tendência comparava com meses
futuros) foram gerados com aparência correta e só apareceram na revisão. Um
terceiro (E3: `formatDate` devolvia `'date/0a/ot'` para entrada inválida)
estava no código inicial e só apareceu quando um teste de borda foi
escrito. Nenhum gerou mensagem de erro: o código rodava e mostrava números
plausíveis, o que torna a alucinação de lógica especialmente perigosa em
software financeiro.

**Código destrutivo.** `StorageService.clearAllData` apaga dados locais e
remotos (`delete().neq('id', '')` no Supabase). Um agente com acesso ao
shell e a credenciais poderia executar isso, ou comandos git irreversíveis,
sem querer. Mitigações: `main` sem commit direto, trabalho em feature
branch e confirmação humana antes de ações irreversíveis ou externas.

**Controles adotados:** testes de borda por função pura (ADR 0005), teste
de regressão junto de cada correção, CI em todo push/PR e revisão humana
antes do merge.

## 3. Vazamento de dados, privacidade e confidencialidade

- **O que o modelo vê.** O agente lê arquivos locais e pode enviá-los ao
  provedor como contexto. Por isso a regra do `CLAUDE.md`: `.env.local`
  nunca é versionado; só `.env.local.example` com placeholders. Verificação
  desta entrega: busca no repositório versionado não encontrou chaves
  reais.
- **Dados financeiros reais.** Extratos bancários contêm dados pessoais
  (LGPD). Os testes usam dados sintéticos; extratos reais não devem ir a
  prompts nem a fixtures.
- **Chave `anon` do Supabase.** É pública por desenho; a proteção real
  exige Row Level Security no banco. O PIN (ADR 0004) é só trava de
  interface e **não** substitui autenticação de servidor. Limitação
  assumida e registrada.
- **Contexto em conversas.** Tudo o que entra no prompt deve ser tratado
  como publicado: pode ser retido pelo provedor conforme os termos do
  plano. O grupo deve conferir a política de retenção do plano que usa.

## 4. Propriedade intelectual e direitos autorais

- **Autoria.** O entendimento jurídico sobre obras geradas por IA está em
  evolução e varia por país; no Brasil, a Lei 9.610/98 pressupõe autor
  pessoa natural. Código gerado sem contribuição criativa humana pode não
  ter proteção autoral clara. Aqui, especificação, decisões (ADRs),
  revisão e integração são humanas.
- **Contaminação por licença.** O modelo pode reproduzir trechos sob
  licenças restritivas sem avisar. Mitigação: dependências declaradas em
  `package.json`, evitar colar blocos grandes gerados sem revisar e manter
  a origem rastreável no histórico git.
- **Transparência.** O uso de IA está declarado no `CLAUDE.md` e nos
  commits (`Co-Authored-By`).
- Esta seção é análise acadêmica, não parecer jurídico.

## 5. Homologação humana como etapa obrigatória do SDD

A IA acelera a produção, mas **não valida a si mesma**: o agente que
escreve o código também escreve o teste, e ambos podem repetir o mesmo erro
de raciocínio. Evidências deste projeto:

1. E1 e E2 só foram pegos por **revisão humana**, não pelos testes que a
   própria IA havia escrito.
2. Os critérios de aceitação (seção 9 da spec) são definidos por pessoas.
3. A decisão de escopo (ADR 0003: sem Open Finance) foi humana, por custo e
   risco; a IA só registrou.
4. Nada deve ir para `main` sem Pull Request e revisão.

**Regra adotada:** a IA propõe, o teste verifica, a pessoa homologa.
Aprovar um PR sem ler o diff transfere a responsabilidade para a máquina, e
é exatamente o que este relatório desaconselha.

## 6. Relato de experiência (comunicação técnica)

O desenvolvimento foi conduzido com o Claude Code seguindo
Especificação Dirigida por Testes: especificação primeiro, depois tarefas
pequenas, cada uma com implementação e revisão antes da seguinte.

**O que funcionou**
- Decisões registradas como ADRs na hora em que foram tomadas, o que
  deixou o "porquê" rastreável.
- Isolar a lógica de cálculo em funções puras (ADR 0005), o que tornou os
  bugs reproduzíveis por teste.
- Regras explícitas no `CLAUDE.md` (sem segredos, sem commit na `main`),
  que o agente passou a seguir.

**Desafios**
- Código gerado que parece correto e roda sem erro, mas calcula errado
  (E1, E2, E3): só a revisão e os testes de borda pegaram.
- Manter o escopo pequeno: a spec precisou ser reescrita (v1 para v2) para
  cortar Open Finance e manter o custo zero.
- Ajustar a spec quando a regra de cobertura se mostrou ampla demais (v3.1).

**Aprendizado central:** a IA acelera, mas a qualidade vem de teste, spec
clara e revisão humana. A revisão dos PRs foi feita pelo autor de cada
PR, com o checklist do template; não há review entre pares registrado
no GitHub, o que é uma limitação reconhecida.
