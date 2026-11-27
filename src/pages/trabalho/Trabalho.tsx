import { useState } from 'react'
import { Link } from 'react-router'
import { ChevronLeft, ChevronRight, Database, ListChecks, Pencil, Plus } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Checklist } from '@/components/comum/Checklist'
import { ItemLembrete } from '@/components/comum/ItemLembrete'
import { Topo, TituloPagina } from '@/components/layout/Topo'
import { useAcoesRapidas } from '@/components/layout/AcoesRapidas'
import { NOME_PLATAFORMA, STATUS_PROJETO } from '@/components/formularios/Trabalho'
import { useDados } from '@/data/dados'
import { hhmm } from '@/data/agenda'
import { PLATAFORMAS_DO_DIA, reais, useRotinaDoDia } from '@/data/trabalho'
import { TABELAS_TRABALHO, type Nota, type Projeto, type StatusProjeto, type Tarefa } from '@/data/tipos'
import { DIAS_CURTOS, MESES_CURTOS, deIso, hoje, iso, segundaDaSemana, somarDias } from '@/lib/datas'
import { cn } from '@/lib/utils'

const AREA = 'trabalho'

export default function Trabalho() {
  const { faltando, online } = useDados()
  const semBanco = online && faltando.some((t) => TABELAS_TRABALHO.includes(t))

  return (
    <>
      <Topo>
        <TituloPagina titulo="Trabalho" descricao="Rotina, projetos e conferência de pagamentos" />
      </Topo>
      {semBanco && <AvisoMigracao />}
      <div className="flex flex-col gap-4 md:grid md:grid-cols-3 md:items-start md:gap-5">
        <CardRotina className="order-1 md:order-none" />
        <CardLembretes className="order-2 md:order-none md:col-span-2" />
        <CardProjetos className="order-4 md:order-none md:col-span-2" />
        <CardConferencia className="order-3 md:order-none" />
        <CardNotas className="order-5 md:order-none md:col-span-2" />
        <CardResumo className="order-6 md:order-none" />
      </div>
    </>
  )
}

function AvisoMigracao() {
  return (
    <div role="status" className="mb-4 flex gap-3 rounded-xl bg-lilac px-4 py-3 text-[13px]">
      <Database className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={1.75} aria-hidden />
      <p>
        Falta atualizar o banco para a rotina, os projetos e a conferência funcionarem. No Supabase, abra <b>SQL Editor</b>, cole o arquivo{' '}
        <code className="rounded bg-card px-1">supabase/migrations/0002_trabalho.sql</code> e clique em <b>Run</b>.
      </p>
    </div>
  )
}

// ---------- rotina ----------
function CardRotina({ className }: { className?: string }) {
  const r = useRotinaDoDia(iso(hoje()))
  const agora = new Date().toTimeString().slice(0, 5)
  const pendentes = r.itens.filter((i) => !r.feitos.has(i.id))
  const proximo = pendentes.find((i) => i.horario && hhmm(i.horario) >= agora) ?? pendentes[0]

  return (
    <Card className={cn('overflow-hidden', className)}>
      <Link
        to="/trabalho/rotina"
        className="flex h-full flex-col gap-3 p-5 hover:bg-muted/60 focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring/40 focus-visible:outline-none"
      >
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-lilac text-primary">
              <ListChecks className="size-[18px]" strokeWidth={1.75} aria-hidden />
            </span>
            <span className="text-[15px] font-semibold">Rotina do dia a dia</span>
          </span>
          <ChevronRight className="size-4 text-muted-foreground" strokeWidth={1.75} aria-hidden />
        </div>
        {r.total ? (
          <>
            <div>
              <div className="flex items-baseline justify-between text-xs text-muted-foreground">
                <span>Hoje</span>
                <span>
                  {r.concluidos} de {r.total}
                </span>
              </div>
              <Progress value={(r.concluidos / r.total) * 100} className="mt-2" aria-label="Rotina de hoje" />
            </div>
            <p className="text-[13px] text-muted-foreground">
              {proximo ? (
                <>
                  Próximo: {proximo.horario && <span className="tabular-nums">{hhmm(proximo.horario)} · </span>}
                  <span className="text-foreground">{proximo.titulo}</span>
                </>
              ) : (
                'Rotina de hoje feita.'
              )}
            </p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Monte a checklist do que você faz todo dia no trabalho, com os horários.</p>
        )}
      </Link>
    </Card>
  )
}

