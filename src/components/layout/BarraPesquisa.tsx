import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router'
import { CheckSquare, Folder, GraduationCap, Lightbulb, Search } from 'lucide-react'
import { toast } from 'sonner'
import { arquivos, materias } from '@/data/exemplo'
import { useDados } from '@/data/dados'
import { cn } from '@/lib/utils'

type Resultado = { id: string; titulo: string; grupo: string; icone: typeof Search; abrir: () => void }

const normalizar = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/**
 * Barra de pesquisa e captura rápida. Busca tarefas, matérias e arquivos;
 * Enter sem resultado selecionado salva o texto como ideia.
 */
export function BarraPesquisa({ className }: { className?: string }) {
  const [texto, setTexto] = useState('')
  const [aberta, setAberta] = useState(false)
  const [ativo, setAtivo] = useState(-1)
  const ref = useRef<HTMLInputElement>(null)
  const idLista = useId()
  const navegar = useNavigate()
  const { tarefas, adicionarNota } = useDados()

  // Ctrl K / ⌘K foca a busca
  useEffect(() => {
    function atalho(e: globalThis.KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        ref.current?.focus()
      }
    }
    window.addEventListener('keydown', atalho)
    return () => window.removeEventListener('keydown', atalho)
  }, [])

  const resultados = useMemo<Resultado[]>(() => {
    const q = normalizar(texto.trim())
    if (q.length < 2) return []
    const bate = (s: string) => normalizar(s).includes(q)
    return [
      ...materias.filter((m) => bate(m.nome)).map((m) => ({ id: m.id, titulo: m.nome, grupo: 'Matéria', icone: GraduationCap, abrir: () => navegar('/estudos') })),
      ...tarefas.filter((t) => bate(t.titulo)).map((t) => ({ id: t.id, titulo: t.titulo, grupo: 'Tarefa', icone: CheckSquare, abrir: () => navegar('/') })),
      ...arquivos.filter((a) => bate(a.nome)).map((a) => ({ id: a.id, titulo: a.nome, grupo: 'Arquivo', icone: Folder, abrir: () => window.open(a.url, '_blank', 'noopener') })),
    ].slice(0, 7)
  }, [texto, tarefas, navegar])

  function limpar() {
    setTexto('')
    setAtivo(-1)
    setAberta(false)
  }

  function aoTeclar(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setAtivo((i) => Math.min(i + 1, resultados.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setAtivo((i) => Math.max(i - 1, -1))
    } else if (e.key === 'Escape') {
      limpar()
      ref.current?.blur()
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (ativo >= 0 && resultados[ativo]) {
        resultados[ativo].abrir()
        limpar()
        return
      }
      const t = texto.trim()
      if (!t) return
      adicionarNota(t, 'ideia')
      toast('Ideia salva', { description: 'Está na caixa de entrada de Ideias.' })
      limpar()
    }
  }

  const mostrar = aberta && texto.trim().length >= 2

  return (
    <div className={cn('relative', className)}>
      <div className="flex min-h-11 items-center gap-2.5 rounded-xl border bg-card px-3.5 focus-within:border-primary focus-within:ring-[3px] focus-within:ring-ring/20">
        <Search className="size-[18px] shrink-0 text-muted-foreground" strokeWidth={1.75} aria-hidden />
        <input
          ref={ref}
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value)
            setAtivo(-1)
            setAberta(true)
          }}
          onFocus={() => setAberta(true)}
          onBlur={() => setTimeout(() => setAberta(false), 150)}
          onKeyDown={aoTeclar}
          type="search"
          enterKeyHint="done"
          role="combobox"
          aria-expanded={mostrar}
          aria-controls={idLista}
          aria-activedescendant={ativo >= 0 ? `${idLista}-${ativo}` : undefined}
          aria-label="Buscar, abrir matéria ou anotar uma ideia"
          placeholder="Buscar, abrir matéria ou anotar uma ideia..."
          className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
        />
        <kbd className="hidden shrink-0 rounded-md border px-1.5 py-0.5 font-sans text-[11px] text-muted-foreground md:inline">Ctrl K</kbd>
      </div>

      {mostrar && (
        <div id={idLista} role="listbox" className="absolute inset-x-0 top-full z-40 mt-2 overflow-hidden rounded-2xl border bg-card p-1.5">
          {resultados.map((r, i) => {
            const Icone = r.icone
            return (
              <div
                key={r.grupo + r.id}
                id={`${idLista}-${i}`}
                role="option"
                aria-selected={i === ativo}
                onMouseDown={(e) => {
                  e.preventDefault()
                  r.abrir()
                  limpar()
                }}
                onMouseEnter={() => setAtivo(i)}
                className={cn('flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-3', i === ativo && 'bg-lilac')}
              >
                <Icone className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} aria-hidden />
                <span className="min-w-0 flex-1 truncate">{r.titulo}</span>
                <span className="text-xs text-muted-foreground">{r.grupo}</span>
              </div>
            )
          })}
          <div className={cn('flex min-h-11 items-center gap-3 px-3 text-[13px] text-muted-foreground', resultados.length && 'border-t')}>
            <Lightbulb className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
            <span className="min-w-0 flex-1 truncate">
              Enter salva “{texto.trim()}” como ideia
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
