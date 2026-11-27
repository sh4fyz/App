import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useDados } from '@/data/dados'
import { hhmm } from '@/data/agenda'
import type { Area, Evento, Lembrete, Nota, Prazo, Tarefa } from '@/data/tipos'
import { DIAS_CURTOS, hoje, iso, somarDias } from '@/lib/datas'
import { cn } from '@/lib/utils'
import { Campo, Escolha, Rodape, classeSelect, classeTexto } from './partes'

type Base<T> = { item?: T; aoTerminar: () => void; aoVoltar?: () => void }

function confirmarExclusao(nome: string) {
  return window.confirm(`Excluir "${nome}"?`)
}

// ---------- tarefa ----------
export function FormTarefa({ item, aoTerminar, aoVoltar, area: areaInicial, projetoId }: Base<Tarefa> & { area?: string; projetoId?: string }) {
  const { criar, atualizar, remover, projetos } = useDados()
  const [salvando, setSalvando] = useState(false)
  const area = item?.area ?? areaInicial ?? 'geral'
  const doTrabalho = area === 'trabalho'
  const projetosAbertos = projetos.filter((p) => p.status !== 'concluido' || p.id === item?.project_id)

  async function salvar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const valores: Partial<Tarefa> = { titulo: String(fd.get('titulo')).trim(), data: String(fd.get('data') || '') || null }
    if (doTrabalho && projetosAbertos.length) valores.project_id = String(fd.get('projeto') || '') || null
    if (!valores.titulo) return
    setSalvando(true)
    const ok = item ? await atualizar('tasks', item.id, valores) : !!(await criar('tasks', { ...valores, area, concluida: false }))
    setSalvando(false)
    if (ok) {
      toast(item ? 'Tarefa salva' : 'Tarefa adicionada')
      aoTerminar()
    }
  }

  return (
    <form onSubmit={salvar} className="flex flex-col gap-4">
      <Campo rotulo="Tarefa">{(id) => <Input id={id} name="titulo" required autoFocus={!item} autoComplete="off" defaultValue={item?.titulo} placeholder="Ex: ler texto de Psicologia Social" />}</Campo>
      {doTrabalho && projetosAbertos.length > 0 && (
        <Campo rotulo="Projeto (opcional)">
          {(id) => (
            <select id={id} name="projeto" defaultValue={item ? (item.project_id ?? '') : (projetoId ?? '')} className={classeSelect}>
              <option value="">Nenhum</option>
              {projetosAbertos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          )}
        </Campo>
      )}
      <Campo rotulo={doTrabalho ? 'Para quando (opcional)' : 'Para quando'}>{(id) => <Input id={id} name="data" type="date" defaultValue={item ? (item.data ?? '') : doTrabalho ? '' : iso(hoje())} />}</Campo>
      <p className="-mt-2 text-xs text-muted-foreground">As tarefas de hoje aparecem em "Principais de hoje".</p>
      <Rodape
        salvando={salvando}
        aoVoltar={aoVoltar}
        aoExcluir={item ? async () => confirmarExclusao(item.titulo) && (await remover('tasks', item.id)) && (toast('Tarefa excluída'), aoTerminar()) : undefined}
      />
    </form>
  )
}

// ---------- lembrete ----------
export function FormLembrete({ item, aoTerminar, aoVoltar, area = 'geral' }: Base<Lembrete> & { area?: string }) {
  const { criar, atualizar, remover } = useDados()
  const [salvando, setSalvando] = useState(false)

  async function salvar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const valores = { titulo: String(fd.get('titulo')).trim(), quando: String(fd.get('quando')) }
    if (!valores.titulo || !valores.quando) return
    setSalvando(true)
    const ok = item ? await atualizar('reminders', item.id, valores) : !!(await criar('reminders', { ...valores, area, feito: false }))
    setSalvando(false)
    if (ok) {
      toast(item ? 'Lembrete salvo' : 'Lembrete criado')
      aoTerminar()
    }
  }

  return (
    <form onSubmit={salvar} className="flex flex-col gap-4">
      <Campo rotulo="Lembrete">{(id) => <Input id={id} name="titulo" required autoFocus={!item} autoComplete="off" defaultValue={item?.titulo} placeholder="Ex: pagar conta de luz" />}</Campo>
      <Campo rotulo="Quando">{(id) => <Input id={id} name="quando" type="date" required defaultValue={item?.quando ?? iso(somarDias(hoje(), 1))} />}</Campo>
      {item && (
        <Button
          type="button"
          variant="outline"
          onClick={async () => {
            if (await atualizar('reminders', item.id, { feito: true })) {
              toast('Lembrete concluído')
              aoTerminar()
            }
          }}
        >
          Marcar como feito
        </Button>
      )}
      <Rodape
        salvando={salvando}
        aoVoltar={aoVoltar}
        aoExcluir={item ? async () => confirmarExclusao(item.titulo) && (await remover('reminders', item.id)) && (toast('Lembrete excluído'), aoTerminar()) : undefined}
      />
    </form>
  )
}

