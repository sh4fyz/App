import { Link } from 'react-router'
import { ChevronLeft } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Topo, TituloPagina } from '@/components/layout/Topo'
import { modulos } from '@/config/modulos'

/** Página provisória de um módulo que ainda vai ser construído. */
export default function EmBreve({ id, etapa, voltarPara }: { id: string; etapa: number; voltarPara?: string }) {
  const m = modulos.find((x) => x.id === id)!
  const Icone = m.icone
  return (
    <>
      {voltarPara && (
        <Link to={voltarPara} className="-ml-2 mb-2 inline-flex min-h-11 items-center gap-1 rounded-xl px-2 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="size-4" strokeWidth={1.75} aria-hidden />
          Voltar
        </Link>
      )}
      <Topo>
        <TituloPagina titulo={m.titulo} descricao={m.descricao} />
      </Topo>
      <Card className="flex flex-col items-start gap-3 p-6">
        <span className="grid size-11 place-items-center rounded-xl bg-lilac text-primary">
          <Icone className="size-5" strokeWidth={1.75} aria-hidden />
        </span>
        <p className="text-[15px] font-semibold">Essa área chega na etapa {etapa}</p>
        <p className="max-w-prose text-sm text-muted-foreground">
          A navegação já está pronta. O conteúdo de {m.titulo.toLowerCase()} entra quando a gente chegar nessa parte do plano.
        </p>
      </Card>
    </>
  )
}
