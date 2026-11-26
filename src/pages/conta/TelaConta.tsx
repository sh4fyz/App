import type { ReactNode } from 'react'

/** Moldura das telas de login, cadastro e senha */
export function TelaConta({ titulo, descricao, children }: { titulo: string; descricao?: string; children: ReactNode }) {
  return (
    <main className="flex min-h-dvh items-start justify-center px-4 pt-[max(env(safe-area-inset-top),12vh)] pb-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 grid size-11 place-items-center rounded-xl bg-primary text-base font-semibold text-primary-foreground" aria-hidden>
          M
        </div>
        <h1 className="text-[22px] font-semibold leading-tight tracking-tight">{titulo}</h1>
        {descricao && <p className="mt-1.5 text-sm text-muted-foreground">{descricao}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </main>
  )
}

const traducoes: [RegExp, string][] = [
  [/invalid login credentials/i, 'E-mail ou senha incorretos.'],
  [/email not confirmed/i, 'Confirme seu e-mail antes de entrar. O link está na sua caixa de entrada.'],
  [/user already registered/i, 'Já existe uma conta com esse e-mail. Tente entrar.'],
  [/signups? not allowed|signup is disabled/i, 'Novos cadastros estão desligados neste app.'],
  [/password should be at least (\d+)/i, 'A senha precisa ter pelo menos $1 caracteres.'],
  [/rate limit|too many/i, 'Muitas tentativas seguidas. Espere um minuto e tente de novo.'],
  [/failed to fetch|network/i, 'Sem conexão com o servidor. Confira a internet.'],
  [/same.*password|different from the old/i, 'A nova senha precisa ser diferente da anterior.'],
]

export function traduzirErro(msg: string) {
  for (const [re, pt] of traducoes) {
    const m = msg.match(re)
    if (m) return pt.replace('$1', m[1] ?? '')
  }
  return 'Algo deu errado. Tente de novo em instantes.'
}
