import { 
  Chat, 
  Message, 
  Agent, 
  Knowledge,
  getChatById as getChatByIdUtil, 
  getChatsByUserId as getChatsByUserIdUtil,
  createAgent,
  getAgentsByUserId as getAgentsByUserIdUtil,
  getAgentById as getAgentByIdUtil,
  updateAgent as updateAgentUtil,
  deleteAgent as deleteAgentUtil,
  createKnowledge,
  getKnowledgeByAgentId as getKnowledgeByAgentIdUtil
} from './utils'

// Query functions for database operations
export async function getUserChats(userId: string): Promise<Chat[]> {
  return getChatsByUserIdUtil(userId)
}

export async function getChat(id: string, userId: string): Promise<Chat | null> {
  const chat = await getChatByIdUtil(id)
  if (!chat || chat.userId !== userId) return null
  return chat
}

export async function getChatMessages(chatId: string): Promise<Message[]> {
  // This would normally query the database
  // For now, return empty array
  return []
}

export async function saveMessage(message: Omit<Message, 'id' | 'createdAt'>): Promise<Message> {
  const newMessage: Message = {
    id: Date.now().toString(),
    createdAt: new Date(),
    ...message,
    parts: message.parts || [{ type: 'text', text: message.content }],
    attachments: message.attachments || []
  }
  
  // In a real app, save to database
  // For now, just return the message
  return newMessage
}

export async function updateChatTitle(chatId: string, title: string): Promise<boolean> {
  // In a real app, update the database
  // For now, just return success
  return true
}

export async function deleteChatMessages(chatId: string, fromMessageId?: string): Promise<boolean> {
  // In a real app, delete from database
  // For now, just return success
  return true
}

// Additional exports needed by API routes
export async function getDocumentsById(id: string): Promise<any[]> {
  // Simple stub for documents
  return []
}

export async function saveDocument(document: any): Promise<any> {
  // Simple stub for saving documents
  return { id: Date.now().toString(), ...document }
}

export async function deleteDocumentsByIdAfterTimestamp(id: string, timestamp: Date): Promise<boolean> {
  // Simple stub
  return true
}

export async function getChatsByUserId(userId: string): Promise<Chat[]> {
  return getUserChats(userId)
}

export async function getSuggestionsByDocumentId(documentId: string): Promise<any[]> {
  // Simple stub for suggestions
  return []
}

export async function getChatById(id: string): Promise<Chat | null> {
  return getChat(id, 'default-user')
}

export async function getVotesByChatId(chatId: string): Promise<any[]> {
  // Simple stub for votes
  return []
}

export async function voteMessage(messageId: string, vote: 'up' | 'down', userId: string): Promise<boolean> {
  // Simple stub for voting
  return true
}

export async function getMessagesByChatId(chatId: string): Promise<Message[]> {
  return getChatMessages(chatId)
}

// Agent-related queries for your functionality
export async function getAgentsByUserId(userId: string): Promise<Agent[]> {
  return getAgentsByUserIdUtil(userId)
}

export async function getAgentById(id: string): Promise<Agent | null> {
  return getAgentByIdUtil(id)
}

export async function saveAgent(agent: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>): Promise<Agent> {
  return createAgent(agent)
}

export async function updateAgent(id: string, updates: Partial<Agent>): Promise<Agent | null> {
  return updateAgentUtil(id, updates)
}

export async function deleteAgent(id: string): Promise<boolean> {
  return deleteAgentUtil(id)
}

export async function getKnowledgeByAgentId(agentId: string): Promise<Knowledge[]> {
  return getKnowledgeByAgentIdUtil(agentId)
}

export async function saveKnowledge(knowledge: Omit<Knowledge, 'id' | 'createdAt'>): Promise<Knowledge> {
  return createKnowledge(knowledge)
}
