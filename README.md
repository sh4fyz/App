# Minha Agenda

PWA pessoal com turnos de trabalho, tarefas e provas por matéria e atalhos para pastas do Google Drive. Funciona offline e pode ser instalado no celular.

## Publicar no GitHub Pages

1. No GitHub, abra o repositório e vá em **Settings → Pages**.
2. Em **Build and deployment**, escolha **Deploy from a branch**.
3. Selecione o branch onde estão estes arquivos (por exemplo `main`) e a pasta `/ (root)`. Salve.
4. Em alguns minutos o endereço aparece no topo da página, no formato `https://<usuario>.github.io/<repositorio>/`.

## Instalar no celular

- **Android (Chrome):** abra o endereço, toque no menu ⋮ e em **Instalar app**.
- **iPhone (Safari):** abra o endereço, toque em **Compartilhar** e em **Adicionar à Tela de Início**. As notificações só funcionam depois de instalar.

## Dados

Tudo fica salvo no próprio aparelho. Em **Configurações → Backup** dá para exportar um arquivo e importar em outro aparelho. A sincronização com uma pasta oculta do Google Drive está prevista para uma próxima etapa.

## Atualizar o app

Ao mudar qualquer arquivo, aumente `VERSION` em `sw.js` para que os celulares baixem a versão nova.
