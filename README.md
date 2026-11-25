# Minha Agenda

App pessoal da Madu (PWA instalável + site no computador) para estudos, trabalho, estágio, finanças e arquivos. O briefing completo está em `CLAUDE.md`.

## Rodar no computador

```bash
npm install
npm run dev      # abre em http://localhost:5173
npm run build    # gera a versão final em dist/
```

## Colocar no ar (Vercel)

1. Entre em https://vercel.com e faça login com a conta do GitHub.
2. Clique em **Add New… → Project** e importe o repositório `sh4fyz/App`. Se ele não aparecer, clique em **Adjust GitHub App Permissions** e libere o repositório.
3. A Vercel reconhece o Vite sozinha (as configurações estão em `vercel.json`). Clique em **Deploy**.
4. Em 1 ou 2 minutos sai um endereço do tipo `https://app-xxxx.vercel.app`.

A Vercel publica o branch padrão do repositório (normalmente o `main`) como versão oficial. Os outros branches viram versões de prévia com endereço próprio. A partir da etapa 3, cadastre `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` em **Settings → Environment Variables** (modelo em `.env.example`).

## Instalar no celular

- **Android (Chrome):** abra o endereço, toque no menu ⋮ e em **Instalar app** (ou **Adicionar à tela inicial**).
- **iPhone (Safari):** abra o endereço, toque em **Compartilhar** e em **Adicionar à Tela de Início**.

Depois do primeiro acesso, o app abre mesmo sem internet.

## Onde mexer

- `src/config/modulos.ts`: lista de módulos que alimenta a barra lateral, a barra inferior e a tela Mais.
- `src/data/exemplo.ts`: dados de exemplo da etapa 2 (os horários de aula e estágio são provisórios).
- `src/components/ui/`: componentes no padrão shadcn/ui. `src/components/comum/`: Checklist, ItemLembrete, SeloData e GavetaRapida.
- Ícone do app: edite `public/icone.svg` e rode `npm run icons` (precisa do Playwright instalado).
