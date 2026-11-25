import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { iso, hoje, MESES, segundaDaSemana, somarDias } from '@/lib/datas'
import { cn } from '@/lib/utils'

const CABECALHO = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']
const NOMES = ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo']

/** Computador: calendário do mês. Tocar num dia mostra a agenda dele. */
export function CalendarioMes({ selecionado, aoSelecionar }: { selecionado: string; aoSelecionar: (d: string) => void }) {
  const [mes, setMes] = useState(() => {
    const h = hoje()
    return new Date(h.getFullYear(), h.getMonth(), 1)
  })
  const inicio = segundaDaSemana(mes)
  const hojeIso = iso(hoje())
  const semanas = Math.ceil(((mes.getDay() + 6) % 7 + new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate()) / 7)
  const trocar = (n: number) => setMes((m) => new Date(m.getFullYear(), m.getMonth() + n, 1))
  const nomeMes = MESES[mes.getMonth()]

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[15px] font-semibold capitalize">{nomeMes}</h2>
        <div className="flex items-center text-xs text-muted-foreground">
          <button type="button" onClick={() => trocar(-1)} aria-label="Mês anterior" className="grid size-11 place-items-center rounded-xl hover:bg-muted">
            <ChevronLeft className="size-4" strokeWidth={1.75} />
          </button>
          <span className="px-1 tabular-nums">{mes.getFullYear()}</span>
          <button type="button" onClick={() => trocar(1)} aria-label="Próximo mês" className="grid size-11 place-items-center rounded-xl hover:bg-muted">
            <ChevronRight className="size-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>
      <div role="grid" aria-label={`${nomeMes} de ${mes.getFullYear()}`} className="grid grid-cols-7 text-center">
        {CABECALHO.map((c, i) => (
          <div key={i} role="columnheader" aria-label={NOMES[i]} className="pb-2 text-[11px] font-medium text-muted-foreground">
            {c}
          </div>
        ))}
        {Array.from({ length: semanas * 7 }, (_, i) => {
          const d = somarDias(inicio, i)
          const s = iso(d)
          const fora = d.getMonth() !== mes.getMonth()
          const ativo = s === selecionado
          return (
            <button
              key={s}
              type="button"
              role="gridcell"
              aria-selected={ativo}
              aria-label={`${d.getDate()} de ${MESES[d.getMonth()]}`}
              onClick={() => aoSelecionar(s)}
              className={cn(
                'mx-auto grid size-11 place-items-center rounded-xl text-[13px] tabular-nums transition-colors hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none',
                fora && 'text-muted-foreground',
                !ativo && s === hojeIso && 'font-semibold text-primary',
                ativo && 'bg-primary font-semibold text-primary-foreground hover:bg-primary-hover'
              )}
            >
              {d.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}
