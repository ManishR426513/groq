// Database schema definitions compatible with Vercel AI template
export interface User {
  id: string
  email?: string
  name?: string
  createdAt: Date
  updatedAt: Date
}

export interface Chat {
  id: string
  title: string
  userId: string
  createdAt: Date
  updatedAt: Date
  visibility: 'public' | 'private'
}

// Updated Message interface to match template expectations
export interface Message {
  id: string
  chatId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  parts: any[] // Template expects this for AI SDK compatibility
  attachments?: any[] // Template expects this for file attachments
  createdAt: Date
}

export interface Document {
  id: string
  title: string
  content: string
  kind?: 'text' | 'code' | 'image' | 'sheet' // Add kind property for artifacts
  userId: string
  createdAt: Date
  updatedAt?: Date // Make optional since not all document objects have this
}

export interface Suggestion {
  id: string
  documentId: string
  content: string
  createdAt: Date
}

export interface Vote {
  id: string
  messageId: string
  userId: string
  vote: 'up' | 'down'
  createdAt: Date
}

// Add Agent types for your functionality
export interface Agent {
  id: string
  name: string
  description: string
  knowledgeBase: string[]
  systemPrompt: string
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface Knowledge {
  id: string
  agentId: string
  content: string
  type: 'text' | 'file' | 'url'
  metadata?: Record<string, any>
  createdAt: Date
}

// Type definitions for database operations
export type NewUser = Omit<User, 'id' | 'createdAt' | 'updatedAt'>
export type NewChat = Omit<Chat, 'id' | 'createdAt' | 'updatedAt'>
export type NewMessage = Omit<Message, 'id' | 'createdAt'>
export type NewDocument = Omit<Document, 'id' | 'createdAt' | 'updatedAt'>
export type NewSuggestion = Omit<Suggestion, 'id' | 'createdAt'>
export type NewVote = Omit<Vote, 'id' | 'createdAt'>
export type NewAgent = Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>
export type NewKnowledge = Omit<Knowledge, 'id' | 'createdAt'>

// REMOVED: The duplicate export type statement that was causing the conflict
// export type { User, Chat, Message, Document, Suggestion, Vote, Agent, Knowledge }
