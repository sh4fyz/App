import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

export type ItemChecklist = { id: string; titulo: string; feito: boolean }

type Props = {
  itens: ItemChecklist[]
  aoAlternar: (id: string) => void
  className?: string
}

/** Lista marcável direto no card, sem abrir nada. */
export function Checklist({ itens, aoAlternar, className }: Props) {
  return (
    <ul className={cn('flex flex-col', className)}>
      {itens.map((item) => (
        <li key={item.id}>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl py-1.5">
            <Checkbox checked={item.feito} onCheckedChange={() => aoAlternar(item.id)} />
            <span className={cn('text-sm leading-snug', item.feito && 'text-muted-foreground line-through')}>
              {item.titulo}
            </span>
          </label>
        </li>
      ))}
    </ul>
  )
}
