import { Link } from 'react-router'
import { ChevronLeft, LogOut } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Topo, TituloPagina } from '@/components/layout/Topo'
import { useAuth } from '@/auth/AuthProvider'
import { useDados } from '@/data/dados'
import { supabase } from '@/lib/supabase'

export default function Configuracoes() {
  const { sessao } = useAuth()
  const { online } = useDados()

  async function sair() {
    // apaga a cópia local dos dados deste aparelho
    if (sessao) localStorage.removeItem(`minha-agenda:cache:${sessao.user.id}`)
    await supabase?.auth.signOut()
  }
  return (
    <>
      <Link to="/mais" className="-ml-2 mb-2 inline-flex min-h-11 items-center gap-1 rounded-xl px-2 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" strokeWidth={1.75} aria-hidden />
        Voltar
      </Link>
      <Topo>
        <TituloPagina titulo="Configurações" />
      </Topo>
      <Card className="max-w-xl">
        <CardHeader>
          <div>
            <CardTitle>Conta</CardTitle>
            <CardDescription className="mt-1">{sessao?.user.email}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            {online ? 'Tudo sincronizado com o celular e o computador.' : 'Sem internet agora. Dá pra ver tudo, mas editar só com conexão.'}
          </p>
          <Button variant="outline" className="self-start" onClick={sair}>
            <LogOut strokeWidth={1.75} aria-hidden />
            Sair da conta
          </Button>
        </CardContent>
      </Card>
    </>
  )
}
