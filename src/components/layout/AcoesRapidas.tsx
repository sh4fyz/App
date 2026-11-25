import { createContext, useContext, useState, type FormEvent, type ReactNode } from 'react'
import { Bell, CheckSquare, StickyNote } from 'lucide-react'
import { toast } from 'sonner'
import { GavetaRapida } from '@/components/comum/GavetaRapida'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useDados } from '@/data/dados'
import { hoje, iso, somarDias } from '@/lib/datas'

type Tipo = 'tarefa' | 'lembrete' | 'nota'
const Contexto = createContext<(tipo?: Tipo) => void>(() => {})
export const useAcoesRapidas = () => useContext(Contexto)

const opcoes: { tipo: Tipo; titulo: string; icone: typeof Bell }[] = [
  { tipo: 'tarefa', titulo: 'Tarefa', icone: CheckSquare },
  { tipo: 'lembrete', titulo: 'Lembrete', icone: Bell },
  { tipo: 'nota', titulo: 'Nota', icone: StickyNote },
]

const titulos: Record<Tipo, string> = { tarefa: 'Nova tarefa', lembrete: 'Novo lembrete', nota: 'Nova nota' }

export function AcoesRapidasProvider({ children }: { children: ReactNode }) {
  const [aberta, setAberta] = useState(false)
  const [tipo, setTipo] = useState<Tipo | null>(null)
  const dados = useDados()

  function abrir(t?: Tipo) {
    setTipo(t ?? null)
    setAberta(true)
  }

  function salvar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const texto = String(fd.get('texto') ?? '').trim()
    if (!texto || !tipo) return
    if (tipo === 'tarefa') {
      dados.adicionarTarefa(texto)
      toast('Tarefa adicionada')
    } else if (tipo === 'lembrete') {
      dados.adicionarLembrete(texto, String(fd.get('quando') || iso(somarDias(hoje(), 1))))
      toast('Lembrete criado')
    } else {
      dados.adicionarNota(texto, 'nota')
      toast('Nota salva')
    }
    setAberta(false)
  }

  return (
    <Contexto.Provider value={abrir}>
      {children}
      <GavetaRapida aberta={aberta} aoMudar={setAberta} titulo={tipo ? titulos[tipo] : 'Adicionar'}>
        {!tipo ? (
          <div className="grid grid-cols-3 gap-2">
            {opcoes.map(({ tipo: t, titulo, icone: Icone }) => (
              <button
                key={t}
                type="button"
                onClick={() => setTipo(t)}
                className="flex min-h-20 flex-col items-center justify-center gap-2 rounded-xl border bg-card text-sm font-medium hover:bg-lilac focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none"
              >
                <Icone className="size-5 text-primary" strokeWidth={1.75} aria-hidden />
                {titulo}
              </button>
            ))}
          </div>
        ) : (
          <form onSubmit={salvar} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="acao-texto">{tipo === 'nota' ? 'Nota' : 'O que é?'}</Label>
              <Input
                id="acao-texto"
                name="texto"
                autoFocus
                required
                autoComplete="off"
                placeholder={tipo === 'tarefa' ? 'Ex: ler texto de Psicologia Social' : tipo === 'lembrete' ? 'Ex: pagar conta de luz' : 'Escreva aqui'}
              />
            </div>
            {tipo === 'lembrete' && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="acao-quando">Quando</Label>
                <Input id="acao-quando" name="quando" type="date" defaultValue={iso(somarDias(hoje(), 1))} />
              </div>
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setTipo(null)}>
                Voltar
              </Button>
              <Button type="submit" className="flex-1">
                Salvar
              </Button>
            </div>
          </form>
        )}
      </GavetaRapida>
    </Contexto.Provider>
  )
}
