import { DIAS_CURTOS, deIso, iso, hoje, segundaDaSemana, somarDias } from '@/lib/datas'
import { cn } from '@/lib/utils'

/** Celular: os 7 dias da semana (SEG–DOM). Tocar num dia mostra a agenda dele. */
export function FaixaSemana({ selecionado, aoSelecionar }: { selecionado: string; aoSelecionar: (d: string) => void }) {
  const inicio = segundaDaSemana(hoje())
  const hojeIso = iso(hoje())
  return (
    <div role="group" aria-label="Dias da semana" className="grid grid-cols-7 gap-1">
      {Array.from({ length: 7 }, (_, i) => {
        const d = somarDias(inicio, i)
        const s = iso(d)
        const ativo = s === selecionado
        return (
          <button
            key={s}
            type="button"
            aria-pressed={ativo}
            aria-label={`${DIAS_CURTOS[d.getDay()]}, dia ${d.getDate()}`}
            onClick={() => aoSelecionar(s)}
            className={cn(
              'flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none',
              ativo ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
            )}
          >
            <span className={cn('text-[11px] font-medium uppercase', ativo ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
              {DIAS_CURTOS[d.getDay()]}
            </span>
            <span className={cn('text-[15px] font-semibold', !ativo && s === hojeIso && 'text-primary')}>{deIso(s).getDate()}</span>
          </button>
        )
      })}
    </div>
  )
}
