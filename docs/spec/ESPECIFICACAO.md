# Especificação Técnica — Sistema de Gestão Financeira Pessoal

## 1. Visão geral

Aplicação web para controle financeiro pessoal, com **lançamento manual** de
receitas, despesas e investimentos como fluxo principal (não depende de
integração bancária via Open Finance). O sistema organiza lançamentos em
categorias com limite mensal, sincroniza entre dispositivos por meio de um
backend gratuito (Supabase) e funciona offline, salvando localmente e
sincronizando quando a conexão retorna.

Este documento segue uma abordagem de **Specification-Driven Development
(SDD)**: descreve o problema e os requisitos antes de descrever a solução, e
é o artefato de referência usado para orientar tanto o desenvolvimento quanto
a revisão do que foi entregue.

## 2. Problema e motivação

Controle financeiro pessoal feito em planilhas manuais tem três limitações
recorrentes: (a) não sincroniza entre dispositivos sem esforço manual, (b)
não dá nenhum feedback proativo (limite por categoria, projeção de gastos),
e (c) fica sujeito a erro humano de digitação sem nenhuma camada de
validação. O sistema resolve isso mantendo o lançamento manual — que dá ao
usuário controle total sobre o que é registrado — mas cercando esse
lançamento de categorização, limites, sincronização automática e análises
derivadas dos dados reais do usuário.

## 3. Requisitos funcionais

| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF01 | Registrar lançamento manual (receita, despesa ou investimento) com descrição, valor, categoria e data | Essencial |
| RF02 | Editar e excluir lançamentos existentes | Essencial |
| RF03 | Criar, editar e excluir categorias, cada uma com nome, ícone, cor e limite mensal | Essencial |
| RF04 | Mostrar progresso de gasto por categoria em relação ao limite mensal definido | Essencial |
| RF05 | Importar extrato bancário via arquivo CSV ou Excel (formatos Nubank PT-BR/EN e genérico), com tela de revisão antes de confirmar a importação | Essencial |
| RF06 | Detectar possíveis lançamentos duplicados durante a importação (mesma data + valor + descrição de um lançamento já existente) | Essencial |
| RF07 | Analisar saldo do mês corrente comparado à média de meses anteriores | Essencial |
| RF08 | Projetar o fechamento do mês corrente com base no gasto diário médio até a data | Essencial |
| RF09 | Calcular taxa de poupança (percentual da renda base não gasto) | Desejável |
| RF10 | Exibir evolução do saldo acumulado ao longo do tempo | Desejável |
| RF11 | Sincronizar lançamentos, categorias e preferências entre dispositivos via Supabase | Essencial |
| RF12 | Funcionar offline: gravar localmente e sincronizar automaticamente quando a conexão for restabelecida | Essencial |
| RF13 | Proteger o acesso ao aplicativo com PIN numérico (hash local, sem senha em texto puro) | Essencial |
| RF14 | Permitir instalação como aplicativo (PWA) em celular e desktop | Desejável |

## 4. Requisitos não funcionais

| ID | Requisito |
|----|-----------|
| RNF01 | Custo de operação zero — sem dependência de APIs pagas (a única dependência externa é o plano gratuito do Supabase) |
| RNF02 | Responsivo — uso confortável tanto em tela de celular quanto de desktop |
| RNF03 | Interface em português do Brasil, com formatação monetária brasileira (R$, separador de milhar `.`, decimal `,`) |
| RNF04 | Persistência local funcional mesmo sem rede (localStorage como cache, fila de sincronização) |
| RNF05 | Nenhum dado sensível (senha, PIN em texto puro) deve ser armazenado ou trafegado sem hash |
| RNF06 | Cobertura de teste automatizado para toda a lógica de cálculo financeiro (projeções, tendências, taxa de poupança) e para o parser de importação |

## 5. Fora de escopo (decisão consciente)

- **Integração bancária automática (Open Finance)** — descartada por exigir
  parceiros pagos e por ampliar a superfície de risco (credenciais bancárias
  de terceiros). Ver [ADR 0003](../adr/0003-registro-manual-sem-open-finance.md).
- **Autenticação multiusuário via servidor** — o app é de uso pessoal/único
  usuário por instância; o PIN é apenas uma trava de interface. Ver
  [ADR 0004](../adr/0004-pin-local-sem-autenticacao-de-servidor.md).
