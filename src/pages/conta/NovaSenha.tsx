import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Campo } from '@/components/formularios/partes'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/auth/AuthProvider'
import { TelaConta, traduzirErro } from './TelaConta'

export default function NovaSenha() {
  const { terminarRecuperacao } = useAuth()
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function salvar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const senha = String(fd.get('senha'))
    if (senha !== String(fd.get('repetir'))) return setErro('As duas senhas não são iguais.')
    setEnviando(true)
    const { error } = await supabase!.auth.updateUser({ password: senha })
    setEnviando(false)
    if (error) return setErro(traduzirErro(error.message))
    toast('Senha trocada')
    terminarRecuperacao()
  }

  return (
    <TelaConta titulo="Nova senha" descricao="Escolha uma senha nova para entrar no app.">
      <form onSubmit={salvar} className="flex flex-col gap-4">
        <Campo rotulo="Nova senha">{(id) => <Input id={id} name="senha" type="password" required minLength={6} autoComplete="new-password" />}</Campo>
        <Campo rotulo="Repita a senha">{(id) => <Input id={id} name="repetir" type="password" required minLength={6} autoComplete="new-password" />}</Campo>
        {erro && <p role="alert" className="text-[13px] text-destructive">{erro}</p>}
        <Button type="submit" size="lg" disabled={enviando}>{enviando ? 'Salvando…' : 'Salvar senha'}</Button>
      </form>
    </TelaConta>
  )
}
