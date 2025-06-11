export interface Model {
  id: string
  name: string
  description?: string
  maxTokens?: number
}

export const MODELS: Model[] = [
  {
    id: 'llama-3.1-8b-instant',
    name: 'Llama 3.1 8B (Fast)',
    description: 'Fast and efficient model',
    maxTokens: 8192
  },
  {
    id: 'llama-3.1-70b-versatile',
    name: 'Llama 3.1 70B',
    description: 'More capable model',
    maxTokens: 8192
  },
  {
    id: 'mixtral-8x7b-32768',
    name: 'Mixtral 8x7B',
    description: 'High context window',
    maxTokens: 32768
  },
  {
    id: 'gemma2-9b-it',
    name: 'Gemma2 9B',
    description: 'Google\'s Gemma model',
    maxTokens: 8192
  }
]

// Add this line - the missing export that the test needs:
export const chatModels = MODELS;

export const DEFAULT_MODEL = 'llama-3.1-8b-instant'
export const DEFAULT_CHAT_MODEL = 'llama-3.1-8b-instant'

export function getModelById(id: string): Model | undefined {
  return MODELS.find(model => model.id === id)
}
