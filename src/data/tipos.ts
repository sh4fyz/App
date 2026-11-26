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

export type Tarefa = { id: string; titulo: string; area: string; data: string | null; concluida: boolean }
export type Lembrete = { id: string; titulo: string; quando: string; area: string; feito: boolean }
export type Nota = { id: string; texto: string; tipo: 'ideia' | 'nota' | 'reuniao'; area: string; criado_em: string }
export type Prazo = { id: string; titulo: string; tipo: 'prova' | 'entrega'; data: string; subject_id: string | null; conteudo: string; nota: string | null }
export type Materia = { id: string; nome: string; semestre: string | null }
export type ArquivoLink = { id: string; nome: string; url: string; area: string; subject_id: string | null }

/** Tabelas que a etapa 3 carrega, com o tipo de cada linha */
export type Tabelas = {
  events: Evento
  tasks: Tarefa
  reminders: Lembrete
  notes: Nota
  exams: Prazo
  subjects: Materia
  links: ArquivoLink
}
export type NomeTabela = keyof Tabelas

export const TABELAS: NomeTabela[] = ['events', 'tasks', 'reminders', 'notes', 'exams', 'subjects', 'links']

/** Ordem em que cada tabela chega do banco */
export const ORDEM: Record<NomeTabela, { coluna: string; asc: boolean }> = {
  events: { coluna: 'inicio', asc: true },
  tasks: { coluna: 'criado_em', asc: true },
  reminders: { coluna: 'quando', asc: true },
  notes: { coluna: 'criado_em', asc: false },
  exams: { coluna: 'data', asc: true },
  subjects: { coluna: 'nome', asc: true },
  links: { coluna: 'nome', asc: true },
}
