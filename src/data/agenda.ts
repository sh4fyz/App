import type { Area, Evento } from './tipos'

export type Compromisso = { id: string; hora: string; titulo: string; detalhe: string; area: Area; evento: Evento }

export const hhmm = (t: string | null) => (t ? t.slice(0, 5) : '')

/** Compromissos de um dia: os avulsos daquela data + os que se repetem naquele dia da semana */
export function agendaDoDia(eventos: Evento[], dataIso: string, diaSemana: number): Compromisso[] {
  return eventos
    .filter((e) => e.data === dataIso || (e.dias_semana ?? []).includes(diaSemana))
    .sort((a, b) => a.inicio.localeCompare(b.inicio))
    .map((e) => ({
      id: e.id,
      hora: hhmm(e.inicio),
      titulo: e.titulo,
      detalhe: [e.detalhe, e.fim ? `Até ${hhmm(e.fim)}` : ''].filter(Boolean).join(' · '),
      area: e.area,
      evento: e,
    }))
}
