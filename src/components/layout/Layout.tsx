import { Outlet } from 'react-router'
import { Plus } from 'lucide-react'
import { Toaster } from '@/components/ui/sonner'
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

export function Layout() {
  return (
    <AcoesRapidasProvider>
      <BarraLateral />
      <main className="mx-auto w-full max-w-[1280px] px-4 pt-[calc(env(safe-area-inset-top)+20px)] pb-[calc(env(safe-area-inset-bottom)+150px)] md:pl-[calc(76px+44px)] md:pr-11 md:pt-6 md:pb-12">
        <Outlet />
      </main>
      <BotaoMais />
      <BarraInferior />
      <Toaster />
    </AcoesRapidasProvider>
  )
}
