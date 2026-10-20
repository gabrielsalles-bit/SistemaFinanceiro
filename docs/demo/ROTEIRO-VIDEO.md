# Roteiro do vídeo de demonstração (3 a 5 minutos)

Gravar com o terminal e o navegador visíveis, falando em português. Tempo alvo:
**4 min 30 s**. Antes de gravar, abra o app em janela anônima para começar sem
dados.

## Preparação (fora do vídeo)
1. `docker compose up --build` e confira http://localhost:3000.
2. Tenha à mão um CSV de exemplo no formato Nubank (colunas `Data`, `Valor`,
   `Descrição`) com 5 a 8 linhas, uma delas igual a um lançamento que você vai
   criar manualmente (para mostrar a duplicata). Use dados fictícios.
3. Terminal aberto na pasta do projeto.

## Roteiro

| Tempo | Tela | Fala sugerida |
|---|---|---|
| 0:00 a 0:25 | README | Apresentar o grupo e o problema: controle financeiro pessoal manual, sem custo, que funciona offline e sincroniza entre dispositivos. |
| 0:25 a 0:45 | Tela do PIN | Primeiro acesso: criar um PIN. Explicar que só o hash fica salvo. |
| 0:45 a 1:30 | Painel | Mostrar as categorias com limite mensal e o indicador de saúde financeira. Criar uma despesa e ver a barra e o semáforo mudarem. |
| 1:30 a 2:30 | Importação | Importar o CSV. Mostrar a tela de revisão, a categorização automática e a linha marcada como **possível duplicata**. Confirmar. |
| 2:30 a 3:15 | Análise | Mostrar tendência contra meses anteriores, projeção de fechamento do mês, taxa de poupança e saldo acumulado. |
| 3:15 a 3:45 | Offline | Desligar a rede (DevTools → Network → Offline), criar um lançamento e mostrar que ele é salvo; religar e mostrar o indicador de sincronização. |
| 3:45 a 4:30 | Terminal | Rodar `docker compose run --rm test` (ou `npm run test:coverage`) **ao vivo**: os 30 testes passando e a tabela de cobertura. |
| 4:30 a 5:00 | GitHub | Mostrar a release v1.0.0, o CI verde e a `main` protegida. Fechar com uma frase sobre o aprendizado do fluxo SDD com IA. |

## Checklist antes de enviar
- [ ] Duração entre 3 e 5 minutos.
- [ ] Os testes aparecem rodando em tempo real, sem corte.
- [ ] Nenhum dado pessoal ou chave real aparece na tela.
- [ ] Vídeo publicado (YouTube não listado, Drive ou Loom), com o link acessível a quem tem o link.
