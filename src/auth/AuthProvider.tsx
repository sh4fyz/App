import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

type Auth = {
  sessao: Session | null
  carregando: boolean
  /** true depois de abrir o link de "esqueci a senha" */
  recuperandoSenha: boolean
  terminarRecuperacao: () => void
}

const Contexto = createContext<Auth>({ sessao: null, carregando: true, recuperandoSenha: false, terminarRecuperacao: () => {} })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessao, setSessao] = useState<Session | null>(null)
  const [carregando, setCarregando] = useState(!!supabase)
  const [recuperandoSenha, setRecuperando] = useState(false)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => {
      setSessao(data.session)
      setCarregando(false)
    })
    const { data } = supabase.auth.onAuthStateChange((evento, s) => {
      setSessao(s)
      if (evento === 'PASSWORD_RECOVERY') setRecuperando(true)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  return (
    <Contexto.Provider value={{ sessao, carregando, recuperandoSenha, terminarRecuperacao: () => setRecuperando(false) }}>
      {children}
    </Contexto.Provider>
  )
}

export const useAuth = () => useContext(Contexto)
