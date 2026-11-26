import { Outlet } from 'react-router'
import { Plus, WifiOff } from 'lucide-react'
import { useDados } from '@/data/dados'
import { BarraLateral } from './BarraLateral'
import { BarraInferior } from './BarraInferior'
import { AcoesRapidasProvider, useAcoesRapidas } from './AcoesRapidas'

function BotaoMais() {
  const abrir = useAcoesRapidas()
  return (
    <button
      type="button"
      onClick={() => abrir()}
      aria-label="Adicionar tarefa, lembrete ou nota"
      className="fixed right-4 bottom-[calc(env(safe-area-inset-bottom)+72px)] z-30 grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none md:hidden"
    >
      <Plus className="size-6" strokeWidth={1.75} aria-hidden />
    </button>
  )
}

function AvisoOffline() {
  const { online } = useDados()
  if (online) return null
  return (
    <div role="status" className="mb-4 flex min-h-11 items-center gap-2.5 rounded-xl bg-muted px-4 py-2.5 text-[13px] text-muted-foreground">
      <WifiOff className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
      Sem internet. Dá pra ver tudo, mas editar só com conexão.
    </div>
  )
}

export function Layout() {
  return (
    <AcoesRapidasProvider>
      <BarraLateral />
      <main className="mx-auto w-full max-w-[1280px] px-4 pt-[calc(env(safe-area-inset-top)+20px)] pb-[calc(env(safe-area-inset-bottom)+150px)] md:pl-[calc(76px+44px)] md:pr-11 md:pt-6 md:pb-12">
        <AvisoOffline />
        <Outlet />
      </main>
      <BotaoMais />
      <BarraInferior />
    </AcoesRapidasProvider>
  )
}
