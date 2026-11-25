import { BrowserRouter, Route, Routes } from 'react-router'
import { Layout } from '@/components/layout/Layout'
import { DadosProvider } from '@/data/dados'
import Inicio from '@/pages/Inicio'
import Mais from '@/pages/Mais'
import EmBreve from '@/pages/EmBreve'

export default function App() {
  return (
    <DadosProvider>
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
            <Route path="configuracoes" element={<EmBreve id="configuracoes" etapa={3} voltarPara="/mais" />} />
            <Route path="mais" element={<Mais />} />
            <Route path="*" element={<Inicio />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DadosProvider>
  )
}
