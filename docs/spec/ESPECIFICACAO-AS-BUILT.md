# Especificação Técnica Definitiva (As-Built) — v1.0.0

Descreve o sistema **exatamente como foi entregue** na release `v1.0.0`.
Onde a implementação diverge da especificação de requisitos
([`ESPECIFICACAO.md`](ESPECIFICACAO.md)), a divergência está registrada na
seção 9. Esta é a referência para quem for manter o sistema.

## 1. Escopo e identificação

| Item | Valor |
|---|---|
| Sistema | Gestão Financeira Pessoal (web, PWA, offline-first) |
| Versão | 1.0.0 (`package.json`) |
| Repositório | https://github.com/gabrielsalles-bit/SistemaFinanceiro |
| Runtime de teste/CI/Docker | Node.js 22 |
| Framework | Next.js 15.5.x (App Router), React 19, TypeScript estrito |
| Persistência | `localStorage` (sempre) + Supabase/PostgreSQL (quando configurado) |
| API própria | **Nenhuma.** Não há rotas `app/api`, Server Actions nem middleware |

O sistema é uma aplicação de página única (`src/app/page.tsx`) pré-renderizada
estaticamente; toda a lógica roda no navegador. A única comunicação externa é
o cliente `@supabase/supabase-js` falando com a API REST do Supabase.

## 2. Arquitetura e componentes entregues

```
src/
├── app/            layout.tsx (metadados, PWA, registro do service worker)
│                   page.tsx   (estado global, orquestra todas as telas)
├── components/     telas e modais React (12 componentes + 3 em ui/)
├── services/       storage.ts (StorageService), supabaseClient.ts
├── types/          finance.ts (contratos de dados)
└── utils/          funções puras testadas (ver seção 4)
public/             manifest.json, sw.js (cache offline), ícones PWA
supabase_schema.sql modelo de dados do banco
```

| Camada | Arquivo(s) | Responsabilidade |
|---|---|---|
| Estado/orquestração | `app/page.tsx` | Mantém categorias, lançamentos e preferências; alterna abas; dispara a sincronização |
| Trava | `AppSecurityLock.tsx` | Cria/valida o PIN (hash local) antes de exibir o app |
| Painel | `MainBudgetCard`, `CategoryNicheGrid` | Orçamento do mês, saúde financeira, progresso por categoria |
| Lançamentos | `TransactionModal`, `TransactionList`, `FullExtractView` | Criar/editar/excluir e listar com busca e filtro por categoria |
| Categorias | `CategoryModal` | Criar/editar/excluir categorias com limite mensal e palavras-chave |
| Importação | `CSVImporterModal` | Revisão linha a linha antes de confirmar; sinaliza duplicatas |
| Análise | `AnalysisView` | Tendência, projeção, taxa de poupança e saldo acumulado |
| Ajustes | `SettingsView` | Nome, salário base, troca de PIN e limpeza de todos os dados (o botão de ocultar valores fica em `Navigation`) |
| Infra de UI | `Navigation`, `ErrorBoundary`, `ui/Card`, `ui/EmptyState`, `ui/DashboardSkeleton` | Navegação, tratamento de erro, esqueleto de carregamento |

## 3. Contratos de dados (`src/types/finance.ts`)

```ts
type TransactionType = 'INCOME' | 'EXPENSE' | 'INVESTMENT';

interface Category   { id: string; name: string; icon: string; color?: string;
                       monthlyLimit: number; keywords?: string[]; }
interface Transaction{ id: string; description: string; amount: number;
                       type: TransactionType; categoryId: string;
                       date: string /* YYYY-MM-DD */; createdAt: string; }
interface UserPreferences { userName: string; baseSalary: number;
                            hideValues: boolean; pinHash: string | null; }
interface FinancialHealth { status: 'EXCELLENT'|'WARNING'|'CRITICAL';
                            percentageUsed: number; daysPassedRatio: number;
                            burnRateMessage: string; tip: string; }
```

### 3.1 Banco de dados (`supabase_schema.sql`)

| Tabela | Colunas principais | Observação |
|---|---|---|
| `categories` | `id text PK`, `name`, `icon`, `color`, `monthly_limit numeric(10,2)`, `keywords text[]`, `created_at` | |
| `transactions` | `id text PK`, `description`, `amount numeric(10,2)`, `type` (CHECK em INCOME/EXPENSE/INVESTMENT), `category_id → categories ON DELETE SET NULL`, `date date`, `created_at` | |
| `user_preferences` | `id text PK default 'default'`, `user_name`, `base_salary`, `hide_values`, `pin_hash`, `updated_at` | Linha única |

RLS está habilitado com política permissiva (`using (true)`); ver seção 9.

### 3.2 Armazenamento local

Chaves do `localStorage`: `app_categories_v1`, `app_transactions_v1`,
`app_user_prefs_v1`. O mapeamento camelCase ↔ snake_case é feito dentro de
`storage.ts` (`categoryToRow`, `transactionToRow` e inversos).

