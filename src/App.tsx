import { Navigate, Route, Routes } from 'react-router'
import Layout from './components/Layout'
import OggiPage from './pages/OggiPage'
import SettimanaPage from './pages/SettimanaPage'
import MateriePage from './pages/MateriePage'
import ImpostazioniPage from './pages/ImpostazioniPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/oggi" replace />} />
        <Route path="oggi" element={<OggiPage />} />
        <Route path="settimana" element={<SettimanaPage />} />
        <Route path="materie" element={<MateriePage />} />
        <Route path="impostazioni" element={<ImpostazioniPage />} />
        <Route path="*" element={<Navigate to="/oggi" replace />} />
      </Route>
    </Routes>
  )
}