import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './contexts/AuthContext'
import LoginPage from './pages/LoginPage'
import AppLayout from './components/layout/AppLayout'
import DashboardPage from './pages/DashboardPage'
import ProcessosPage from './pages/ProcessosPage'
import NovoProcessoPage from './pages/NovoProcessoPage'
import ProcessoDetalhePage from './pages/ProcessoDetalhePage'
import FornecedorPage from './pages/FornecedorPage'
import CompradorPage from './pages/CompradorPage'
import AprovacoesPage from './pages/AprovacoesPage'
import AprovacaoDetalhePage from './pages/AprovacaoDetalhePage'
import CadastroPage from './pages/CadastroPage'
import CadastroDetalhePage from './pages/CadastroDetalhePage'

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/app/dashboard" /> : <LoginPage />} />
      <Route path="/fornecedor/:token" element={<FornecedorPage />} />
      
      <Route path="/app" element={isAuthenticated ? <AppLayout /> : <Navigate to="/login" />}>
        <Route index element={<Navigate to="/app/dashboard" />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="processos" element={<ProcessosPage />} />
        <Route path="processos/novo" element={<NovoProcessoPage />} />
        <Route path="processos/:id" element={<ProcessoDetalhePage />} />
        <Route path="processos/:id/comprador" element={<CompradorPage />} />
        <Route path="processos/:id/aprovacao" element={<AprovacaoDetalhePage />} />
        <Route path="aprovacoes" element={<AprovacoesPage />} />
        <Route path="cadastro" element={<CadastroPage />} />
        <Route path="cadastro/:id" element={<CadastroDetalhePage />} />
      </Route>

      <Route path="*" element={<Navigate to={isAuthenticated ? '/app/dashboard' : '/login'} />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}