## 4. Contratos das funções puras (`src/utils/`)

Todas sem efeitos colaterais, exceto `parseCSVFile`/`parseXLSXFile` (leitura de
arquivo).

### `insights.ts`
| Função | Contrato |
|---|---|
| `groupTransactionsByMonth(txs)` | Soma receita, despesa e investimento por mês (0–11) e calcula `balance = income − expense`, ordenado cronologicamente |
| `getCategoryTrend(txs, categoryId, year, month, monthsBack=3)` | Compara a despesa da categoria no mês com a média dos `monthsBack` meses **anteriores que tenham algum dado**. `percentChange = null` e `direction = 'stable'` se não houver nenhum mês anterior com dados. `direction`: `stable` se \|variação\| < 5% |
| `getExpenseTrend(txs, year, month, monthsBack=3)` | Mesma regra, sobre a despesa total |
| `projectMonthEndTotal(totalSoFar, date)` | `projectedTotal = (totalSoFar / diaDoMês) × diasNoMês`. A tela só chama para o mês corrente |
| `getSavingsRateSeries(txs, baseSalary)` | `rate = (renda + salárioBase − despesa − investimento) / (renda + salárioBase)`; 0 se a renda for ≤ 0 |
| `getCumulativeBalanceSeries(txs, baseSalary)` | Saldo acumulado mês a mês com a mesma base |

### `formatters.ts`
| Função | Contrato |
|---|---|
| `formatCurrency(v, hide?)` | BRL com 2 casas (`R$ 1.234,50`); `NaN → R$ 0,00`; `hide → 'R$ ••••••'` |
| `formatDate(iso)` | `YYYY-MM-DD[...]` → `DD/MM/AA`; vazio → `00/00/00`; fora do padrão → devolve a entrada |
| `getMonthName(i)` | Nome do mês em maiúsculas; índice inválido → `MÊS ATUAL` |
| `getSemaphoreColor(pct)` | `< 80` EXCELLENT, `80–99,99` WARNING, `≥ 100` CRITICAL |
| `calculateFinancialHealth(gasto, limite, data)` | Limite ≤ 0 → EXCELLENT com 0%. `pct = min(1000, gasto/limite×100)`. `≥ 100` CRITICAL; `≥ 80` WARNING; `pct > %do mês decorrido + 20` WARNING (ritmo acelerado); senão EXCELLENT |

### `csvXlsxParser.ts`
| Função | Contrato |
|---|---|
| `detectStatementFormat(headers)` | `nubank_ptbr` (coluna Descrição), `nubank_en` (title + amount) ou `generic` |
| `parseStatementDate(raw)` | Aceita `YYYY-MM-DD` e `DD/MM/YYYY`; vazio ou inválido → data de hoje |
| `parseStatementAmount(raw)` | Remove `R$`; entende `1.234,56` e `1234,56`; devolve `{ value ≥ 0, isNegative }` |
| `mapRowsToParsedTransactions(rows, headers, categories)` | Linhas com valor 0 são descartadas. Negativo → EXPENSE, positivo → INCOME (ou pelo campo Tipo no formato genérico). Despesa é categorizada por palavra-chave; sem correspondência cai em `cat-outros` |
| `markPossibleDuplicates(rows, existing)` | Duplicata = mesma `data + valor (2 casas) + descrição normalizada` |
| `parseCSVFile`, `parseXLSXFile` | Leitura via PapaParse e SheetJS; devolvem `{ headers, rows }` |

### `pin.ts`
`hashPin(pin)` → SHA-256 em hexadecimal (64 caracteres), via Web Crypto.
`verifyPin(pin, hash)` → comparação do hash.

## 5. Serviço de persistência (`StorageService`)

| Método | Comportamento |
|---|---|
| `getCategories()`, `getTransactions()`, `getUserPrefs()` | Sem Supabase configurado, ou se a consulta falhar, devolve o cache local (e marca `offline`). Com Supabase, consulta o remoto, atualiza o cache e devolve o remoto; no caso de categorias, se o remoto estiver vazio, grava as categorias de exemplo |
| `saveCategories()`, `saveTransactions()`, `saveUserPrefs()` | Grava no cache local; remoto por `upsert`; ids removidos são apagados com `delete().in('id', ...)` |
| `clearAllData()` | Zera o cache local e, se configurado, apaga as 3 tabelas remotas |
| `onSyncStateChange(cb)` | Notifica `'synced' \| 'syncing' \| 'offline'` |
| `attachOnlineSync(getSnapshot)` | No evento `online` do navegador, reenvia o estado atual ao Supabase |

