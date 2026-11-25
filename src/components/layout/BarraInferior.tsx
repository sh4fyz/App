import { NavLink } from 'react-router'
import { modulos, moduloMais } from '@/config/modulos'
import { cn } from '@/lib/utils'

/** Celular: barra inferior com os módulos principais + Mais */
export function BarraInferior() {
  const itens = [...modulos.filter((m) => m.inferior), moduloMais]
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-30 border-t bg-card pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-6">
        {itens.map((m) => {
          const Icone = m.icone
          return (
            <li key={m.id}>
              <NavLink
                to={m.caminho}
                end={m.caminho === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium text-zinc-500 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring/40',
                    isActive && 'text-primary'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={cn('grid h-7 w-11 place-items-center rounded-full', isActive && 'bg-lilac-strong')}>
                      <Icone className="size-5" strokeWidth={1.75} aria-hidden />
                    </span>
                    {m.tituloCurto ?? m.titulo}
                  </>
                )}
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
