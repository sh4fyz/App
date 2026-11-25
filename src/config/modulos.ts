import {
  BriefcaseBusiness,
  Ellipsis,
  Folder,
  GraduationCap,
  House,
  Lightbulb,
  Settings,
  Sprout,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react'

/**
 * Lista única de módulos do app. Para criar um módulo novo, adicione um item aqui
 * e uma rota em App.tsx. A barra lateral, a barra inferior e a tela "Mais" leem desta lista.
 */
export type Modulo = {
  id: string
  titulo: string
  /** Nome curto para a barra inferior do celular */
  tituloCurto?: string
  caminho: string
  icone: LucideIcon
  /** Aparece na barra lateral do computador */
  lateral?: boolean
  /** Aparece na barra inferior do celular */
  inferior?: boolean
  /** Aparece na tela "Mais" */
  noMais?: boolean
  descricao?: string
}

export const modulos: Modulo[] = [
  { id: 'inicio', titulo: 'Início', caminho: '/', icone: House, lateral: true, inferior: true },
  { id: 'trabalho', titulo: 'Trabalho', caminho: '/trabalho', icone: BriefcaseBusiness, lateral: true, inferior: true, descricao: 'Rotina, projetos e conferência de pagamentos' },
  { id: 'estudos', titulo: 'Estudos', caminho: '/estudos', icone: GraduationCap, lateral: true, inferior: true, descricao: 'Matérias, provas e material didático' },
  { id: 'financeiro', titulo: 'Financeiro', tituloCurto: 'Finanças', caminho: '/financeiro', icone: Wallet, lateral: true, inferior: true, descricao: 'Despesas, planejamento, renda extra e metas' },
  { id: 'estagio', titulo: 'Estágio', caminho: '/estagio', icone: Users, lateral: true, inferior: true, descricao: 'Agenda, atendimentos e relatório' },
  { id: 'arquivos', titulo: 'Arquivos', caminho: '/arquivos', icone: Folder, lateral: true, noMais: true, descricao: 'Pastas do Drive, PDFs e links' },
  { id: 'habitos', titulo: 'Hábitos e bem-estar', caminho: '/habitos', icone: Sprout, noMais: true, descricao: 'Água, pausas, sono e sequência de dias' },
  { id: 'ideias', titulo: 'Ideias e notas', caminho: '/ideias', icone: Lightbulb, noMais: true, descricao: 'Tudo o que você anotou pela barra de busca' },
  { id: 'configuracoes', titulo: 'Configurações', caminho: '/configuracoes', icone: Settings, noMais: true, descricao: 'Conta, matérias e aparência' },
]

export const moduloMais: Modulo = { id: 'mais', titulo: 'Mais', caminho: '/mais', icone: Ellipsis }
