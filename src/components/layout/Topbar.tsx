import { useAuth } from '@/contexts/AuthContext'
import { LogOut } from 'lucide-react'

export default function Topbar() {
  const { profile, signOut } = useAuth()

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div>
        <h2 className="text-lg font-medium text-gray-700">
          Bem-vindo, {profile?.nome || 'Usuário'}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">{profile?.email}</span>
        <button
          onClick={() => signOut()}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <LogOut size={18} />
          <span>Sair</span>
        </button>
      </div>
    </header>
  )
}