// ---------- nota ----------
export function FormNota({ item, aoTerminar, aoVoltar, area = 'geral' }: Base<Nota> & { area?: string }) {
  const { criar, atualizar, remover } = useDados()
  const [salvando, setSalvando] = useState(false)
  const [tipo, setTipo] = useState<'nota' | 'reuniao'>(item?.tipo === 'reuniao' ? 'reuniao' : 'nota')
  const doTrabalho = (item?.area ?? area) === 'trabalho' && item?.tipo !== 'ideia'

  async function salvar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const texto = String(new FormData(e.currentTarget).get('texto')).trim()
    if (!texto) return
    setSalvando(true)
    const ok = item
      ? await atualizar('notes', item.id, doTrabalho ? { texto, tipo } : { texto })
      : !!(await criar('notes', { texto, tipo: doTrabalho ? tipo : 'nota', area }))
    setSalvando(false)
    if (ok) {
      toast(item ? 'Nota salva' : 'Nota criada')
      aoTerminar()
    }
  }

  return (
    <form onSubmit={salvar} className="flex flex-col gap-4">
      {doTrabalho && (
        <Escolha
          rotulo="Tipo"
          opcoes={[
            { valor: 'nota', titulo: 'Recado ou pendência' },
            { valor: 'reuniao', titulo: 'Reunião' },
          ]}
          valor={tipo}
          aoMudar={setTipo}
        />
      )}
      <Campo rotulo={item?.tipo === 'ideia' ? 'Ideia' : 'Nota'}>
        {(id) => <textarea id={id} name="texto" required autoFocus={!item} defaultValue={item?.texto} className={classeTexto} placeholder="Escreva aqui" />}
      </Campo>
      <Rodape
        salvando={salvando}
        aoVoltar={aoVoltar}
        aoExcluir={item ? async () => confirmarExclusao(item.texto.slice(0, 40)) && (await remover('notes', item.id)) && (toast('Nota excluída'), aoTerminar()) : undefined}
      />
    </form>
  )
}

// ---------- compromisso ----------
const AREAS: { valor: Area; titulo: string }[] = [
  { valor: 'aula', titulo: 'Aula' },
  { valor: 'estudo', titulo: 'Estudo' },
  { valor: 'estagio', titulo: 'Estágio' },
  { valor: 'trabalho', titulo: 'Trabalho' },
  { valor: 'outro', titulo: 'Outro' },
]
const ORDEM_DIAS = [1, 2, 3, 4, 5, 6, 0]

export function FormCompromisso({ item, aoTerminar, aoVoltar, repete: repeteInicial }: Base<Evento> & { repete?: boolean }) {
  const { criar, atualizar, remover } = useDados()
  const [salvando, setSalvando] = useState(false)
  const [area, setArea] = useState<Area>(item?.area ?? 'aula')
  const [repete, setRepete] = useState<'sim' | 'nao'>(item ? (item.dias_semana?.length ? 'sim' : 'nao') : repeteInicial === false ? 'nao' : 'sim')
  const [dias, setDias] = useState<number[]>(item?.dias_semana ?? [])
  const [erro, setErro] = useState('')

  async function salvar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const inicio = String(fd.get('inicio') || '')
    const fim = String(fd.get('fim') || '') || null
    const titulo = String(fd.get('titulo')).trim()
    if (!titulo || !inicio) return
    if (repete === 'sim' && !dias.length) return setErro('Escolha pelo menos um dia da semana.')
    if (fim && fim <= inicio) return setErro('O fim precisa ser depois do início.')
    setErro('')
    const valores = {
      titulo,
      detalhe: String(fd.get('detalhe') ?? '').trim(),
      area,
      inicio,
      fim,
      data: repete === 'nao' ? String(fd.get('data')) : null,
      dias_semana: repete === 'sim' ? [...dias].sort() : null,
    }
    setSalvando(true)
    const ok = item ? await atualizar('events', item.id, valores) : !!(await criar('events', valores))
    setSalvando(false)
    if (ok) {
      toast(item ? 'Compromisso salvo' : 'Compromisso adicionado')
      aoTerminar()
    }
  }

  return (
    <form onSubmit={salvar} className="flex flex-col gap-4">
      <Campo rotulo="Compromisso">{(id) => <Input id={id} name="titulo" required autoFocus={!item} autoComplete="off" defaultValue={item?.titulo} placeholder="Ex: Trabalho, Aula de Psicologia Social II" />}</Campo>
      <Escolha rotulo="Tipo" opcoes={AREAS} valor={area} aoMudar={setArea} />
      <Escolha
        rotulo="Repete?"
        opcoes={[
          { valor: 'sim', titulo: 'Toda semana' },
          { valor: 'nao', titulo: 'Só um dia' },
        ]}
        valor={repete}
        aoMudar={setRepete}
      />
      {repete === 'sim' ? (
        <fieldset>
          <legend className="mb-2 text-[13px] font-medium">Dias</legend>
          <div className="grid grid-cols-7 gap-1">
            {ORDEM_DIAS.map((d) => {
              const marcado = dias.includes(d)
              return (
                <button
                  key={d}
                  type="button"
                  aria-pressed={marcado}
                  onClick={() => setDias((x) => (marcado ? x.filter((y) => y !== d) : [...x, d]))}
                  className={cn(
                    'min-h-11 rounded-xl border text-xs font-medium uppercase focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none',
                    marcado ? 'border-primary bg-primary text-primary-foreground' : 'bg-card hover:bg-muted'
                  )}
                >
                  {DIAS_CURTOS[d]}
                </button>
              )
            })}
          </div>
        </fieldset>
      ) : (
        <Campo rotulo="Dia">{(id) => <Input id={id} name="data" type="date" required defaultValue={item?.data ?? iso(hoje())} />}</Campo>
      )}
      <div className="grid grid-cols-2 gap-3">
        <Campo rotulo="Começa">{(id) => <Input id={id} name="inicio" type="time" required defaultValue={hhmm(item?.inicio ?? null)} />}</Campo>
        <Campo rotulo="Termina (opcional)">{(id) => <Input id={id} name="fim" type="time" defaultValue={hhmm(item?.fim ?? null)} />}</Campo>
      </div>
      <Campo rotulo="Detalhe (opcional)">{(id) => <Input id={id} name="detalhe" autoComplete="off" defaultValue={item?.detalhe} placeholder="Ex: sala 204" />}</Campo>
      {erro && <p role="alert" className="text-[13px] text-destructive">{erro}</p>}
      <Rodape
        salvando={salvando}
        aoVoltar={aoVoltar}
        aoExcluir={item ? async () => confirmarExclusao(item.titulo) && (await remover('events', item.id)) && (toast('Compromisso excluído'), aoTerminar()) : undefined}
      />
    </form>
  )
}

