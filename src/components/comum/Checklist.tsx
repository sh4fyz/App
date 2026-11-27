import { Pencil } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

export type ItemChecklist = { id: string; titulo: string; feito: boolean; /** horário ou outra informação curta, à esquerda */ detalhe?: string }

type Props = {
  itens: ItemChecklist[]
  aoAlternar: (id: string) => void
  /** mostra um botão de editar em cada item */
  aoEditar?: (id: string) => void
  className?: string
}

/** Lista marcável direto no card, sem abrir nada. */
export function Checklist({ itens, aoAlternar, aoEditar, className }: Props) {
  return (
    <ul className={cn('flex flex-col', className)}>
      {itens.map((item) => (
        <li key={item.id} className="group flex items-center gap-1">
          <label className="flex min-h-11 min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-xl py-1.5">
            <Checkbox checked={item.feito} onCheckedChange={() => aoAlternar(item.id)} />
            {item.detalhe && <span className="w-10 shrink-0 text-xs tabular-nums text-muted-foreground">{item.detalhe}</span>}
            <span className={cn('text-sm leading-snug', item.feito && 'text-muted-foreground line-through')}>{item.titulo}</span>
          </label>
          {aoEditar && (
            <button
              type="button"
              onClick={() => aoEditar(item.id)}
              aria-label={`Editar ${item.titulo}`}
              className="grid size-11 shrink-0 place-items-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
            >
              <Pencil className="size-4" strokeWidth={1.75} aria-hidden />
            </button>
          )}
        </li>
      ))}
    </ul>
  )
}
