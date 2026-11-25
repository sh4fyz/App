import type { ReactNode } from 'react'
import { BarraPesquisa } from './BarraPesquisa'

/** Topo de toda tela: conteúdo da página à esquerda e a barra de pesquisa (abaixo, no celular). */
export function Topo({ children, acoes }: { children: ReactNode; acoes?: ReactNode }) {
  return (
    <header className="mb-5 flex flex-col gap-4 md:mb-6 md:flex-row md:items-start md:justify-between md:gap-8">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">{children}</div>
        {acoes && <div className="-mr-2 shrink-0 md:hidden">{acoes}</div>}
      </div>
      <BarraPesquisa className="w-full md:max-w-[506px] md:flex-1" />
    </header>
  )
}

export function TituloPagina({ titulo, descricao }: { titulo: string; descricao?: string }) {
  return (
    <>
      <h1 className="text-[22px] font-semibold leading-tight tracking-tight">{titulo}</h1>
      {descricao && <p className="mt-1 text-sm text-muted-foreground">{descricao}</p>}
    </>
  )
}
