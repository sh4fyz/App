import { NavLink } from 'react-router'
import { modulos, moduloMais, type Modulo } from '@/config/modulos'
import { cn } from '@/lib/utils'

function Item({ modulo }: { modulo: Modulo }) {
  const Icone = modulo.icone
  return (
    <NavLink
      to={modulo.caminho}
      end={modulo.caminho === '/'}
      aria-label={modulo.titulo}
      title={modulo.titulo}
      className={({ isActive }) =>
        cn(
          'grid size-12 place-items-center rounded-xl text-zinc-600 transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none',
          isActive && 'bg-lilac-strong text-primary hover:bg-lilac-strong hover:text-primary'
        )
      }
    >
      <Icone className="size-5" strokeWidth={1.75} aria-hidden />
    </NavLink>
  )
}

/** Computador: barra lateral fixa de 76px */
export function BarraLateral() {
  return (
    <nav aria-label="Navegação principal" className="fixed inset-y-0 left-0 z-30 hidden w-[76px] flex-col items-center gap-2 border-r bg-card py-5 md:flex">
      <NavLink
        to="/"
        aria-label="Minha Agenda, início"
        className="mb-4 grid size-10 place-items-center rounded-xl bg-primary text-[15px] font-semibold text-primary-foreground"
      >
        M
      </NavLink>
      {modulos.filter((m) => m.lateral).map((m) => (
        <Item key={m.id} modulo={m} />
      ))}
      <div className="my-2 h-px w-8 bg-border" aria-hidden />
      <Item modulo={moduloMais} />
    </nav>
  )
}
