// Database utilities - simplified for in-memory storage
export interface Chat {
  id: string
  title: string
  userId: string
  createdAt: Date
  updatedAt: Date
  visibility: 'public' | 'private'
}

export interface Message {
  id: string
  chatId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  parts: any[] // Template expects this for AI SDK compatibility
  attachments?: any[] // Template expects this for file attachments
  createdAt: Date
}

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

// In-memory storage (replace with real database later)
const chats: Chat[] = []
const messages: Message[] = []
const agents: Agent[] = []
const knowledge: Knowledge[] = []

export async function createChat(userId: string, title: string): Promise<Chat> {
  const chat: Chat = {
    id: Date.now().toString(),
    title,
    userId,
    createdAt: new Date(),
    updatedAt: new Date(),
    visibility: 'private'
  }
  chats.push(chat)
  return chat
}

export async function getChatsByUserId(userId: string): Promise<Chat[]> {
  return chats.filter(chat => chat.userId === userId)
}

export async function getChatById(id: string): Promise<Chat | null> {
  return chats.find(chat => chat.id === id) || null
}

export async function updateChat(id: string, updates: Partial<Chat>): Promise<Chat | null> {
  const chatIndex = chats.findIndex(chat => chat.id === id)
  if (chatIndex === -1) return null
  
  chats[chatIndex] = { ...chats[chatIndex], ...updates, updatedAt: new Date() }
  return chats[chatIndex]
}

export async function deleteChat(id: string): Promise<boolean> {
  const chatIndex = chats.findIndex(chat => chat.id === id)
  if (chatIndex === -1) return false
  
  chats.splice(chatIndex, 1)
  // Also delete associated messages
  const messageIndices = messages.map((msg, i) => msg.chatId === id ? i : -1).filter(i => i !== -1)
  messageIndices.reverse().forEach(i => messages.splice(i, 1))
  
  return true
}

// Agent-related functions
export async function createAgent(agentData: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>): Promise<Agent> {
  const agent: Agent = {
    id: Date.now().toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...agentData
  }
  agents.push(agent)
  return agent
}

export async function getAgentsByUserId(userId: string): Promise<Agent[]> {
  return agents.filter(agent => agent.userId === userId)
}

export async function getAgentById(id: string): Promise<Agent | null> {
  return agents.find(agent => agent.id === id) || null
}

export async function updateAgent(id: string, updates: Partial<Agent>): Promise<Agent | null> {
  const agentIndex = agents.findIndex(agent => agent.id === id)
  if (agentIndex === -1) return null
  
  agents[agentIndex] = { ...agents[agentIndex], ...updates, updatedAt: new Date() }
  return agents[agentIndex]
}

export async function deleteAgent(id: string): Promise<boolean> {
  const agentIndex = agents.findIndex(agent => agent.id === id)
  if (agentIndex === -1) return false
  
  agents.splice(agentIndex, 1)
  // Also delete associated knowledge
  const knowledgeIndices = knowledge.map((k, i) => k.agentId === id ? i : -1).filter(i => i !== -1)
  knowledgeIndices.reverse().forEach(i => knowledge.splice(i, 1))
  
  return true
}

// Knowledge-related functions
export async function createKnowledge(knowledgeData: Omit<Knowledge, 'id' | 'createdAt'>): Promise<Knowledge> {
  const newKnowledge: Knowledge = {
    id: Date.now().toString(),
    createdAt: new Date(),
    ...knowledgeData
  }
  knowledge.push(newKnowledge)
  return newKnowledge
}

export async function getKnowledgeByAgentId(agentId: string): Promise<Knowledge[]> {
  return knowledge.filter(k => k.agentId === agentId)
}