// ---------- lembretes ----------
function CardLembretes({ className }: { className?: string }) {
  const { lembretes } = useDados()
  const abrir = useAcoesRapidas()
  const lista = lembretes.filter((l) => l.area === AREA && !l.feito)
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Lembretes do trabalho</CardTitle>
        <Button variant="outline" size="sm" onClick={() => abrir({ tipo: 'lembrete', area: AREA })}>
          <Plus strokeWidth={1.75} aria-hidden />
          Novo
        </Button>
      </CardHeader>
      <CardContent>
        {lista.length ? (
          <div className="grid gap-2 md:grid-cols-2">
            {lista.map((l) => (
              <ItemLembrete key={l.id} titulo={l.titulo} quando={l.quando} aoAbrir={() => abrir({ tipo: 'lembrete', item: l })} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhum lembrete do trabalho.</p>
        )}
      </CardContent>
    </Card>
  )
}

// ---------- projetos e tarefas ----------
const estiloStatus: Record<StatusProjeto, string> = {
  aberto: 'bg-muted text-muted-foreground',
  andamento: 'bg-lilac-strong text-accent-foreground',
  esperando: 'border bg-card text-muted-foreground',
  concluido: 'bg-success-soft text-green-700',
}

export function SeloStatus({ status }: { status: StatusProjeto }) {
  return (
    <span className={cn('shrink-0 rounded-lg px-2 py-0.5 text-xs font-medium', estiloStatus[status])}>
      {STATUS_PROJETO.find((s) => s.valor === status)?.titulo}
    </span>
  )
}

/** Tarefas abertas + as concluídas nos últimos 2 dias (para não sumirem logo depois de marcar) */
function visiveis(tarefas: Tarefa[]) {
  const limite = somarDias(hoje(), -2).getTime()
  return tarefas
    .filter((t) => !t.concluida || !t.concluida_em || new Date(t.concluida_em).getTime() >= limite)
    .sort((a, b) => Number(a.concluida) - Number(b.concluida))
}

function CardProjetos({ className }: { className?: string }) {
  const { projetos, tarefas, atualizar } = useDados()
  const abrir = useAcoesRapidas()
  const [verConcluidos, setVerConcluidos] = useState(false)

  const doTrabalho = tarefas.filter((t) => t.area === AREA)
  const ativos = projetos.filter((p) => p.status !== 'concluido')
  const concluidos = projetos.filter((p) => p.status === 'concluido')
  const idsProjetos = new Set(projetos.map((p) => p.id))
  const soltas = visiveis(doTrabalho.filter((t) => !t.project_id || !idsProjetos.has(t.project_id)))

  const alternar = (id: string) => {
    const t = tarefas.find((x) => x.id === id)
    if (t) atualizar('tasks', id, { concluida: !t.concluida })
  }
  const editar = (id: string) => abrir({ tipo: 'tarefa', item: tarefas.find((t) => t.id === id) })
  const itens = (lista: Tarefa[]) => lista.map((t) => ({ id: t.id, titulo: t.titulo, feito: t.concluida }))

  const bloco = (p: Projeto) => {
    const lista = visiveis(doTrabalho.filter((t) => t.project_id === p.id))
    const abertas = doTrabalho.filter((t) => t.project_id === p.id && !t.concluida).length
    return (
      <li key={p.id} className="rounded-xl border">
        <button
          type="button"
          onClick={() => abrir({ tipo: 'projeto', item: p })}
          className="flex min-h-11 w-full items-center gap-3 rounded-t-xl px-4 py-2.5 text-left hover:bg-muted/60 focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring/40 focus-visible:outline-none"
        >
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium leading-snug">{p.nome}</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              {abertas ? `${abertas} ${abertas === 1 ? 'tarefa aberta' : 'tarefas abertas'}` : 'Sem tarefas abertas'}
            </span>
          </span>
          <SeloStatus status={p.status} />
        </button>
        <div className="border-t px-4 pb-1">
          {lista.length > 0 && <Checklist itens={itens(lista)} aoAlternar={alternar} aoEditar={editar} />}
          <button
            type="button"
            onClick={() => abrir({ tipo: 'tarefa', area: AREA, projetoId: p.id })}
            className="-ml-2 flex min-h-11 items-center gap-2 rounded-xl px-2 text-[13px] text-muted-foreground hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none"
          >
            <Plus className="size-4" strokeWidth={1.75} aria-hidden />
            Tarefa neste projeto
          </button>
        </div>
      </li>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="flex-wrap">
        <CardTitle>Projetos e tarefas</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => abrir({ tipo: 'tarefa', area: AREA })}>
            <Plus strokeWidth={1.75} aria-hidden />
            Tarefa
          </Button>
          <Button variant="outline" size="sm" onClick={() => abrir('projeto')}>
            <Plus strokeWidth={1.75} aria-hidden />
            Projeto
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {ativos.length === 0 && soltas.length === 0 && <p className="text-sm text-muted-foreground">Nenhum projeto em aberto. Crie um ou adicione uma tarefa solta.</p>}
        {ativos.length > 0 && <ul className="grid gap-3 lg:grid-cols-2">{ativos.map(bloco)}</ul>}
        {soltas.length > 0 && (
          <div>
            <h3 className="mt-1 text-[13px] font-medium text-muted-foreground">Tarefas soltas</h3>
            <Checklist itens={itens(soltas)} aoAlternar={alternar} aoEditar={editar} />
          </div>
        )}
        {concluidos.length > 0 && (
          <div>
            <button
              type="button"
              aria-expanded={verConcluidos}
              onClick={() => setVerConcluidos((v) => !v)}
              className="-ml-2 flex min-h-11 items-center gap-1.5 rounded-xl px-2 text-[13px] text-muted-foreground hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none"
            >
              <ChevronRight className={cn('size-4 transition-transform', verConcluidos && 'rotate-90')} strokeWidth={1.75} aria-hidden />
              {concluidos.length} {concluidos.length === 1 ? 'projeto concluído' : 'projetos concluídos'}
            </button>
            {verConcluidos && <ul className="mt-2 grid gap-3 lg:grid-cols-2">{concluidos.map(bloco)}</ul>}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ---------- conferência de pagamentos ----------
function rotuloDia(d: string) {
  const hojeIso = iso(hoje())
  if (d === hojeIso) return 'Hoje'
  if (d === iso(somarDias(hoje(), -1))) return 'Ontem'
  const x = deIso(d)
  return `${DIAS_CURTOS[x.getDay()]}, ${x.getDate()} ${MESES_CURTOS[x.getMonth()]}`
}

function CardConferencia({ className }: { className?: string }) {
  const { conferencias, criar, atualizar } = useDados()
  const abrir = useAcoesRapidas()
  const [dia, setDia] = useState(iso(hoje()))
  const ehHoje = dia === iso(hoje())

  const doDia = PLATAFORMAS_DO_DIA.map((p) => ({ plataforma: p, item: conferencias.find((c) => c.plataforma === p && c.data === dia) }))
  const conferidos = doDia.filter((x) => x.item?.status === 'conferido').length

  function alternar(p: (typeof doDia)[number]) {
    if (p.item) atualizar('payment_checks', p.item.id, { status: p.item.status === 'conferido' ? 'pendente' : 'conferido' })
    else criar('payment_checks', { plataforma: p.plataforma, data: dia, status: 'conferido', obs: '' })
  }

  return (
    <Card className={className}>
      <CardHeader className="flex-col items-stretch gap-1">
        <div className="flex items-baseline justify-between gap-3">
          <CardTitle>Conferência de pagamentos</CardTitle>
          <span className="shrink-0 text-xs text-muted-foreground">
            {conferidos} de {PLATAFORMAS_DO_DIA.length}
          </span>
        </div>
        <div className="-mx-2 flex items-center justify-between">
          <Button variant="ghost" size="icon" aria-label="Dia anterior" onClick={() => setDia(iso(somarDias(deIso(dia), -1)))}>
            <ChevronLeft className="size-4" strokeWidth={1.75} />
          </Button>
          <CardDescription className="font-medium text-foreground">{rotuloDia(dia)}</CardDescription>
          <Button variant="ghost" size="icon" aria-label="Próximo dia" disabled={ehHoje} onClick={() => setDia(iso(somarDias(deIso(dia), 1)))}>
            <ChevronRight className="size-4" strokeWidth={1.75} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col">
          {doDia.map((p) => {
            const nome = NOME_PLATAFORMA[p.plataforma]
            const ok = p.item?.status === 'conferido'
            const detalhe = [p.item?.valor != null ? reais(p.item.valor) : '', p.item?.obs ?? ''].filter(Boolean).join(' · ')
            return (
              <li key={p.plataforma} className="flex items-center gap-1">
                <label className="flex min-h-11 min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-xl py-1.5">
                  <Checkbox checked={ok} onCheckedChange={() => alternar(p)} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="text-sm font-medium">{nome}</span>
                      <span className={cn('rounded-md px-1.5 py-px text-[11px] font-medium', ok ? 'bg-success-soft text-green-700' : 'bg-muted text-muted-foreground')}>
                        {ok ? 'conferido' : 'pendente'}
                      </span>
                    </span>
                    {detalhe && <span className="mt-0.5 block truncate text-xs text-muted-foreground">{detalhe}</span>}
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => abrir({ tipo: 'conferencia', item: p.item, plataforma: p.plataforma, data: dia })}
                  aria-label={`Valor e observação de ${nome}`}
                  className="grid size-11 shrink-0 place-items-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none"
                >
                  <Pencil className="size-4" strokeWidth={1.75} aria-hidden />
                </button>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}

// ---------- notas rápidas ----------
function dataCurta(ts: string) {
  const d = new Date(ts)
  return `${String(d.getDate()).padStart(2, '0')} ${MESES_CURTOS[d.getMonth()]}`
}

function CardNotas({ className }: { className?: string }) {
  const { notas } = useDados()
  const abrir = useAcoesRapidas()
  const [todas, setTodas] = useState(false)
  const lista = notas.filter((n) => n.area === AREA && n.tipo !== 'ideia')
  const mostradas = todas ? lista : lista.slice(0, 4)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Notas rápidas</CardTitle>
        <Button variant="outline" size="sm" onClick={() => abrir({ tipo: 'nota', area: AREA })}>
          <Plus strokeWidth={1.75} aria-hidden />
          Nova
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {lista.length === 0 ? (
          <p className="text-sm text-muted-foreground">Reuniões, recados e pendências soltas ficam aqui.</p>
        ) : (
          <ul className="grid gap-2 md:grid-cols-2">
            {mostradas.map((n: Nota) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => abrir({ tipo: 'nota', item: n })}
                  className="flex h-full min-h-11 w-full flex-col gap-1 rounded-xl border px-4 py-3 text-left hover:bg-muted/60 focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none"
                >
                  <span className="text-xs text-muted-foreground">
                    {n.tipo === 'reuniao' ? 'Reunião' : 'Recado'} · {dataCurta(n.criado_em)}
                  </span>
                  <span className="line-clamp-3 whitespace-pre-line text-sm leading-snug">{n.texto}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {lista.length > 4 && (
          <Button variant="ghost" size="sm" className="self-start" onClick={() => setTodas((v) => !v)}>
            {todas ? 'Mostrar menos' : `Ver todas (${lista.length})`}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

// ---------- resumo da semana ----------
function CardResumo({ className }: { className?: string }) {
  const { tarefas } = useDados()
  const inicio = segundaDaSemana(hoje()).getTime()
  const doTrabalho = tarefas.filter((t) => t.area === AREA)
  const feitas = doTrabalho.filter((t) => t.concluida && t.concluida_em && new Date(t.concluida_em).getTime() >= inicio)
  const ficam = doTrabalho.filter((t) => !t.concluida)

  const lista = (itens: Tarefa[]) => (
    <ul className="mt-1.5 flex flex-col gap-1">
      {itens.slice(0, 5).map((t) => (
        <li key={t.id} className="truncate text-[13px]">
          {t.titulo}
        </li>
      ))}
      {itens.length > 5 && <li className="text-xs text-muted-foreground">e mais {itens.length - 5}</li>}
    </ul>
  )

  return (
    <Card className={cn('border-transparent bg-lilac', className)}>
      <CardHeader>
        <CardTitle>Resumo da semana</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div>
          <p className="text-[13px] font-medium text-accent-foreground">
            {feitas.length ? `${feitas.length} ${feitas.length === 1 ? 'tarefa concluída' : 'tarefas concluídas'}` : 'Nenhuma tarefa concluída ainda'}
          </p>
          {feitas.length > 0 && lista(feitas)}
        </div>
        <div>
          <p className="text-[13px] font-medium text-accent-foreground">{ficam.length ? 'Fica pra próxima semana' : 'Nada pendente pra próxima semana'}</p>
          {ficam.length > 0 && lista(ficam)}
        </div>
      </CardContent>
    </Card>
  )
}