Sem `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`isSupabaseConfigured()` é falso, o cliente é `null` e o app opera só com
`localStorage`.

## 6. Fluxos principais

1. **Lançamento:** modal → estado em `page.tsx` → `saveTransactions` (local, depois remoto) → indicador de sincronização.
2. **Importação:** arquivo → `parseCSVFile`/`parseXLSXFile` → `mapRowsToParsedTransactions` → `markPossibleDuplicates` → revisão humana → confirmação cria os lançamentos com ids `tx-import-*`.
3. **PIN:** primeiro uso define o PIN (`hashPin` → `pinHash` nas preferências); acessos seguintes comparam com `verifyPin`.
4. **Offline:** escritas continuam no `localStorage`; ao voltar a rede, `attachOnlineSync` reenvia.

## 7. Rastreabilidade requisito → implementação → teste

| Requisito | Implementação | Verificação |
|---|---|---|
| RF01, RF02 | `TransactionModal`, `TransactionList`, `FullExtractView` | Manual (UI) |
| RF03, RF04 | `CategoryModal`, `CategoryNicheGrid`, `getSemaphoreColor` | `getSemaphoreColor switches exactly at…` |
| RF05, RF06 | `CSVImporterModal`, `csvXlsxParser.ts` | 8 testes em `csvXlsxParser.test.ts` |
| RF07 | `getCategoryTrend`, `getExpenseTrend` | 4 testes em `insights.test.ts` |
| RF08 | `projectMonthEndTotal` | 2 testes em `insights.test.ts` |
| RF09, RF10 | `getSavingsRateSeries`, `getCumulativeBalanceSeries` | 2 testes em `insights.test.ts` |
| RF11, RF12 | `StorageService`, `attachOnlineSync` | Manual (rede) |
| RF13 | `AppSecurityLock`, `pin.ts` | 3 testes em `pin.test.ts` |
| RF14 | `manifest.json`, `sw.js` | Manual (instalação) |
| RNF01–RNF04 | Supabase free tier, layout responsivo, `formatCurrency`, cache local | `formatters.test.ts` (RNF03) |
| RNF05 | Hash do PIN | `pin.test.ts` |
| RNF06 | Funções puras testadas | 30 testes, ver seção 8 |

## 8. Verificação

- **Suíte:** 30 testes unitários, 0 falhas (`npm run test`).
- **Cobertura** (`npm run test:coverage`, módulos de `src/utils/`):

| Arquivo | Linhas | Ramos | Funções |
|---|---|---|---|
| `formatters.ts` | 98,56% | 95,12% | 100% |
| `insights.ts` | 97,56% | 85,71% | 100% |
| `pin.ts` | 100% | 100% | 100% |
| `csvXlsxParser.ts` | 79,49% | 70,00% | 82,14% |
| **Total** | **92,37%** | **83,96%** | **94,57%** |

  As linhas não cobertas de `csvXlsxParser.ts` são os leitores de arquivo
  (`parseCSVFile`, `parseXLSXFile`) e ramos de tratamento de erro.
- **Tipos:** `tsc --noEmit` com `noUnusedLocals` e `noUnusedParameters`, sem erros.
- **CI:** a cada push e PR: tipos, testes, cobertura e build de produção.
- **Não coberto por teste automatizado:** componentes React e `StorageService`
  (verificados manualmente). Não há testes de integração nem e2e.

## 9. Divergências da especificação e limitações conhecidas

| # | Item | Situação |
|---|---|---|
| L1 | **PIN é SHA-256 sem sal.** Um PIN numérico curto tem poucos valores possíveis e o hash pode ser quebrado por força bruta por quem obtiver o `pinHash` | Aceito: é trava de interface (ADR 0004), não autenticação |
| L2 | **RLS permissivo** (`using (true)`): quem tiver a chave anônima, que é pública no bundle, acessa todo o banco | Aceito para uso pessoal com URL não divulgada; para uso compartilhado, proteger o deployment (comentário em `supabase_schema.sql`) |
| L3 | **Dependências com avisos no `npm audit`.** Em produção: 0 críticos; restam avisos em `postcss` e `source-map-js` (ferramentas de CSS usadas no build, embutidas no Next) e 1 moderado no `next`, cuja correção exige a linha 16 | Aceito. A atualização do Next 14 para 15.5.28 (com React 19) eliminou os avisos críticos. O app não usa Server Actions, middleware, `next/image`, rewrites, i18n nem rotas de API. A linha 16 fica para a próxima versão |
| L4 | Componentes React e `StorageService` sem teste automatizado; sem e2e | Verificação manual; evolução futura |
| L5 | `parseCSVFile`/`parseXLSXFile` fora da suíte unitária (dependem de `File`) | RNF06 v3.1 |
| L6 | Débito/crédito e múltiplos cartões | Fora de escopo (ADR 0006) |
| L7 | Estado em `localStorage` por navegador; conflito entre dispositivos é resolvido por último a gravar (`upsert`) | Aceito |
| L8 | **O remoto prevalece na carga.** Ao abrir o app com Supabase configurado e online, a leitura sobrescreve o cache local. Lançamentos feitos offline só são reenviados se o evento `online` disparar com a página aberta; se o app for fechado offline e reaberto já online, esses lançamentos podem ser sobrescritos | Aceito nesta release; correção possível com fila de pendências, registrada como evolução |
