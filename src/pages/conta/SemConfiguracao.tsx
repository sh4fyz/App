import { TelaConta } from './TelaConta'

/** Aparece quando VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY não foram configuradas */
export default function SemConfiguracao() {
  return (
    <TelaConta titulo="Falta conectar o banco" descricao="O app ainda não sabe qual projeto do Supabase usar.">
      <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
        <li>Na Vercel, abra o projeto e vá em Settings → Environment Variables.</li>
        <li>Cadastre VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY com os valores do Supabase.</li>
        <li>Em Deployments, clique em Redeploy na versão mais recente.</li>
      </ol>
      <p className="mt-4 text-sm text-muted-foreground">O passo a passo completo está no README do repositório.</p>
    </TelaConta>
  )
}
