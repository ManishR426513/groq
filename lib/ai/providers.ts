// Simple AI Provider that works with the artifacts system
export interface AIProvider {
  id: string
  name: string
  baseURL: string
  apiKey?: string
  languageModel: (modelId: string) => any
  imageModel: (modelId: string) => any
}

// Create a simple language model function that returns the model ID
function createLanguageModel(baseModelId: string) {
  return (modelId: string) => ({
    modelId: modelId || baseModelId,
    provider: 'groq',
    // Add any other properties the AI SDK might expect
    toString: () => modelId || baseModelId
  })
}

// Create a simple image model function
function createImageModel(baseModelId: string) {
  return (modelId: string) => ({
    modelId: modelId || baseModelId,
    provider: 'groq',
    type: 'image',
    // Add any other properties the AI SDK might expect
    toString: () => modelId || baseModelId
  })
}

export const GROQ_PROVIDER: AIProvider = {
  id: 'groq',
  name: 'Groq',
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
  languageModel: createLanguageModel('llama-3.1-8b-instant'),
  imageModel: createImageModel('llama-3.1-8b-instant') // Groq doesn't have image models, but we need this for compatibility
}

export const providers = {
  groq: GROQ_PROVIDER
}

// Add myProvider export that the artifacts code expects
export const myProvider = GROQ_PROVIDER

export function getProvider(id: string): AIProvider | undefined {
  return providers[id as keyof typeof providers]
}

export function getGroqProvider(): AIProvider {
  return GROQ_PROVIDER
}
