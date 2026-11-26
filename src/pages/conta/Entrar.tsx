import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Campo } from '@/components/formularios/partes'
import { supabase } from '@/lib/supabase'
import { TelaConta, traduzirErro } from './TelaConta'

type Modo = 'entrar' | 'criar' | 'esqueci'

const textos: Record<Modo, { titulo: string; descricao: string; botao: string }> = {
  entrar: { titulo: 'Entrar', descricao: 'Use seu e-mail e senha.', botao: 'Entrar' },
  criar: { titulo: 'Criar conta', descricao: 'Seus dados ficam salvos e sincronizados entre celular e computador.', botao: 'Criar conta' },
  esqueci: { titulo: 'Esqueci a senha', descricao: 'A gente manda um link para você criar uma senha nova.', botao: 'Enviar link' },
}

export default function Entrar() {
  const [modo, setModo] = useState<Modo>('entrar')
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const [enviando, setEnviando] = useState(false)
  const t = textos[modo]

  function trocar(m: Modo) {
    setModo(m)
    setErro('')
    setAviso('')
  }

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!supabase) return
    const fd = new FormData(e.currentTarget)
    const email = String(fd.get('email')).trim()
    const senha = String(fd.get('senha') ?? '')
    setErro('')
    setAviso('')
    setEnviando(true)
    const voltarPara = window.location.origin
    let resposta
    if (modo === 'entrar') resposta = await supabase.auth.signInWithPassword({ email, password: senha })
    else if (modo === 'criar') resposta = await supabase.auth.signUp({ email, password: senha, options: { emailRedirectTo: voltarPara } })
    else resposta = await supabase.auth.resetPasswordForEmail(email, { redirectTo: voltarPara })
    setEnviando(false)
    if (resposta.error) return setErro(traduzirErro(resposta.error.message))
    if (modo === 'criar' && !('session' in resposta.data && resposta.data.session)) {
      setAviso('Conta criada. Abra o link que mandamos para o seu e-mail para confirmar e depois entre aqui.')
      setModo('entrar')
    }
    if (modo === 'esqueci') setAviso('Pronto. Se existir uma conta com esse e-mail, o link chega em instantes.')
  }

  return (
    <TelaConta titulo={t.titulo} descricao={t.descricao}>
      <form onSubmit={enviar} className="flex flex-col gap-4">
        <Campo rotulo="E-mail">{(id) => <Input id={id} name="email" type="email" required autoComplete="email" inputMode="email" />}</Campo>
        {modo !== 'esqueci' && (
          <Campo rotulo="Senha">
            {(id) => (
              <Input id={id} name="senha" type="password" required minLength={6} autoComplete={modo === 'criar' ? 'new-password' : 'current-password'} />
            )}
          </Campo>
        )}
        {erro && <p role="alert" className="text-[13px] text-destructive">{erro}</p>}
        {aviso && <p role="status" className="rounded-xl bg-lilac px-4 py-3 text-[13px] text-accent-foreground">{aviso}</p>}
        <Button type="submit" size="lg" disabled={enviando}>
          {enviando ? 'Aguarde…' : t.botao}
        </Button>
      </form>

      <div className="mt-6 flex flex-col items-start gap-1 text-sm">
        {modo === 'entrar' ? (
          <>
            <Button variant="link" className="h-auto min-h-11 px-0" onClick={() => trocar('esqueci')}>Esqueci a senha</Button>
            <Button variant="link" className="h-auto min-h-11 px-0" onClick={() => trocar('criar')}>Ainda não tenho conta</Button>
          </>
        ) : (
          <Button variant="link" className="h-auto min-h-11 px-0" onClick={() => trocar('entrar')}>Voltar para o login</Button>
        )}
      </div>
    </TelaConta>
  )
}
