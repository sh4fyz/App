import type { Compromisso } from '@/data/agenda'
import type { Area } from '@/data/tipos'
import { cn } from '@/lib/utils'

const cor: Record<Area, string> = {
  aula: 'bg-aula',
  estudo: 'bg-estudo',
  estagio: 'bg-estudo',
  trabalho: 'bg-trabalho',
  outro: 'bg-zinc-300',
}

export function AgendaDia({ itens, aoAbrir, vazio }: { itens: Compromisso[]; aoAbrir?: (c: Compromisso) => void; vazio?: React.ReactNode }) {
  if (!itens.length) return <>{vazio ?? <p className="py-3 text-sm text-muted-foreground">Nada marcado nesse dia.</p>}</>
  return (
    <ol className="-mx-2 flex flex-col">
      {itens.map((c) => (
        <li key={c.id}>
          <button
            type="button"
            onClick={() => aoAbrir?.(c)}
            className="flex min-h-11 w-full gap-3 rounded-xl px-2 py-1.5 text-left hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none"
          >
            <time className="w-11 shrink-0 pt-px text-xs tabular-nums text-muted-foreground">{c.hora}</time>
            <span className={cn('w-[3px] shrink-0 self-stretch rounded-full', cor[c.area])} aria-hidden />
            <span className="min-w-0">
              <span className="block text-sm font-medium leading-snug">{c.titulo}</span>
              {c.detalhe && <span className="mt-0.5 block text-xs text-muted-foreground">{c.detalhe}</span>}
            </span>
          </button>
        </li>
      ))}
    </ol>
  )
}
