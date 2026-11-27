/*
 * Dados do app vindos do Supabase.
 * - Ao entrar, mostra na hora a última cópia salva no aparelho e busca a versão nova no banco.
 * - Sem internet dá para ver tudo, mas editar fica bloqueado (com aviso).
 * - Ao voltar para o app ou quando a internet volta, busca de novo (assim celular e computador ficam iguais).
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/auth/AuthProvider'
import { iso, hoje, somarDias } from '@/lib/datas'
import { JANELA_DIAS, ORDEM, TABELAS, type NomeTabela, type Tabelas } from './tipos'

type Linhas = { [T in NomeTabela]: Tabelas[T][] }
type Novo<T extends NomeTabela> = Partial<Omit<Tabelas[T], 'id'>>

const vazio = (): Linhas => Object.fromEntries(TABELAS.map((t) => [t, []])) as unknown as Linhas
const chaveCache = (uid: string) => `minha-agenda:cache:${uid}`

function ordenar<T extends NomeTabela>(tabela: T, linhas: Tabelas[T][]): Tabelas[T][] {
  const { coluna, asc } = ORDEM[tabela]
  return [...linhas].sort((a, b) => {
    const va = String((a as Record<string, unknown>)[coluna] ?? '')
    const vb = String((b as Record<string, unknown>)[coluna] ?? '')
    return asc ? va.localeCompare(vb) : vb.localeCompare(va)
  })
}

function useOnline() {
  const [online, setOnline] = useState(() => navigator.onLine)
  useEffect(() => {
    const sim = () => setOnline(true)
    const nao = () => setOnline(false)
    window.addEventListener('online', sim)
    window.addEventListener('offline', nao)
    return () => {
      window.removeEventListener('online', sim)
      window.removeEventListener('offline', nao)
    }
  }, [])
  return online
}

const AVISO_OFFLINE = 'Sem internet. Dá pra ver tudo, mas editar só com conexão.'
const AVISO_ERRO = 'Não deu para salvar. Confira a internet e tente de novo.'

function useDadosInterno() {
  const { sessao } = useAuth()
  const uid = sessao?.user.id ?? null
  const online = useOnline()
  const [linhas, setLinhas] = useState<Linhas>(vazio)
  const [carregando, setCarregando] = useState(true)
  // tabelas que o banco ainda não tem (ex.: falta rodar um arquivo de migração)
  const [faltando, setFaltando] = useState<NomeTabela[]>([])
  const linhasRef = useRef(linhas)
  linhasRef.current = linhas

  // cópia local para abrir rápido e funcionar offline
  useEffect(() => {
    if (!uid) return
    try {
      const bruto = localStorage.getItem(chaveCache(uid))
      setLinhas(bruto ? { ...vazio(), ...JSON.parse(bruto) } : vazio())
    } catch {
      setLinhas(vazio())
    }
  }, [uid])

  useEffect(() => {
    if (!uid) return
    try {
      localStorage.setItem(chaveCache(uid), JSON.stringify(linhas))
    } catch {
      /* cheio ou bloqueado */
    }
  }, [linhas, uid])

  const buscar = useCallback(async () => {
    if (!supabase || !uid || !navigator.onLine) {
      setCarregando(false)
      return
    }
    const respostas = await Promise.all(
      TABELAS.map((t) => {
        let q = supabase!.from(t).select('*')
        const janela = JANELA_DIAS[t]
        if (janela) q = q.gte(janela.coluna, iso(somarDias(hoje(), -janela.dias)))
        return q.order(ORDEM[t].coluna, { ascending: ORDEM[t].asc })
      })
    )
    // sem internet de verdade: tudo falha, fica a cópia local
    if (respostas.every((r) => r.error)) {
      setCarregando(false)
      return
    }
    // uma tabela com erro não derruba as outras: ela fica com a cópia local
    setLinhas((atual) => {
      const novo = { ...atual } as Record<NomeTabela, unknown[]>
      TABELAS.forEach((t, i) => {
        if (!respostas[i].error) novo[t] = respostas[i].data ?? []
      })
      return novo as Linhas
    })
    setFaltando(TABELAS.filter((_, i) => respostas[i].error))
    setCarregando(false)
  }, [uid])

  useEffect(() => {
    if (!uid) return
    setCarregando(true)
    buscar()
    const aoVoltar = () => document.visibilityState === 'visible' && buscar()
    document.addEventListener('visibilitychange', aoVoltar)
    window.addEventListener('online', buscar)
    return () => {
      document.removeEventListener('visibilitychange', aoVoltar)
      window.removeEventListener('online', buscar)
    }
  }, [uid, buscar])

  const podeEditar = useCallback(() => {
    if (!supabase || !navigator.onLine) {
      toast(AVISO_OFFLINE)
      return false
    }
    return true
  }, [])

  const criar = useCallback(
    async <T extends NomeTabela>(tabela: T, valores: Novo<T>): Promise<Tabelas[T] | null> => {
      if (!podeEditar()) return null
      const { data, error } = await supabase!.from(tabela).insert(valores as never).select().single()
      if (error || !data) {
        toast(AVISO_ERRO)
        return null
      }
      setLinhas((l) => ({ ...l, [tabela]: ordenar(tabela, [...(l[tabela] as Tabelas[T][]), data as Tabelas[T]]) }))
      return data as Tabelas[T]
    },
    [podeEditar]
  )

  const atualizar = useCallback(
    async <T extends NomeTabela>(tabela: T, id: string, valores: Partial<Tabelas[T]>) => {
      if (!podeEditar()) return false
      const antes = linhasRef.current[tabela]
      setLinhas((l) => ({
        ...l,
        [tabela]: ordenar(tabela, l[tabela].map((x) => (x.id === id ? { ...x, ...valores } : x)) as Tabelas[T][]),
      }))
      const { error } = await supabase!.from(tabela).update(valores as never).eq('id', id)
      if (error) {
        setLinhas((l) => ({ ...l, [tabela]: antes }))
        toast(AVISO_ERRO)
        return false
      }
      return true
    },
    [podeEditar]
  )

  const remover = useCallback(
    async (tabela: NomeTabela, id: string) => {
      if (!podeEditar()) return false
      const antes = linhasRef.current[tabela]
      setLinhas((l) => ({ ...l, [tabela]: l[tabela].filter((x) => x.id !== id) }))
      const { error } = await supabase!.from(tabela).delete().eq('id', id)
      if (error) {
        setLinhas((l) => ({ ...l, [tabela]: antes }))
        toast(AVISO_ERRO)
        return false
      }
      return true
    },
    [podeEditar]
  )

  return useMemo(
    () => ({
      eventos: linhas.events,
      tarefas: linhas.tasks,
      lembretes: linhas.reminders,
      notas: linhas.notes,
      prazos: linhas.exams,
      materias: linhas.subjects,
      arquivos: linhas.links,
      projetos: linhas.projects,
      itensRotina: linhas.routine_items,
      checksRotina: linhas.routine_checks,
      conferencias: linhas.payment_checks,
      faltando,
      carregando,
      online,
      criar,
      atualizar,
      remover,
      recarregar: buscar,
    }),
    [linhas, faltando, carregando, online, criar, atualizar, remover, buscar]
  )
}

type Dados = ReturnType<typeof useDadosInterno>
const Contexto = createContext<Dados | null>(null)

export function DadosProvider({ children }: { children: ReactNode }) {
  return <Contexto.Provider value={useDadosInterno()}>{children}</Contexto.Provider>
}

export function useDados() {
  const c = useContext(Contexto)
  if (!c) throw new Error('useDados precisa estar dentro de <DadosProvider>')
  return c
}
