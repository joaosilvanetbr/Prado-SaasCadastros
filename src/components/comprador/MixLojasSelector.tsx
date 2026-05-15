import { LOJAS_MIX } from '@/types/comprador'
import { Check } from 'lucide-react'

interface MixLojasSelectorProps {
  selecionadas: string[]
  onChange: (codigos: string[]) => void
  disabled?: boolean
  error?: string
}

export default function MixLojasSelector({
  selecionadas,
  onChange,
  disabled = false,
  error,
}: MixLojasSelectorProps) {
  const handleToggle = (codigo: string) => {
    if (disabled) return
    
    if (selecionadas.includes(codigo)) {
      onChange(selecionadas.filter(c => c !== codigo))
    } else {
      onChange([...selecionadas, codigo])
    }
  }

  const handleSelecionarTodas = () => {
    if (disabled) return
    onChange(LOJAS_MIX.map(l => l.codigo))
  }

  const handleLimparSelecao = () => {
    if (disabled) return
    onChange([])
  }

  const handleSelecionarCD = () => {
    if (disabled) return
    onChange(['99'])
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Mix de Lojas *
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSelecionarCD}
            disabled={disabled}
            className="text-xs text-blue-600 hover:text-blue-700 disabled:opacity-50"
          >
            Selecionar CD
          </button>
          <span className="text-gray-300">|</span>
          <button
            type="button"
            onClick={handleSelecionarTodas}
            disabled={disabled}
            className="text-xs text-blue-600 hover:text-blue-700 disabled:opacity-50"
          >
            Todas
          </button>
          <span className="text-gray-300">|</span>
          <button
            type="button"
            onClick={handleLimparSelecao}
            disabled={disabled}
            className="text-xs text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            Limpar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {LOJAS_MIX.map((loja) => {
          const isSelected = selecionadas.includes(loja.codigo)
          const isCD = loja.codigo === '99'
          
          return (
            <button
              key={loja.codigo}
              type="button"
              onClick={() => handleToggle(loja.codigo)}
              disabled={disabled}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-all
                ${isSelected 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${isCD ? 'col-span-3 md:col-span-1' : ''}
              `}
            >
              <div className={`
                w-5 h-5 rounded border flex items-center justify-center
                ${isSelected 
                  ? 'bg-blue-600 border-blue-600' 
                  : 'border-gray-300 bg-white'}
              `}>
                {isSelected && <Check size={14} className="text-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{loja.nome}</p>
                <p className="text-xs text-gray-500">{loja.codigo}</p>
              </div>
            </button>
          )
        })}
      </div>

      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}

      {selecionadas.length > 0 && (
        <p className="text-xs text-gray-500 mt-2">
          {selecionadas.length} loja(s) selecionada(s)
          {selecionadas.includes('99') && ' (inclui CD)'}
        </p>
      )}
    </div>
  )
}