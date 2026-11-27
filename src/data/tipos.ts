export type Area = 'aula' | 'estudo' | 'estagio' | 'trabalho' | 'outro'

export type Evento = {
  id: string
  titulo: string
  detalhe: string
  area: Area
  /** avulso: 'AAAA-MM-DD' */
  data: string | null
  /** repete: 0 = domingo … 6 = sábado */
  dias_semana: number[] | null
  /** 'HH:MM:SS' */
  inicio: string
  fim: string | null
}

export type Tarefa = {
  id: string
  titulo: string
  area: string
  data: string | null
  concluida: boolean
  project_id?: string | null
  /** preenchido pelo banco quando a tarefa é marcada */
  concluida_em?: string | null
  criado_em?: string
}
export type Lembrete = { id: string; titulo: string; quando: string; area: string; feito: boolean }
export type Nota = { id: string; texto: string; tipo: 'ideia' | 'nota' | 'reuniao'; area: string; criado_em: string }
export type Prazo = { id: string; titulo: string; tipo: 'prova' | 'entrega'; data: string; subject_id: string | null; conteudo: string; nota: string | null }
export type Materia = { id: string; nome: string; semestre: string | null }
export type ArquivoLink = { id: string; nome: string; url: string; area: string; subject_id: string | null }

export type StatusProjeto = 'aberto' | 'andamento' | 'esperando' | 'concluido'
export type Projeto = { id: string; nome: string; status: StatusProjeto; obs: string; criado_em: string }
export type ItemRotina = { id: string; titulo: string; horario: string | null; ordem: number; ativo: boolean }
export type CheckRotina = { id: string; item_id: string; data: string }
export type Plataforma = 'ifood' | 'amazon' | 'shopee' | 'outra'
export type ConferenciaPagamento = { id: string; plataforma: Plataforma; data: string; valor: number | null; status: 'pendente' | 'conferido'; obs: string }

/** Tabelas que o app carrega, com o tipo de cada linha */
export type Tabelas = {
  events: Evento
  tasks: Tarefa
  reminders: Lembrete
  notes: Nota
  exams: Prazo
  subjects: Materia
  links: ArquivoLink
  projects: Projeto
  routine_items: ItemRotina
  routine_checks: CheckRotina
  payment_checks: ConferenciaPagamento
}
export type NomeTabela = keyof Tabelas

export const TABELAS: NomeTabela[] = [
  'events', 'tasks', 'reminders', 'notes', 'exams', 'subjects', 'links',
  'projects', 'routine_items', 'routine_checks', 'payment_checks',
]

/** Tabelas criadas pelo arquivo 0002_trabalho.sql */
export const TABELAS_TRABALHO: NomeTabela[] = ['projects', 'routine_items', 'routine_checks', 'payment_checks']

/** Tabelas que crescem todo dia: só os últimos N dias vêm do banco */
export const JANELA_DIAS: Partial<Record<NomeTabela, { coluna: string; dias: number }>> = {
  routine_checks: { coluna: 'data', dias: 45 },
  payment_checks: { coluna: 'data', dias: 90 },
}

/** Ordem em que cada tabela chega do banco */
export const ORDEM: Record<NomeTabela, { coluna: string; asc: boolean }> = {
  events: { coluna: 'inicio', asc: true },
  tasks: { coluna: 'criado_em', asc: true },
  reminders: { coluna: 'quando', asc: true },
  notes: { coluna: 'criado_em', asc: false },
  exams: { coluna: 'data', asc: true },
  subjects: { coluna: 'nome', asc: true },
  links: { coluna: 'nome', asc: true },
  projects: { coluna: 'criado_em', asc: true },
  routine_items: { coluna: 'ordem', asc: true },
  routine_checks: { coluna: 'data', asc: true },
  payment_checks: { coluna: 'data', asc: true },
}
