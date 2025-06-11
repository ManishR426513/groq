// Remove the broken import: import { ... } from './db/utils'

// Define constants directly
export const APP_NAME = 'Groq AI Chat'
export const APP_DESCRIPTION = 'AI Chatbot powered by Groq'

export const MODELS = [
  { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B (Fast)' },
  { id: 'llama-3.1-70b-versatile', name: 'Llama 3.1 70B' },
  { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B' },
  { id: 'gemma2-9b-it', name: 'Gemma2 9B' }
]

export const DEFAULT_MODEL = 'llama-3.1-8b-instant'

// Other constants that might be needed
export const MAX_MESSAGES = 100
export const MAX_TOKENS = 1024

// Guest user regex for sidebar
export const guestRegex = /^guest-/
