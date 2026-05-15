import { ReactNode } from 'react'

interface FornecedorLayoutProps {
  children: ReactNode
}

export default function FornecedorLayout({ children }: FornecedorLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-900 text-white py-6">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-2xl font-bold">PRADO</h1>
          <p className="text-blue-200 mt-1">Cadastro de Produto - Preenchimento do Fornecedor</p>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          {children}
        </div>
      </main>

      <footer className="bg-gray-200 py-4 mt-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-gray-600">
          Ficha gerada automaticamente pelo Sistema de Cadastro de Produtos Prado.
        </div>
      </footer>
    </div>
  )
}