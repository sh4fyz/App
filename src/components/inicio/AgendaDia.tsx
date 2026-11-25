import type { Compromisso, TipoCompromisso } from '@/data/exemplo'
import { cn } from '@/lib/utils'

const cor: Record<TipoCompromisso, string> = {
  aula: 'bg-aula',
  estudo: 'bg-estudo',
  estagio: 'bg-estudo',
  trabalho: 'bg-trabalho',
}

export function AgendaDia({ itens }: { itens: Compromisso[] }) {
  if (!itens.length) {
    return <p className="py-3 text-sm text-muted-foreground">Nada marcado nesse dia.</p>
  }
  return (
    <ol className="flex flex-col gap-3">
      {itens.map((c) => (
        <li key={c.id} className="flex gap-3">
          <time className="w-11 shrink-0 pt-px text-xs tabular-nums text-muted-foreground">{c.hora}</time>
          <span className={cn('w-[3px] shrink-0 self-stretch rounded-full', cor[c.tipo])} aria-hidden />
          <div className="min-w-0">
            <p className="text-sm font-medium leading-snug">{c.titulo}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{c.detalhe}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}
