# Relatório técnico-ético: uso de agentes de IA no ciclo de vida do projeto

> **Como ler este relatório.** As afirmações sobre o Claude Code vêm da
> experiência direta neste repositório e apontam para evidências (commits,
> testes, ADRs). Os campos marcados **[PREENCHER PELO GRUPO]** só devem ser
> preenchidos por quem de fato usou a ferramenta. Não preencha por
> suposição: um relatório crítico perde o valor se descrever ferramentas
> que ninguém testou.

## 1. Análise comparativa de ferramentas

| Critério | Claude Code | Codex CLI | Cursor | Antigravity |
|---|---|---|---|---|
| Usada neste projeto? | Sim (todo o ciclo) | [PREENCHER PELO GRUPO] | [PREENCHER PELO GRUPO] | [PREENCHER PELO GRUPO] |
| Interface | CLI/extensão de IDE com acesso a arquivos, shell e git | [PREENCHER PELO GRUPO] | [PREENCHER PELO GRUPO] | [PREENCHER PELO GRUPO] |
| Pontos fortes observados | Lê o repositório inteiro, roda testes e build, respeita regras do `CLAUDE.md`, produz commits atômicos | [PREENCHER PELO GRUPO] | [PREENCHER PELO GRUPO] | [PREENCHER PELO GRUPO] |
| Limitações observadas | Gerou 2 defeitos de cálculo (E1, E2) que só a revisão humana pegou; precisa de regras explícitas para não commitar segredos nem ir direto à `main`; não verifica o que existe só no GitHub (CI, branch protection) sem o `gh` instalado | [PREENCHER PELO GRUPO] | [PREENCHER PELO GRUPO] | [PREENCHER PELO GRUPO] |
| Impacto na especificação | Ajudou a decompor requisitos e manter ADRs; a spec só ficou precisa depois que testes e revisão revelaram ambiguidades (v2.1, v3.1) | [PREENCHER PELO GRUPO] | [PREENCHER PELO GRUPO] | [PREENCHER PELO GRUPO] |
| Impacto no código | Alto em velocidade; a qualidade dependeu de teste + revisão (ver [erros lógicos](../qualidade/ERROS-LOGICOS-E-REESPECIFICACAO.md)) | [PREENCHER PELO GRUPO] | [PREENCHER PELO GRUPO] | [PREENCHER PELO GRUPO] |

**Método sugerido para completar a comparação:** aplicar a mesma tarefa
pequena (por exemplo, "escreva testes de borda para
`calculateFinancialHealth`") em cada ferramenta e comparar acertos, tempo e
quantidade de correção humana necessária.

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

**[PREENCHER PELO GRUPO]** Aprendizados e desafios do desenvolvimento em
grupo: divisão de tarefas, conflitos de merge, o que a revisão entre pares
pegou e o que faria diferente. Esta seção precisa refletir a experiência
real da equipe.
