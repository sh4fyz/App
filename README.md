# Minha Agenda

App pessoal da Madu (PWA instalável + site no computador) para estudos, trabalho, estágio, finanças e arquivos. O briefing completo está em `CLAUDE.md`.

## Rodar no computador

```bash
npm install
cp .env.example .env.local   # e preencha com as chaves do Supabase
npm run dev                  # abre em http://localhost:5173
npm run build                # gera a versão final em dist/
```

## Configurar o Supabase (uma vez só)

Os nomes dos menus do Supabase mudam de vez em quando; se algum estiver diferente, procure pelo nome parecido.

1. Entre em https://supabase.com, clique em **Start your project** e faça login com o GitHub.
2. Clique em **New project**. Nome: `minha-agenda`. Crie uma senha do banco e guarde num lugar seguro. Região: **South America (São Paulo)**. Clique em **Create new project** e espere uns 2 minutos.
3. No menu da esquerda, abra **SQL Editor → New query**. Cole todo o conteúdo do arquivo `supabase/migrations/0001_esquema_inicial.sql` e clique em **Run**. Deve aparecer "Success. No rows returned".
4. Abra **Authentication → URL Configuration**:
   - **Site URL**: o endereço da Vercel (ex.: `https://minha-agenda.vercel.app`).
   - **Redirect URLs**: adicione `https://minha-agenda.vercel.app/**` e `http://localhost:5173/**`.
5. Abra **Project Settings → API** e copie a **Project URL** e a chave **anon public**.
6. Na Vercel, no projeto, vá em **Settings → Environment Variables** e cadastre:
   - `VITE_SUPABASE_URL` = a Project URL
   - `VITE_SUPABASE_ANON_KEY` = a chave anon public

   Depois vá em **Deployments**, clique nos três pontinhos da versão mais recente e em **Redeploy**.
7. Abra o app, toque em **Ainda não tenho conta**, crie a sua conta e confirme pelo link que chega no e-mail.
8. **Feche novos cadastros:** no Supabase, abra **Authentication → Sign In / Providers** (ou **Settings**) e desligue **Allow new users to sign up**. Salve. Assim só a sua conta existe.

A chave anon é pública por natureza (vai junto com o site). Quem protege os dados é o Row Level Security, ligado em todas as tabelas pelo arquivo SQL. Nunca coloque a chave `service_role` no app nem no repositório.

## Colocar no ar (Vercel)

1. Entre em https://vercel.com e faça login com a conta do GitHub.
2. Clique em **Add New… → Project** e importe o repositório `sh4fyz/App`. Se ele não aparecer, clique em **Adjust GitHub App Permissions** e libere o repositório.
3. A Vercel reconhece o Vite sozinha (as configurações estão em `vercel.json`). Clique em **Deploy**.
4. Em 1 ou 2 minutos sai um endereço do tipo `https://app-xxxx.vercel.app`.

A Vercel publica o branch padrão do repositório (normalmente o `main`) como versão oficial. Os outros branches viram versões de prévia com endereço próprio. Sem as variáveis do Supabase, o app abre numa tela avisando que falta conectar o banco.

## Instalar no celular

- **Android (Chrome):** abra o endereço, toque no menu ⋮ e em **Instalar app** (ou **Adicionar à tela inicial**).
- **iPhone (Safari):** abra o endereço, toque em **Compartilhar** e em **Adicionar à Tela de Início**.

Depois do primeiro acesso, o app abre mesmo sem internet: dá para ver tudo o que já foi carregado, mas editar só com conexão.

## Onde mexer

- `src/config/modulos.ts`: lista de módulos que alimenta a barra lateral, a barra inferior e a tela Mais.
- `src/data/dados.tsx`: leitura e gravação no Supabase, com cópia local para abrir offline.
- `src/components/layout/AcoesRapidas.tsx` e `src/components/formularios/`: o que o botão + cria e os formulários de edição.
- `supabase/migrations/`: estrutura do banco.
- `src/components/ui/`: componentes no padrão shadcn/ui. `src/components/comum/`: Checklist, ItemLembrete, SeloData e GavetaRapida.
- Ícone do app: edite `public/icone.svg` e rode `npm run icons` (precisa do Playwright instalado).
