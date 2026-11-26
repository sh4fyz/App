import { BrowserRouter, Route, Routes } from 'react-router'
import { Layout } from '@/components/layout/Layout'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider, useAuth } from '@/auth/AuthProvider'
import { DadosProvider } from '@/data/dados'
import { supabase } from '@/lib/supabase'
import Inicio from '@/pages/Inicio'
import Mais from '@/pages/Mais'
import EmBreve from '@/pages/EmBreve'
import Configuracoes from '@/pages/Configuracoes'
import Entrar from '@/pages/conta/Entrar'
import NovaSenha from '@/pages/conta/NovaSenha'
import SemConfiguracao from '@/pages/conta/SemConfiguracao'

function Rotas() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Inicio />} />
          <Route path="trabalho" element={<EmBreve id="trabalho" etapa={4} />} />
          <Route path="estudos" element={<EmBreve id="estudos" etapa={4} />} />
          <Route path="financeiro" element={<EmBreve id="financeiro" etapa={4} />} />
          <Route path="estagio" element={<EmBreve id="estagio" etapa={5} />} />
          <Route path="arquivos" element={<EmBreve id="arquivos" etapa={5} voltarPara="/mais" />} />
          <Route path="habitos" element={<EmBreve id="habitos" etapa={5} voltarPara="/mais" />} />
          <Route path="ideias" element={<EmBreve id="ideias" etapa={5} voltarPara="/mais" />} />
          <Route path="configuracoes" element={<Configuracoes />} />
          <Route path="mais" element={<Mais />} />
          <Route path="*" element={<Inicio />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

function Portao() {
  const { sessao, carregando, recuperandoSenha } = useAuth()
  if (!supabase) return <SemConfiguracao />
  if (carregando) return <div className="min-h-dvh" aria-busy="true" />
  if (recuperandoSenha) return <NovaSenha />
  if (!sessao) return <Entrar />
  return (
    <DadosProvider>
      <Rotas />
    </DadosProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Portao />
      <Toaster />
    </AuthProvider>
  )
}
