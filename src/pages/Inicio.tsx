import { useState } from 'react'
import { Link } from 'react-router'
import { Bell, Lightbulb, Plus } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Checklist } from '@/components/comum/Checklist'
import { ItemLembrete } from '@/components/comum/ItemLembrete'
import { SeloData } from '@/components/comum/SeloData'
import { AgendaDia } from '@/components/inicio/AgendaDia'
import { CalendarioMes } from '@/components/inicio/CalendarioMes'
import { FaixaSemana } from '@/components/inicio/FaixaSemana'
import { Topo } from '@/components/layout/Topo'
import { useAcoesRapidas } from '@/components/layout/AcoesRapidas'
import { useDados } from '@/data/dados'
import { useComputador } from '@/hooks/use-media-query'
import { agendaDoDia } from '@/data/exemplo'
import { DIAS_CURTOS, dataPorExtenso, deIso, faltam, hoje, iso, saudacao } from '@/lib/datas'

export default function Inicio() {
  const dados = useDados()
  const abrir = useAcoesRapidas()
  const hojeIso = iso(hoje())
  const [dia, setDia] = useState(hojeIso)
  const computador = useComputador()

  const agenda = agendaDoDia(deIso(dia))
  const d = deIso(dia)
  const tituloAgenda = dia === hojeIso ? 'Agenda de hoje' : `Agenda de ${DIAS_CURTOS[d.getDay()]}, ${d.getDate()}`

  const principais = dados.tarefas.filter((t) => t.data === hojeIso)
  const feitas = principais.filter((t) => t.feita).length
  const lembretes = dados.lembretes.filter((l) => !l.feito).sort((a, b) => a.quando.localeCompare(b.quando))
  const ideias = dados.notas.filter((n) => n.tipo === 'ideia').length
  const prazos = [...dados.prazos].sort((a, b) => a.data.localeCompare(b.data))

  const cardAgenda = (
    <section aria-labelledby="t-agenda" className="min-w-0">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 id="t-agenda" className="text-[15px] font-semibold">{tituloAgenda}</h2>
        <span className="text-xs text-muted-foreground">
          {agenda.length} compromisso{agenda.length === 1 ? '' : 's'}
        </span>
      </div>
      <AgendaDia itens={agenda} />
    </section>
  )

  const cardPrincipais = (
    <section aria-labelledby="t-principais" className="min-w-0">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="t-principais" className="text-[15px] font-semibold">Principais de hoje</h2>
        <span className="text-xs text-muted-foreground">
          {feitas} de {principais.length}
        </span>
      </div>
      <Progress value={principais.length ? (feitas / principais.length) * 100 : 0} className="mt-3 mb-2" aria-label="Progresso de hoje" />
      {principais.length ? (
        <Checklist
          itens={principais.map((t) => ({ id: t.id, titulo: t.titulo, feito: t.feita }))}
          aoAlternar={dados.alternarTarefa}
        />
      ) : (
        <p className="py-3 text-sm text-muted-foreground">Nenhuma tarefa para hoje. Use o + para adicionar.</p>
      )}
    </section>
  )

  const caixaIdeias = ideias > 0 && (
    <Link
      to="/ideias"
      className="flex min-h-11 items-center gap-3 rounded-xl border border-dashed px-4 py-2.5 text-[13px] text-muted-foreground hover:bg-muted"
    >
      <Lightbulb className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
      {ideias} {ideias === 1 ? 'ideia' : 'ideias'} na caixa de entrada esperando organização
    </Link>
  )

  const cabecalhoLembretes = (
    <CardHeader>
      <CardTitle id="lembretes">Lembretes</CardTitle>
      <Button variant="outline" size="sm" onClick={() => abrir('lembrete')}>
        <Plus strokeWidth={1.75} aria-hidden />
        Novo
      </Button>
    </CardHeader>
  )

  const listaLembretes = lembretes.length ? (
    <div className="grid gap-2 md:grid-cols-2">
      {lembretes.map((l) => (
        <ItemLembrete key={l.id} titulo={l.titulo} quando={l.quando} />
      ))}
    </div>
  ) : (
    <p className="text-sm text-muted-foreground">Nenhum lembrete por enquanto.</p>
  )

  const cardsPrazos = prazos.map((p) => (
    <Card key={p.id} className="flex items-center gap-4 p-4 md:px-5">
      <SeloData data={p.data} />
      <div className="min-w-0">
        <p className="text-sm font-medium leading-snug">{p.titulo}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{faltam(p.data)}</p>
      </div>
    </Card>
  ))

  return (
    <>
      <Topo
        acoes={
          <Button variant="ghost" size="icon" aria-label="Ir para os lembretes" onClick={() => document.getElementById('lembretes')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>
            <Bell className="size-5" strokeWidth={1.75} />
          </Button>
        }
      >
        <p className="text-xs text-muted-foreground">{dataPorExtenso(hoje())}</p>
        <h1 className="mt-1 text-[22px] font-semibold leading-tight tracking-tight">{saudacao()}, Madu</h1>
      </Topo>

      {!computador ? (
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Sua semana</CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            <FaixaSemana selecionado={dia} aoSelecionar={setDia} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">{cardAgenda}</CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">{cardPrincipais}</CardContent>
        </Card>
        <Card>
          {cabecalhoLembretes}
          <CardContent className="flex flex-col gap-2">
            {listaLembretes}
            {caixaIdeias}
          </CardContent>
        </Card>
        <section aria-labelledby="t-proximos" className="flex flex-col gap-2">
          <h2 id="t-proximos" className="mt-2 px-1 text-[15px] font-semibold">Próximos dias</h2>
          {cardsPrazos}
        </section>
      </div>
      ) : (
      <div className="grid grid-cols-3 gap-5">
        <Card className="p-5">
          <CalendarioMes selecionado={dia} aoSelecionar={setDia} />
        </Card>
        <Card className="col-span-2">
          {cabecalhoLembretes}
          <CardContent className="flex flex-col gap-2">
            {listaLembretes}
            {caixaIdeias}
          </CardContent>
        </Card>

        <Card className="col-span-3 grid grid-cols-2 gap-8 p-5">
          {cardAgenda}
          {cardPrincipais}
        </Card>

        {cardsPrazos}
        <Card className="flex flex-col justify-center border-transparent bg-lilac p-5">
          <CardDescription className="font-medium text-accent-foreground">Semana</CardDescription>
          <p className="mt-1 text-sm">
            {dados.semana.concluidas} de {dados.semana.total} tarefas concluídas
          </p>
        </Card>
      </div>
      )}
    </>
  )
}
