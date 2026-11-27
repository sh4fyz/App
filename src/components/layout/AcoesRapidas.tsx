import { createContext, useContext, useState, type ReactNode } from 'react'
import { Bell, CalendarClock, CalendarPlus, CheckSquare, Flag, StickyNote, type LucideIcon } from 'lucide-react'
import { GavetaRapida } from '@/components/comum/GavetaRapida'
import { FormCompromisso, FormLembrete, FormNota, FormPrazo, FormTarefa } from '@/components/formularios/Formularios'
import { FormConferencia, FormItemRotina, FormProjeto, NOME_PLATAFORMA } from '@/components/formularios/Trabalho'
import type { ConferenciaPagamento, Evento, ItemRotina, Lembrete, Nota, Plataforma, Prazo, Projeto, Tarefa } from '@/data/tipos'

/**
 * Ações rápidas (botão +, "Novo" nos cards e edição de itens).
 * Para um módulo novo, acrescente o tipo aqui, uma opção em `opcoes` e o formulário.
 */
export type Acao =
  | { tipo: 'tarefa'; item?: Tarefa; area?: string; projetoId?: string }
  | { tipo: 'lembrete'; item?: Lembrete; area?: string }
  | { tipo: 'nota'; item?: Nota; area?: string }
  | { tipo: 'compromisso'; item?: Evento; repete?: boolean }
  | { tipo: 'prazo'; item?: Prazo }
  | { tipo: 'projeto'; item?: Projeto }
  | { tipo: 'rotina'; item?: ItemRotina }
  | { tipo: 'conferencia'; item?: ConferenciaPagamento; plataforma: Plataforma; data: string }

type Tipo = Acao['tipo']

const opcoes: { acao: Acao; titulo: string; icone: LucideIcon }[] = [
  { acao: { tipo: 'tarefa' }, titulo: 'Tarefa', icone: CheckSquare },
  { acao: { tipo: 'lembrete' }, titulo: 'Lembrete', icone: Bell },
  { acao: { tipo: 'nota' }, titulo: 'Nota', icone: StickyNote },
  { acao: { tipo: 'compromisso', repete: true }, titulo: 'Compromisso fixo', icone: CalendarClock },
  { acao: { tipo: 'compromisso', repete: false }, titulo: 'Compromisso de um dia', icone: CalendarPlus },
  { acao: { tipo: 'prazo' }, titulo: 'Prova ou entrega', icone: Flag },
]

const titulos: Record<Tipo, [string, string]> = {
  tarefa: ['Nova tarefa', 'Editar tarefa'],
  lembrete: ['Novo lembrete', 'Editar lembrete'],
  nota: ['Nova nota', 'Editar nota'],
  compromisso: ['Novo compromisso', 'Editar compromisso'],
  prazo: ['Nova prova ou entrega', 'Editar prazo'],
  projeto: ['Novo projeto', 'Editar projeto'],
  rotina: ['Novo item da rotina', 'Editar item da rotina'],
  conferencia: ['Conferir pagamento', 'Conferir pagamento'],
}

const Contexto = createContext<(acao?: Acao | Tipo) => void>(() => {})
export const useAcoesRapidas = () => useContext(Contexto)

export function AcoesRapidasProvider({ children }: { children: ReactNode }) {
  const [aberta, setAberta] = useState(false)
  const [acao, setAcao] = useState<Acao | null>(null)
  // veio do menu do "+": mostra "Voltar" para escolher outro tipo
  const [doMenu, setDoMenu] = useState(false)

  function abrir(a?: Acao | Tipo) {
    setAcao(a ? (typeof a === 'string' ? ({ tipo: a } as Acao) : a) : null)
    setDoMenu(!a)
    setAberta(true)
  }
  const fechar = () => setAberta(false)
  const voltar = doMenu ? () => setAcao(null) : undefined

  let titulo = 'Adicionar'
  let conteudo: ReactNode
  if (!acao) {
    conteudo = (
      <div className="grid grid-cols-3 gap-2">
        {opcoes.map(({ acao: a, titulo: t, icone: Icone }) => (
          <button
            key={t}
            type="button"
            onClick={() => setAcao(a)}
            className="flex min-h-20 flex-col items-center justify-center gap-2 rounded-xl border bg-card px-2 py-3 text-center text-[13px] font-medium leading-tight hover:bg-lilac focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none"
          >
            <Icone className="size-5 text-primary" strokeWidth={1.75} aria-hidden />
            {t}
          </button>
        ))}
      </div>
    )
  } else {
    titulo = acao.tipo === 'conferencia' ? `Conferir ${NOME_PLATAFORMA[acao.plataforma]}` : titulos[acao.tipo][acao.item ? 1 : 0]
    const props = { aoTerminar: fechar, aoVoltar: voltar }
    // a chave recria o formulário a cada abertura, com os valores certos
    const chave = `${acao.tipo}-${acao.item?.id ?? 'novo'}-${String(aberta)}`
    if (acao.tipo === 'tarefa') conteudo = <FormTarefa key={chave} item={acao.item} area={acao.area} projetoId={acao.projetoId} {...props} />
    if (acao.tipo === 'lembrete') conteudo = <FormLembrete key={chave} item={acao.item} area={acao.area} {...props} />
    if (acao.tipo === 'nota') conteudo = <FormNota key={chave} item={acao.item} area={acao.area} {...props} />
    if (acao.tipo === 'compromisso') conteudo = <FormCompromisso key={chave} item={acao.item} repete={acao.repete} {...props} />
    if (acao.tipo === 'prazo') conteudo = <FormPrazo key={chave} item={acao.item} {...props} />
    if (acao.tipo === 'projeto') conteudo = <FormProjeto key={chave} item={acao.item} {...props} />
    if (acao.tipo === 'rotina') conteudo = <FormItemRotina key={chave} item={acao.item} {...props} />
    if (acao.tipo === 'conferencia')
      conteudo = <FormConferencia key={`${chave}-${acao.plataforma}-${acao.data}`} item={acao.item} plataforma={acao.plataforma} data={acao.data} {...props} />
  }

  return (
    <Contexto.Provider value={abrir}>
      {children}
      <GavetaRapida aberta={aberta} aoMudar={setAberta} titulo={titulo}>
        {conteudo}
      </GavetaRapida>
    </Contexto.Provider>
  )
}
