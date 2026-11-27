import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { useDados } from '@/data/dados'
import { hhmm } from '@/data/agenda'
import type { ConferenciaPagamento, ItemRotina, Plataforma, Projeto, StatusProjeto } from '@/data/tipos'
import { Campo, Escolha, Rodape, classeTexto } from './partes'

type Base<T> = { item?: T; aoTerminar: () => void; aoVoltar?: () => void }

const confirmar = (nome: string) => window.confirm(`Excluir "${nome}"?`)

export const STATUS_PROJETO: { valor: StatusProjeto; titulo: string }[] = [
  { valor: 'aberto', titulo: 'A fazer' },
  { valor: 'andamento', titulo: 'Em andamento' },
  { valor: 'esperando', titulo: 'Esperando alguém' },
  { valor: 'concluido', titulo: 'Concluído' },
]

export const NOME_PLATAFORMA: Record<Plataforma, string> = { ifood: 'iFood', amazon: 'Amazon', shopee: 'Shopee', outra: 'Outra' }

// ---------- projeto ----------
export function FormProjeto({ item, aoTerminar, aoVoltar }: Base<Projeto>) {
  const { criar, atualizar, remover } = useDados()
  const [salvando, setSalvando] = useState(false)
  const [status, setStatus] = useState<StatusProjeto>(item?.status ?? 'aberto')

  async function salvar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const valores = { nome: String(fd.get('nome')).trim(), obs: String(fd.get('obs') ?? '').trim(), status }
    if (!valores.nome) return
    setSalvando(true)
    const ok = item ? await atualizar('projects', item.id, valores) : !!(await criar('projects', valores))
    setSalvando(false)
    if (ok) {
      toast(item ? 'Projeto salvo' : 'Projeto criado')
      aoTerminar()
    }
  }

  return (
    <form onSubmit={salvar} className="flex flex-col gap-4">
      <Campo rotulo="Projeto">{(id) => <Input id={id} name="nome" required autoFocus={!item} autoComplete="off" defaultValue={item?.nome} placeholder="Ex: planilha de repasses de dezembro" />}</Campo>
      <Escolha rotulo="Status" opcoes={STATUS_PROJETO} valor={status} aoMudar={setStatus} />
      <Campo rotulo="Observação (opcional)">{(id) => <textarea id={id} name="obs" defaultValue={item?.obs} className={classeTexto} placeholder="Com quem falar, onde está o arquivo…" />}</Campo>
      <Rodape
        salvando={salvando}
        aoVoltar={aoVoltar}
        aoExcluir={item ? async () => confirmar(item.nome) && (await remover('projects', item.id)) && (toast('Projeto excluído'), aoTerminar()) : undefined}
      />
      {item && <p className="-mt-2 text-xs text-muted-foreground">Ao excluir o projeto, as tarefas dele continuam na lista como tarefas soltas.</p>}
    </form>
  )
}

// ---------- item da rotina ----------
export function FormItemRotina({ item, aoTerminar, aoVoltar }: Base<ItemRotina>) {
  const { criar, atualizar, remover, itensRotina } = useDados()
  const [salvando, setSalvando] = useState(false)

  async function salvar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const valores = { titulo: String(fd.get('titulo')).trim(), horario: String(fd.get('horario') || '') || null }
    if (!valores.titulo) return
    setSalvando(true)
    const ordem = itensRotina.reduce((m, x) => Math.max(m, x.ordem), 0) + 1
    const ok = item ? await atualizar('routine_items', item.id, valores) : !!(await criar('routine_items', { ...valores, ordem, ativo: true }))
    setSalvando(false)
    if (ok) {
      toast(item ? 'Item salvo' : 'Item adicionado à rotina')
      aoTerminar()
    }
  }

  return (
    <form onSubmit={salvar} className="flex flex-col gap-4">
      <Campo rotulo="O que fazer todo dia">{(id) => <Input id={id} name="titulo" required autoFocus={!item} autoComplete="off" defaultValue={item?.titulo} placeholder="Ex: responder e-mails" />}</Campo>
      <Campo rotulo="Horário (opcional)">{(id) => <Input id={id} name="horario" type="time" defaultValue={hhmm(item?.horario ?? null)} />}</Campo>
      <Rodape
        salvando={salvando}
        aoVoltar={aoVoltar}
        aoExcluir={item ? async () => confirmar(item.titulo) && (await remover('routine_items', item.id)) && (toast('Item excluído'), aoTerminar()) : undefined}
      />
    </form>
  )
}

// ---------- conferência de pagamento ----------
/** `item` existe quando aquele dia já tem registro; senão cria um novo com `plataforma` e `data`. */
export function FormConferencia({
  item,
  plataforma,
  data,
  aoTerminar,
}: Base<ConferenciaPagamento> & { plataforma: Plataforma; data: string }) {
  const { criar, atualizar } = useDados()
  const [salvando, setSalvando] = useState(false)
  const [status, setStatus] = useState<ConferenciaPagamento['status']>(item?.status ?? 'conferido')

  async function salvar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const bruto = String(fd.get('valor') ?? '').trim().replace(/\./g, '').replace(',', '.')
    const valor = bruto ? Number(bruto) : null
    if (valor !== null && (Number.isNaN(valor) || valor < 0)) return toast('Valor inválido. Use só números, ex: 152,30')
    const valores = { valor, obs: String(fd.get('obs') ?? '').trim(), status }
    setSalvando(true)
    const ok = item ? await atualizar('payment_checks', item.id, valores) : !!(await criar('payment_checks', { ...valores, plataforma, data }))
    setSalvando(false)
    if (ok) {
      toast('Conferência salva')
      aoTerminar()
    }
  }

  return (
    <form onSubmit={salvar} className="flex flex-col gap-4">
      <Escolha
        rotulo="Status"
        opcoes={[
          { valor: 'conferido', titulo: 'Conferido' },
          { valor: 'pendente', titulo: 'Pendente' },
        ]}
        valor={status}
        aoMudar={setStatus}
      />
      <Campo rotulo="Valor (opcional)">
        {(id) => (
          <Input
            id={id}
            name="valor"
            inputMode="decimal"
            autoComplete="off"
            defaultValue={item?.valor != null ? item.valor.toFixed(2).replace('.', ',') : ''}
            placeholder="Ex: 152,30"
          />
        )}
      </Campo>
      <Campo rotulo="Observação (opcional)">{(id) => <textarea id={id} name="obs" defaultValue={item?.obs} className={classeTexto} placeholder="Ex: faltou o repasse da loja 2" />}</Campo>
      <Rodape salvando={salvando} />
    </form>
  )
}
