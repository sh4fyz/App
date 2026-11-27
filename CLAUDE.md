# App de Rotina da Madu — briefing do projeto

App pessoal (PWA instalável no celular + site no computador) para organizar estudos, trabalho, estágio, finanças e arquivos. Interface toda em **português do Brasil**, tom informal e direto.

Repositório: `sh4fyz/App`

---

## 1. Stack técnica

- **Vite + React + TypeScript**
- **Tailwind CSS** + componentes no estilo **shadcn/ui** (instalar o shadcn de verdade)
- **lucide-react** para ícones (traço fino, `strokeWidth={1.75}`)
- **React Router** para as páginas
- **PWA** com `vite-plugin-pwa`: manifest, ícone, funciona offline e "Adicionar à tela inicial"
- **Supabase**: login (e-mail + senha ou link mágico) e banco de dados, sincronizando celular e computador. Ligar Row Level Security em todas as tabelas: cada pessoa só vê os próprios dados.
- **Deploy na Vercel**, com as chaves do Supabase em variáveis de ambiente (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). Nunca commitar chaves.

## 2. Identidade visual

- **Tema claro e minimalista.** Sem gradientes, sem sombras pesadas, sem emoji e sem cara genérica de IA.
- **Cores:**
  - fundo `#FAFAFA`, cards `#FFFFFF`, borda `#E4E4E7`
  - texto `#18181B`, texto secundário `#71717A`
  - **roxo principal** `#6D28D9` (hover `#5B21B6`)
  - **lilás** de apoio `#F5F3FF` / `#EDE9FE` (lembretes, item ativo)
  - **verde suave** só para "pago" e "concluído": `#16A34A` / `#ECFDF3`
- **Fonte:** Inter (400, 500, 600)
- **Formas:** cards com `rounded-2xl` e borda de 1px, botões e inputs com `rounded-xl`, altura mínima de 44px em tudo que é clicável
- **Densidade:** equilibrada. Títulos de card em 15px semibold, texto em 14px, legendas em 12px.
- **Acessibilidade:** `<button>` e `<label>` de verdade, `aria-label` nos botões só com ícone e contraste mínimo de 4.5:1

## 3. Layout fixo

- **Computador (≥ 768px):** barra lateral esquerda com 76px de largura, com logo "M" e os ícones Início, Trabalho, Estudos, Financeiro, Estágio, Arquivos e Mais. No topo de toda tela fica a barra de pesquisa/comando rápido (atalho Ctrl K).
- **Celular (< 768px):** a barra lateral vira barra inferior com Início, Trabalho, Estudos, Finanças, Estágio e Mais. Arquivos, Hábitos e Ideias ficam dentro do Mais. O botão flutuante roxo "+" fica acima da barra.
- **Barra de pesquisa = captura rápida:** digitar e apertar Enter salva o texto como ideia na caixa de entrada (página Ideias) e mostra um aviso "Ideia salva". Ela também busca tarefas, matérias e arquivos.
- **Item "Mais":** leva a Arquivos, Hábitos e bem-estar, Ideias e notas, Configurações e um espaço pra módulos futuros. A navegação precisa ser fácil de estender, com uma lista de módulos num único arquivo de config.

## 4. Padrão de interação (misto)

- **Ações rápidas** abrem uma gaveta que sobe de baixo no celular e um modal no computador. Exemplos: adicionar tarefa, adicionar lembrete, marcar como pago, nova nota.
- **Áreas grandes** abrem uma página própria com botão de voltar. Exemplos: uma matéria específica, a rotina do trabalho, uma aba do financeiro.
- Marcar tarefas e checklists funciona direto no card, sem abrir nada.

## 5. Telas

### 5.1 Início (já prototipada, seguir fielmente)
- Cabeçalho com a data ("Quarta, 25 de novembro"), "Boa tarde, Madu" que muda conforme o horário, e o sino de notificações.
- **Sua semana:** faixa com os 7 dias (SEG–DOM). Tocar num dia mostra a agenda daquele dia. No computador aparece o calendário do mês.
- **Agenda do dia:** horário + barrinha colorida + título + detalhe. Roxo é aula, verde é estudo ou estágio, cinza é trabalho.
- **Principais de hoje:** checklist com contador "X de Y" e barra de progresso.
- **Lembretes:** itens em fundo lilás com ícone de sino e quando ("sex", "amanhã").
- **Próximos dias:** prazos com selo de data (DEZ 02) e "faltam N dias".
- **Computador:** calendário e lembretes em cima, agenda e principais embaixo, próximos prazos e resumo da semana no rodapé.

