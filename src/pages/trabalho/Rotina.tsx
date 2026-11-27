import { Link } from 'react-router'
import { ChevronLeft, Plus } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Checklist } from '@/components/comum/Checklist'
import { AgendaDia } from '@/components/inicio/AgendaDia'
import { Topo, TituloPagina } from '@/components/layout/Topo'
import { useAcoesRapidas } from '@/components/layout/AcoesRapidas'
import { useDados } from '@/data/dados'
import { agendaDoDia, hhmm } from '@/data/agenda'
import { useRotinaDoDia } from '@/data/trabalho'
import { dataPorExtenso, hoje, iso } from '@/lib/datas'

export default function Rotina() {
  const { eventos, itensRotina } = useDados()
  const abrir = useAcoesRapidas()
  const dia = hoje()
  const r = useRotinaDoDia(iso(dia))
  const horarios = agendaDoDia(eventos, iso(dia), dia.getDay()).filter((c) => c.area === 'trabalho')

  return (
    <>
      <Link to="/trabalho" className="-ml-2 mb-2 inline-flex min-h-11 items-center gap-1 rounded-xl px-2 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" strokeWidth={1.75} aria-hidden />
        Trabalho
      </Link>
      <Topo>
        <TituloPagina titulo="Rotina do trabalho" descricao={dataPorExtenso(dia)} />
      </Topo>

      <div className="flex flex-col gap-4 md:grid md:grid-cols-3 md:items-start md:gap-5">
        <Card className="md:col-span-2">
          <CardHeader className="flex-col items-stretch gap-3">
            <div className="flex items-center justify-between gap-3">
              <CardTitle>Checklist de hoje</CardTitle>
              <Button variant="outline" size="sm" onClick={() => abrir('rotina')}>
                <Plus strokeWidth={1.75} aria-hidden />
                Item
              </Button>
            </div>
            {r.total > 0 && (
              <div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Zera sozinha todo dia</span>
                  <span>
                    {r.concluidos} de {r.total}
                  </span>
                </div>
                <Progress value={(r.concluidos / r.total) * 100} className="mt-2" aria-label="Rotina de hoje" />
              </div>
            )}
          </CardHeader>
          <CardContent className="pt-2">
            {r.total ? (
              <Checklist
                itens={r.itens.map((i) => ({ id: i.id, titulo: i.titulo, feito: r.feitos.has(i.id), detalhe: hhmm(i.horario) || '—' }))}
                aoAlternar={r.alternar}
                aoEditar={(id) => abrir({ tipo: 'rotina', item: itensRotina.find((i) => i.id === id) })}
              />
            ) : (
              <div className="flex flex-col items-start gap-2 py-1">
                <p className="text-sm text-muted-foreground">Coloque aqui o que você faz todo dia: abrir o sistema, conferir pedidos, responder e-mails…</p>
                <Button variant="outline" size="sm" onClick={() => abrir('rotina')}>
                  <Plus strokeWidth={1.75} aria-hidden />
                  Adicionar primeiro item
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Horários de hoje</CardTitle>
              <CardDescription className="mt-1">Compromissos do tipo Trabalho</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <AgendaDia
              itens={horarios}
              aoAbrir={(c) => abrir({ tipo: 'compromisso', item: c.evento })}
              vazio={
                <div className="flex flex-col items-start gap-2 py-1">
                  <p className="text-sm text-muted-foreground">Nenhum horário de trabalho hoje.</p>
                  <Button variant="outline" size="sm" onClick={() => abrir({ tipo: 'compromisso', repete: true })}>
                    <Plus strokeWidth={1.75} aria-hidden />
                    Adicionar horário
                  </Button>
                </div>
              }
            />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
