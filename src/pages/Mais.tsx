import { Link } from 'react-router'
import { ChevronRight, Plus } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Topo, TituloPagina } from '@/components/layout/Topo'
import { modulos } from '@/config/modulos'

export default function Mais() {
  return (
    <>
      <Topo>
        <TituloPagina titulo="Mais" />
      </Topo>
      <Card className="divide-y overflow-hidden">
        {modulos.filter((m) => m.noMais).map((m) => {
          const Icone = m.icone
          return (
            <Link key={m.id} to={m.caminho} className="flex min-h-16 items-center gap-4 px-5 py-3 hover:bg-muted focus-visible:bg-muted focus-visible:outline-none">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-lilac text-primary">
                <Icone className="size-5" strokeWidth={1.75} aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{m.titulo}</span>
                {m.descricao && <span className="block text-xs text-muted-foreground">{m.descricao}</span>}
              </span>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} aria-hidden />
            </Link>
          )
        })}
      </Card>
      <div className="mt-4 flex min-h-16 items-center gap-4 rounded-2xl border border-dashed px-5 py-3 text-muted-foreground">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted">
          <Plus className="size-5" strokeWidth={1.75} aria-hidden />
        </span>
        <span className="text-sm">Espaço para módulos futuros</span>
      </div>
    </>
  )
}
