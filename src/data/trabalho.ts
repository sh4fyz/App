import { useCallback } from 'react'
import { useDados } from './dados'
import type { ItemRotina, Plataforma } from './tipos'

export const PLATAFORMAS_DO_DIA: Plataforma[] = ['ifood', 'amazon', 'shopee']

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
export const reais = (v: number) => brl.format(v)

/** Itens ativos da rotina, com horário primeiro (em ordem) e os sem horário depois */
export function ordenarRotina(itens: ItemRotina[]) {
  return itens
    .filter((i) => i.ativo)
    .sort((a, b) => {
      if (a.horario && b.horario) return a.horario.localeCompare(b.horario)
      if (a.horario) return -1
      if (b.horario) return 1
      return a.ordem - b.ordem
    })
}

/** Rotina de um dia: itens, quais estão feitos e a função de marcar/desmarcar */
export function useRotinaDoDia(dataIso: string) {
  const { itensRotina, checksRotina, criar, remover } = useDados()
  const itens = ordenarRotina(itensRotina)
  const doDia = checksRotina.filter((c) => c.data === dataIso)
  const feitos = new Set(doDia.map((c) => c.item_id))

  const alternar = useCallback(
    (itemId: string) => {
      const check = doDia.find((c) => c.item_id === itemId)
      if (check) remover('routine_checks', check.id)
      else criar('routine_checks', { item_id: itemId, data: dataIso })
    },
    [doDia, criar, remover, dataIso]
  )

  return { itens, feitos, total: itens.length, concluidos: itens.filter((i) => feitos.has(i.id)).length, alternar }
}
