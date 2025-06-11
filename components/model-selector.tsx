import type { Session } from 'next-auth'

// Define models directly instead of importing
const MODELS = [
  { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B (Fast)' },
  { id: 'llama-3.1-70b-versatile', name: 'Llama 3.1 70B' },
  { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B' },
  { id: 'gemma2-9b-it', name: 'Gemma2 9B' }
]

interface ModelSelectorProps {
  selectedModelId: string
  onModelChange?: (model: string) => void
  className?: string
  session?: Session // Add session prop to match usage
}

export function ModelSelector({ selectedModelId, onModelChange, className, session }: ModelSelectorProps) {
  return (
    <select 
      value={selectedModelId} 
      onChange={(e) => onModelChange?.(e.target.value)}
      className={`bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-gray-100 ${className || ''}`}
    >
      {MODELS.map((model) => (
        <option key={model.id} value={model.id}>
          {model.name}
        </option>
      ))}
    </select>
  )
}
