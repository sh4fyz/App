/**
 * Dados de exemplo da etapa 2, montados com a rotina real (matérias e turno do trabalho).
 * Os horários de aula e de estágio são provisórios. Na etapa 3 tudo isso vem do Supabase.
 */
import { iso, hoje, somarDias } from '@/lib/datas'

export type TipoCompromisso = 'aula' | 'estudo' | 'estagio' | 'trabalho'
export type Compromisso = { id: string; hora: string; titulo: string; detalhe: string; tipo: TipoCompromisso }
export type Tarefa = { id: string; titulo: string; feita: boolean; data: string }
export type Lembrete = { id: string; titulo: string; quando: string; feito: boolean }
export type Nota = { id: string; texto: string; tipo: 'ideia' | 'nota'; criadaEm: string }
export type Prazo = { id: string; titulo: string; data: string; tipo: 'prova' | 'entrega' }
export type Materia = { id: string; nome: string }
export type ArquivoLink = { id: string; nome: string; url: string; area: string }

export const materias: Materia[] = [
  { id: 'extensao', nome: 'Atividade de Extensão III' },
  { id: 'avaliacao', nome: 'Avaliação Psicológica: Instrumentos Objetivos' },
  { id: 'estagio-aval', nome: 'Estágio Básico em Avaliação Psicológica I' },
  { id: 'pesquisa', nome: 'Prática de Pesquisa Qualitativa em Psicologia' },
  { id: 'ppb', nome: 'Processos Psicológicos Básicos II' },
  { id: 'desenvolvimento', nome: 'Psicologia do Desenvolvimento do Adulto e do Idoso' },
  { id: 'politicas', nome: 'Psicologia e Políticas Públicas' },
  { id: 'social', nome: 'Psicologia Social II' },
]

export const arquivos: ArquivoLink[] = [
  { id: 'fcmscsp', nome: 'FCMSCSP', url: 'https://drive.google.com/drive/folders/1QW2AF25PmSIw-PNr0QaKj6NzNE6dK8ck', area: 'Faculdade' },
]

const trabalho: Compromisso = { id: 'trab', hora: '13:00', titulo: 'Trabalho', detalhe: 'Até 21:30', tipo: 'trabalho' }

// Grade provisória por dia da semana (0 = domingo)
const grade: Record<number, Compromisso[]> = {
  1: [
    { id: 'a1', hora: '08:00', titulo: 'Aula — Psicologia Social II', detalhe: 'Até 10:00', tipo: 'aula' },
    { id: 'e1', hora: '10:30', titulo: 'Ler texto de Psicologia Social', detalhe: 'Estudo · 1h', tipo: 'estudo' },
    trabalho,
  ],
  2: [
    { id: 'a2', hora: '08:00', titulo: 'Aula — Processos Psicológicos Básicos II', detalhe: 'Até 10:00', tipo: 'aula' },
    { id: 'e2', hora: '10:30', titulo: 'Fichamento de Pesquisa Qualitativa', detalhe: 'Estudo · 1h', tipo: 'estudo' },
    trabalho,
  ],
  3: [
    { id: 'a3', hora: '08:00', titulo: 'Aula — Avaliação Psicológica', detalhe: 'Instrumentos Objetivos · até 10:00', tipo: 'aula' },
    { id: 'e3', hora: '10:30', titulo: 'Revisar escalas e inventários', detalhe: 'Estudo · 1h', tipo: 'estudo' },
    trabalho,
  ],
  4: [
    { id: 'a4', hora: '08:00', titulo: 'Aula — Desenvolvimento do Adulto e do Idoso', detalhe: 'Até 10:00', tipo: 'aula' },
    { id: 'e4', hora: '10:30', titulo: 'Escrever relatório do estágio', detalhe: 'Estágio · 1h', tipo: 'estagio' },
    trabalho,
  ],
  5: [
    { id: 'a5', hora: '08:00', titulo: 'Aula — Psicologia e Políticas Públicas', detalhe: 'Até 10:00', tipo: 'aula' },
    { id: 'e5', hora: '10:30', titulo: 'Revisar Processos Psicológicos', detalhe: 'Estudo · 1h', tipo: 'estudo' },
    trabalho,
  ],
  6: [
    { id: 'g6', hora: '08:00', titulo: 'Estágio Básico em Avaliação Psicológica', detalhe: 'Até 12:00', tipo: 'estagio' },
    { id: 'a6', hora: '14:00', titulo: 'Atividade de Extensão III', detalhe: 'Até 17:00', tipo: 'aula' },
  ],
  0: [],
}

export const agendaDoDia = (d: Date) => grade[d.getDay()] ?? []

function proxima(diaSemana: number) {
  const h = hoje()
  let n = (diaSemana - h.getDay() + 7) % 7
  if (n <= 1) n += 7
  return somarDias(h, n)
}

export function dadosIniciais() {
  const h = hoje()
  return {
    tarefas: [
      { id: 't1', titulo: 'Revisar slides de Avaliação Psicológica', feita: true, data: iso(h) },
      { id: 't2', titulo: 'Terminar o relatório do estágio', feita: false, data: iso(h) },
      { id: 't3', titulo: 'Conferir repasses iFood e Shopee', feita: false, data: iso(h) },
      { id: 't4', titulo: 'Ler texto de Psicologia Social II', feita: false, data: iso(h) },
    ] as Tarefa[],
    lembretes: [
      { id: 'l1', titulo: 'Pagar conta de internet', quando: iso(proxima(5)), feito: false },
      { id: 'l2', titulo: 'Levar caderno do estágio', quando: iso(somarDias(h, 1)), feito: false },
    ] as Lembrete[],
    notas: [
      { id: 'n1', texto: 'Perguntar à supervisora sobre o modelo de laudo', tipo: 'ideia', criadaEm: iso(h) },
      { id: 'n2', texto: 'Separar R$ 50 por semana para a caixinha da viagem', tipo: 'ideia', criadaEm: iso(h) },
      { id: 'n3', texto: 'Tema do TCC: envelhecimento e políticas públicas?', tipo: 'ideia', criadaEm: iso(h) },
    ] as Nota[],
    prazos: [
      { id: 'p1', titulo: 'Prova — Avaliação Psicológica', data: iso(somarDias(h, 7)), tipo: 'prova' },
      { id: 'p2', titulo: 'Entrega do relatório do estágio', data: iso(somarDias(h, 10)), tipo: 'entrega' },
    ] as Prazo[],
    semana: { concluidas: 6, total: 15 },
  }
}
