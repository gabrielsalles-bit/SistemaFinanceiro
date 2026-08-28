# Sistema de Gestão Financeira Pessoal

Aplicação web para controle financeiro pessoal manual — registro de receitas,
despesas e investimentos organizados por categorias ("nichos") com limite
mensal, histórico completo e análises baseadas em dados reais.

## Funcionalidades

- Registro manual de lançamentos (receita, despesa, investimento)
- Categorias personalizáveis com limite mensal e indicador de progresso
- Importação de extrato bancário via arquivo CSV ou Excel, com revisão antes
  de confirmar e detecção de possíveis duplicatas
- Análise financeira: comparação com meses anteriores, projeção de
  fechamento do mês corrente, taxa de poupança e evolução do saldo
  acumulado ao longo do tempo
- Sincronização entre dispositivos via Supabase, com funcionamento offline
  (dados salvos localmente e sincronizados quando a conexão retorna)
- Acesso protegido por PIN (hash local, sem senha em texto puro)
- Instalável como aplicativo (PWA) em celular ou desktop

## Stack técnica

- [Next.js 14](https://nextjs.org/) (App Router) + React 18 + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) para estilização
- [Supabase](https://supabase.com/) (PostgreSQL) para persistência e sincronização
- `papaparse` e `xlsx` para importação de extratos
- Testes com o test runner nativo do Node.js (`node --test`)

## Como rodar localmente

```bash
npm install
```

Copie `.env.local.example` para `.env.local` e preencha com as credenciais
do seu próprio projeto Supabase (URL e chave anônima/publicável, disponíveis
em Project Settings → API no painel do Supabase). Em seguida, rode o script
`supabase_schema.sql` no SQL Editor do seu projeto para criar as tabelas.

```bash
npm run dev
```

## Scripts disponíveis

- `npm run dev` — ambiente de desenvolvimento
- `npm run build` — build de produção
- `npm run test` — roda os testes unitários
