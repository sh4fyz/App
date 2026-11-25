/* Estado local da etapa 2: fica salvo no aparelho (localStorage) até o Supabase entrar na etapa 3. */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { dadosIniciais, type Lembrete, type Nota, type Tarefa } from './exemplo'
import { iso, hoje } from '@/lib/datas'

const CHAVE = 'minha-agenda:etapa2'
type Estado = ReturnType<typeof dadosIniciais>

function carregar(): Estado {
  try {
    const bruto = localStorage.getItem(CHAVE)
    if (bruto) return { ...dadosIniciais(), ...JSON.parse(bruto) }
  } catch {
    /* armazenamento indisponível */
  }
  return dadosIniciais()
}

const novoId = () => Math.random().toString(36).slice(2, 10)

function useDadosInterno() {
  const [estado, setEstado] = useState<Estado>(carregar)

  useEffect(() => {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(estado))
    } catch {
      /* cheio ou bloqueado */
    }
  }, [estado])

  return useMemo(
    () => ({
      ...estado,
      alternarTarefa: (id: string) =>
        setEstado((e) => ({ ...e, tarefas: e.tarefas.map((t) => (t.id === id ? { ...t, feita: !t.feita } : t)) })),
      adicionarTarefa: (titulo: string, data = iso(hoje())) =>
        setEstado((e) => ({ ...e, tarefas: [...e.tarefas, { id: novoId(), titulo, feita: false, data } satisfies Tarefa] })),
      adicionarLembrete: (titulo: string, quando: string) =>
        setEstado((e) => ({ ...e, lembretes: [...e.lembretes, { id: novoId(), titulo, quando, feito: false } satisfies Lembrete] })),
      adicionarNota: (texto: string, tipo: Nota['tipo'] = 'ideia') =>
        setEstado((e) => ({ ...e, notas: [{ id: novoId(), texto, tipo, criadaEm: iso(hoje()) }, ...e.notas] })),
    }),
    [estado]
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
