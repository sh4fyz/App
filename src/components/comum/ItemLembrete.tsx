import { Bell } from 'lucide-react'
import { quandoCurto } from '@/lib/datas'
import { cn } from '@/lib/utils'

type Props = { titulo: string; quando: string; aoAbrir?: () => void; className?: string }

export function ItemLembrete({ titulo, quando, aoAbrir, className }: Props) {
  const classe = cn('flex min-h-11 w-full items-center gap-3 rounded-xl bg-lilac px-4 py-3 text-left', className)
  const conteudo = (
    <>
      <Bell className="size-[18px] shrink-0 text-primary" strokeWidth={1.75} aria-hidden />
      <span className="min-w-0 flex-1 text-sm leading-snug">{titulo}</span>
      <span className="shrink-0 text-xs text-muted-foreground">{quandoCurto(quando)}</span>
    </>
  )
  if (!aoAbrir) return <div className={classe}>{conteudo}</div>
  return (
    <button type="button" onClick={aoAbrir} className={cn(classe, 'transition-colors hover:bg-lilac-strong focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none')}>
      {conteudo}
    </button>
  )
}