- **Parcelamento de cartão de crédito / múltiplos cartões** — avaliado e
  proposto como evolução futura (ver `docs/adr/0006-decisoes-futuras.md`),
  não implementado nesta entrega.
- **Envio de e-mail/notificação** — removido para eliminar dependência de
  serviço pago de e-mail transacional.

## 6. Decomposição do sistema

```
src/
├─ app/            → App Router do Next.js: layout raiz e página única (SPA-like)
├─ components/      → Componentes de UI (dashboard, modais de lançamento/categoria,
│                     importador de extrato, análise, configurações, navegação)
├─ services/        → Camada de acesso a dados
│   ├─ storage.ts        → orquestra localStorage (cache/fila offline) + Supabase (sync),
│   │                       expõe estado de sincronização via pub/sub
│   └─ supabaseClient.ts → cliente Supabase configurado a partir de env vars
├─ utils/           → Lógica pura, testável e sem efeitos colaterais
│   ├─ insights.ts       → cálculos financeiros (tendência, projeção, taxa de poupança,
│   │                       saldo acumulado)
│   ├─ csvXlsxParser.ts  → parsing/normalização de extratos importados
│   ├─ pin.ts            → hash/verificação de PIN (Web Crypto SHA-256)
│   ├─ formatters.ts     → formatação monetária/data em pt-BR
│   └─ categoryIcons.ts  → mapeamento de ícones por categoria
└─ types/           → Tipos compartilhados (Transaction, Category, UserPreferences)
```

A separação entre `utils/` (lógica pura) e `components/`/`services/`
(efeitos colaterais e UI) é deliberada: é o que torna possível testar toda a
lógica de cálculo financeiro sem precisar de mocks de rede, banco de dados
ou DOM — ver [ADR 0005](../adr/0005-logica-pura-separada-para-testabilidade.md).

## 7. Modelo de dados

```sql
categories(id, name, icon, color, monthly_limit, keywords[], created_at)
transactions(id, description, amount, type ∈ {INCOME, EXPENSE, INVESTMENT},
             category_id → categories.id, date, created_at)
user_preferences(id='default', user_name, base_salary, hide_values, pin_hash, updated_at)
```

Ver `supabase_schema.sql` (raiz do repositório) para a definição completa,
incluindo a política de RLS e a justificativa documentada em comentário para
o modelo de acesso adotado.

## 8. Histórico de refinamento da especificação

| Versão | Mudança | Motivo |
|--------|---------|--------|
| v1 | Escopo inicial incluía integração bancária automática (Open Finance) e envio de e-mail | Ambos dependiam de serviços pagos, incompatível com o requisito de custo zero |
| v2 | Escopo reduzido a lançamento manual + importação de extrato assistida (CSV/Excel, com revisão humana antes de confirmar) | Mantém a conveniência de não digitar tudo à mão sem reintroduzir dependência de API paga nem risco de lançamento incorreto sem revisão |
| v2.1 | RF07/RF08 (comparação com meses anteriores e projeção de fechamento) reespecificados após dois bugs de cálculo encontrados em revisão: comparação incluía meses futuros, e projeção de mês fechado inflava o valor como se o mês ainda estivesse em andamento | A especificação original não deixava explícito que a projeção só faz sentido para o mês corrente — comportamento corrigido e coberto por teste de regressão |
| v3 (esta versão) | Adição formal de RNF06 (cobertura de teste) e desta seção de decomposição/histórico | Exigência da disciplina de Especificação Dirigida por Testes (SDD) da entrega acadêmica |

## 9. Critérios de aceitação (resumo)

- Um lançamento criado em um dispositivo aparece em outro dispositivo
  autenticado com o mesmo PIN, após sincronização (RF11).
- Com a rede desligada, um novo lançamento continua sendo salvo e aparece
  na lista imediatamente; ao reconectar, ele é enviado ao Supabase sem
  duplicar (RF12).
- Um extrato importado com uma linha idêntica (mesma data, valor e
  descrição) a um lançamento já existente é sinalizado como possível
  duplicata antes da confirmação (RF06).
- A projeção de fechamento de mês só é exibida para o mês corrente; meses
  passados mostram o total real, não uma extrapolação (RF08).
- Toda a lógica em `src/utils/` tem teste automatizado cobrindo pelo menos
  um caso de borda relevante (RNF06) — ver `docs/test-evidence/`.
