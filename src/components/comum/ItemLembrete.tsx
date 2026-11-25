import { Bell } from 'lucide-react'
import { quandoCurto } from '@/lib/datas'
import { cn } from '@/lib/utils'

type Props = { titulo: string; quando: string; className?: string }

export function ItemLembrete({ titulo, quando, className }: Props) {
  return (
    <div className={cn('flex min-h-11 items-center gap-3 rounded-xl bg-lilac px-4 py-3', className)}>
      <Bell className="size-[18px] shrink-0 text-primary" strokeWidth={1.75} aria-hidden />
      <span className="min-w-0 flex-1 text-sm leading-snug">{titulo}</span>
      <span className="shrink-0 text-xs text-muted-foreground">{quandoCurto(quando)}</span>
    </div>
  )
}
