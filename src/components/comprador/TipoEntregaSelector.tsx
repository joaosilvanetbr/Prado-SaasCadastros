import { Warehouse, Store, GitBranch } from 'lucide-react'

interface TipoEntregaSelectorProps {
  entrega_cd: boolean
  entrega_loja: boolean
  cross_dock: boolean
  onChange: (campo: 'entrega_cd' | 'entrega_loja' | 'cross_dock', valor: boolean) => void
  disabled?: boolean
  error?: string
}

export default function TipoEntregaSelector({
  entrega_cd,
  entrega_loja,
  cross_dock,
  onChange,
  disabled = false,
  error,
}: TipoEntregaSelectorProps) {
  const opcoes = [
    {
      key: 'entrega_cd' as const,
      label: 'Entrega CD',
      description: 'Entrega via Centro de Distribuição',
      icon: Warehouse,
    },
    {
      key: 'entrega_loja' as const,
      label: 'Entrega Loja',
      description: 'Entrega direta nas lojas',
      icon: Store,
    },
    {
      key: 'cross_dock' as const,
      label: 'Cross Dock',
      description: 'Entrega via cross docking',
      icon: GitBranch,
    },
  ]

  const valores = { entrega_cd, entrega_loja, cross_dock }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Tipo de Entrega *
      </label>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {opcoes.map((opcao) => {
          const isSelected = valores[opcao.key]
          const Icon = opcao.icon
          
          return (
            <button
              key={opcao.key}
              type="button"
              onClick={() => !disabled && onChange(opcao.key, !isSelected)}
              disabled={disabled}
              className={`
                relative p-4 rounded-lg border-2 transition-all text-left
                ${isSelected 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 bg-white hover:border-gray-300'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="flex items-start gap-3">
                <div className={`
                  w-10 h-10 rounded-lg flex items-center justify-center
                  ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}
                `}>
                  <Icon size={20} />
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}>
                    {opcao.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {opcao.description}
                  </p>
                </div>
                <div className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center
                  ${isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300'}
                `}>
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="currentColor">
                      <path d="M10.28.28a.75.75 0 00-1.06-1.06L4.5 3.94 2.78 2.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.06 0l5.25-5.25z"/>
                    </svg>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  )
}