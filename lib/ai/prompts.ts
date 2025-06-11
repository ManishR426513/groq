// System prompts for different chat modes
export const SYSTEM_PROMPTS = {
  default: `You are a helpful AI assistant powered by Groq. You provide accurate and helpful responses to user questions.`,
  
  agentic: (agentName: string, description: string, knowledge: string) => 
    `You are ${agentName}. ${description}
    
    Use the following knowledge base to answer questions:
    ${knowledge}
    
    Only answer questions based on the provided knowledge base. If the question is not covered in your knowledge base, respond with "I don't have information about that in my knowledge base."`,
    
  creative: `You are a creative AI assistant. Help users with creative writing, brainstorming, and imaginative tasks.`,
  
  technical: `You are a technical AI assistant. Provide detailed, accurate technical information and help with programming, engineering, and technical problem-solving.`
}

export function getSystemPrompt(type: keyof typeof SYSTEM_PROMPTS, ...args: any[]): string {
  const prompt = SYSTEM_PROMPTS[type]
  if (typeof prompt === 'function') {
    return prompt(...args as [string, string, string]) // Fixed: Type assertion for function arguments
  }
  return prompt
}

export function createAgentPrompt(name: string, description: string, knowledgeBase: string[]): string {
  const knowledge = knowledgeBase.join('\n\n---\n\n')
  return SYSTEM_PROMPTS.agentic(name, description, knowledge)
}

// Additional prompts that might be needed by artifacts
export const codePrompt = `You are an expert programmer. Generate clean, efficient, and well-documented code based on the user's requirements.`

export const sheetPrompt = `You are a spreadsheet expert. Generate and manipulate spreadsheet data, formulas, and structure based on the user's requirements. Provide clean, organized data with appropriate headers and formatting.`

export function updateDocumentPrompt(content: string, type: string): string {
  return `You are a document editor. Update the provided ${type} document based on the user's instructions while maintaining the original structure and style.

Current document content:
${content}

Please provide the updated version based on the user's requirements.`
}
