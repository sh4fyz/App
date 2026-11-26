import { useId, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export function Campo({ rotulo, children, id }: { rotulo: string; children: (id: string) => ReactNode; id?: string }) {
  const gerado = useId()
  const i = id ?? gerado
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={i}>{rotulo}</Label>
      {children(i)}
    </div>
  )
}

export const classeTexto =
  'min-h-24 w-full rounded-xl border bg-card px-3.5 py-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/20'

export const classeSelect =
  'min-h-11 w-full rounded-xl border bg-card px-3 text-sm outline-none focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/20'

/** Grupo de botões em que só um fica marcado */
export function Escolha<T extends string>({
  rotulo,
  opcoes,
  valor,
  aoMudar,
}: {
  rotulo: string
  opcoes: { valor: T; titulo: string }[]
  valor: T
  aoMudar: (v: T) => void
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-[13px] font-medium">{rotulo}</legend>
      <div className="flex flex-wrap gap-2">
        {opcoes.map((o) => (
          <button
            key={o.valor}
            type="button"
            aria-pressed={valor === o.valor}
            onClick={() => aoMudar(o.valor)}
            className={cn(
              'min-h-11 rounded-xl border px-3.5 text-sm transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none',
              valor === o.valor ? 'border-primary bg-lilac-strong font-medium text-accent-foreground' : 'bg-card hover:bg-muted'
            )}
          >
            {o.titulo}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

export function Rodape({ salvando, aoExcluir, aoVoltar, textoSalvar = 'Salvar' }: { salvando: boolean; aoExcluir?: () => void; aoVoltar?: () => void; textoSalvar?: string }) {
  return (
    <div className="flex flex-wrap gap-2 pt-1">
      {aoExcluir && (
        <Button type="button" variant="ghost" className="text-destructive hover:bg-red-50 hover:text-destructive" onClick={aoExcluir}>
          Excluir
        </Button>
      )}
      {aoVoltar && (
        <Button type="button" variant="outline" className="flex-1" onClick={aoVoltar}>
          Voltar
        </Button>
      )}
      <Button type="submit" className="flex-1" disabled={salvando}>
        {salvando ? 'Salvando…' : textoSalvar}
      </Button>
    </div>
  )
}
