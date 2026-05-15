import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { LayoutDashboard, FileText, PlusCircle, Package, CheckCircle } from 'lucide-react'

const menuItems = [
  { path: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/app/processos', label: 'Processos', icon: FileText },
  { path: '/app/processos/novo', label: 'Novo Processo', icon: PlusCircle },
]

export default function Sidebar() {
  const location = useLocation()
  const { profile } = useAuth()

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-blue-900 text-white">
      <div className="p-6 border-b border-blue-800">
        <h1 className="text-xl font-bold">Cadastro Prado</h1>
        <p className="text-sm text-blue-200 mt-1">Sistema de Cadastro</p>
      </div>

      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-800 text-white'
                      : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}

          {(profile?.perfil === 'cadastro' || profile?.pode_cadastrar || profile?.perfil === 'admin') && (
            <li>
              <Link
                to="/app/cadastro"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === '/app/cadastro' || location.pathname.startsWith('/app/cadastro/')
                    ? 'bg-blue-800 text-white'
                    : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                }`}
              >
                <Package size={20} />
                <span>Cadastro</span>
              </Link>
            </li>
          )}

          {profile?.pode_aprovar && (
            <li>
              <Link
                to="/app/aprovacoes"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === '/app/aprovacoes'
                    ? 'bg-blue-800 text-white'
                    : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                }`}
              >
                <CheckCircle size={20} />
                <span>Aprovações</span>
              </Link>
            </li>
          )}
        </ul>
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-800">
        <div className="text-sm text-blue-200">
          <p className="font-medium text-white">{profile?.nome}</p>
          <p className="text-xs capitalize">{profile?.perfil}</p>
        </div>
      </div>
    </aside>
  )
}