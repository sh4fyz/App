import { deIso, MESES_CURTOS } from '@/lib/datas'
import { cn } from '@/lib/utils'

/** Selo "DEZ / 02" */
export function SeloData({ data, className }: { data: string; className?: string }) {
  const d = deIso(data)
  return (
    <div
      className={cn('flex size-12 shrink-0 flex-col items-center justify-center rounded-xl border bg-card leading-none', className)}
      aria-label={`${d.getDate()} de ${MESES_CURTOS[d.getMonth()]}`}
    >
      <span className="text-[10px] font-medium uppercase text-muted-foreground">{MESES_CURTOS[d.getMonth()]}</span>
      <span className="mt-1 text-base font-semibold">{String(d.getDate()).padStart(2, '0')}</span>
    </div>
  )
}