// ---------- prazo ----------
export function FormPrazo({ item, aoTerminar, aoVoltar }: Base<Prazo>) {
  const { criar, atualizar, remover, materias } = useDados()
  const [salvando, setSalvando] = useState(false)
  const [tipo, setTipo] = useState<Prazo['tipo']>(item?.tipo ?? 'prova')

  async function salvar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const valores = {
      titulo: String(fd.get('titulo')).trim(),
      tipo,
      data: String(fd.get('data')),
      subject_id: String(fd.get('materia') || '') || null,
      conteudo: String(fd.get('conteudo') ?? '').trim(),
    }
    if (!valores.titulo || !valores.data) return
    setSalvando(true)
    const ok = item ? await atualizar('exams', item.id, valores) : !!(await criar('exams', valores))
    setSalvando(false)
    if (ok) {
      toast(item ? 'Prazo salvo' : 'Prazo adicionado')
      aoTerminar()
    }
  }

  return (
    <form onSubmit={salvar} className="flex flex-col gap-4">
      <Escolha
        rotulo="Tipo"
        opcoes={[
          { valor: 'prova', titulo: 'Prova' },
          { valor: 'entrega', titulo: 'Entrega' },
        ]}
        valor={tipo}
        aoMudar={setTipo}
      />
      <Campo rotulo="Nome">{(id) => <Input id={id} name="titulo" required autoFocus={!item} autoComplete="off" defaultValue={item?.titulo} placeholder={tipo === 'prova' ? 'Ex: Prova de Psicologia Social II' : 'Ex: Relatório do estágio'} />}</Campo>
      <Campo rotulo="Data">{(id) => <Input id={id} name="data" type="date" required defaultValue={item?.data ?? iso(somarDias(hoje(), 7))} />}</Campo>
      {materias.length > 0 && (
        <Campo rotulo="Matéria (opcional)">
          {(id) => (
            <select id={id} name="materia" defaultValue={item?.subject_id ?? ''} className={classeSelect}>
              <option value="">Nenhuma</option>
              {materias.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nome}
                </option>
              ))}
            </select>
          )}
        </Campo>
      )}
      <Campo rotulo={tipo === 'prova' ? 'O que cai (opcional)' : 'Detalhes (opcional)'}>
        {(id) => <textarea id={id} name="conteudo" defaultValue={item?.conteudo} className={classeTexto} placeholder={tipo === 'prova' ? 'Capítulos, textos, autores…' : 'Formato, páginas, combinados…'} />}
      </Campo>
      <Rodape
        salvando={salvando}
        aoVoltar={aoVoltar}
        aoExcluir={item ? async () => confirmarExclusao(item.titulo) && (await remover('exams', item.id)) && (toast('Prazo excluído'), aoTerminar()) : undefined}
      />
    </form>
  )
}