### 5.2 Trabalho
- **Rotina do dia a dia:** card que abre uma página própria com a checklist diária e os horários.
- **Lembretes** do trabalho.
- **Projetos em aberto e tarefas:** lista com status.
- **Conferência de pagamentos:** checklist diária de repasses iFood, Amazon e Shopee (conferido/pendente, valor e observação).
- **Notas rápidas:** anotações de reunião, recados e pendências soltas.
- **Resumo da semana:** tarefas concluídas e o que fica pra próxima semana.

### 5.3 Estudos / Provas
- Seletor de **matéria**: tocar numa matéria abre a página dela.
- **Próximas provas**, com contagem regressiva.
- **Aulas para revisar** antes de cada prova (checklist por matéria).
- **Material didático:** links de PDFs, slides e pastas do Google Drive por matéria.

### 5.4 Financeiro
- **Resumo do mês** no topo: entrou, saiu e quanto sobra.
- **Abas** embaixo:
  - **Despesas:** despesas em aberto com valor, vencimento e botão "marcar como pago"; **contas fixas e assinaturas** com lembrete de vencimento; **gastos por categoria** num gráfico simples.
  - **Planejamento:** orçamento do mês por categoria.
  - **Renda extra:** registro de vendas e freelas (ex: docinhos) e total do mês.
  - **Metas:** caixinhas de economia com barra de progresso.

### 5.5 Estágio
- Agenda do estágio, anotações de atendimento e espaço pro relatório.
- Começar simples: lista de registros por data com texto livre.

### 5.6 Arquivos
- Atalhos para pastas do Google Drive, PDFs e links, organizados por área (Faculdade por semestre e matéria, Trabalho, Estágio).
- Nesta versão são só links salvos. Não precisa fazer upload.

### 5.7 Mais → Hábitos e bem-estar, Ideias e notas
- **Hábitos:** checklist diária simples (ex: água, pausas, sono), com sequência de dias.
- **Ideias:** caixa de entrada com tudo capturado pela barra de pesquisa, com opção de transformar uma ideia em tarefa, lembrete ou nota.

## 6. Dados (Supabase) — sugestão inicial

Tabelas, todas com `user_id` e RLS ligada:
- `events`: agenda (título, detalhe, início, fim, área)
- `tasks`: título, área, data, concluída
- `reminders`: título, quando, área, feito
- `subjects`, `exams`, `review_items`, `materials`: estudos
- `payment_checks`: conferência de pagamentos (plataforma, data, valor, status, obs)
- `notes`: notas rápidas e ideias, com um campo `tipo`
- `expenses`, `fixed_bills`, `extra_income`, `goals`: financeiro
- `internship_logs`: estágio
- `links`: arquivos e atalhos
- `habits`, `habit_checks`: hábitos

## 7. Ordem de construção

1. Setup do projeto (Vite, Tailwind, shadcn, lucide, router, PWA), layout fixo responsivo e navegação. Deploy na Vercel desde o começo.
2. Tela **Início** com dados de exemplo, idêntica ao protótipo.
3. Login + Supabase. Trocar os dados de exemplo pelos reais.
4. **Trabalho** → **Estudos** → **Financeiro**.
5. **Estágio**, **Arquivos**, **Hábitos**, **Ideias**.
6. Polimento: estados vazios, carregamento, modo offline, ícone do app.

## 8. Regras de trabalho

- Fazer uma etapa por vez e me mostrar o resultado antes de seguir pra próxima.
- Commits pequenos com mensagens em português.
- Componentes reutilizáveis (Card, Checklist, ItemLembrete, SeloData, GavetaRapida).
- Sempre funcionar bem na largura de celular (390px).
- Textos da interface em português, informais e curtos.

## 9. Estilo das respostas

- Respostas curtas e diretas, sem repetir o que eu pedi.
- Não explicar o código linha por linha; só o que mudou e por quê.
- Ler só os arquivos necessários para a tarefa.
