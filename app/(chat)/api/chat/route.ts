import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/(auth)/auth'
import { saveMessage, getChatById, getAgentById, getKnowledgeByAgentId } from '@/lib/db/queries'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      id: chatId, 
      message, 
      selectedChatModel = 'llama-3.1-8b-instant',
      selectedVisibilityType = 'private',
      agentId // New: For agentic chat mode
    } = body

    // Get API key from environment
    const apiKey = process.env.GROQ_API_KEY || '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'

    // Prepare messages for Groq API
    let messages = [
      {
        role: 'user',
        content: message.content
      }
    ]

    let systemPrompt = "You are a helpful AI assistant powered by Groq."

    // Handle Agentic Chat Mode
    if (agentId) {
      const agent = await getAgentById(agentId)
      if (agent) {
        systemPrompt = agent.systemPrompt
        
        // Get knowledge base for context
        const knowledge = await getKnowledgeByAgentId(agentId)
        if (knowledge.length > 0) {
          const knowledgeContext = knowledge.map(k => k.content).join('\n\n---\n\n')
          systemPrompt += `\n\nKnowledge Base:\n${knowledgeContext}`
        }
      }
    }

    // Add system prompt to messages
    messages.unshift({
      role: 'system',
      content: systemPrompt
    })

    // Call Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: selectedChatModel,
        messages,
        temperature: 0.7,
        max_tokens: 1024,
        stream: false
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Groq API Error:', errorText)
      return NextResponse.json(
        { error: 'Failed to get AI response' },
        { status: response.status }
      )
    }

    const data = await response.json()
    const assistantContent = data.choices[0]?.message?.content || 'No response from AI'

    // Save user message to database
    const userMessage = await saveMessage({
      chatId,
      role: 'user',
      content: message.content,
      parts: [{ type: 'text', text: message.content }],
      attachments: message.experimental_attachments || []
    })

    // Save assistant message to database
    const assistantMessage = await saveMessage({
      chatId,
      role: 'assistant', 
      content: assistantContent,
      parts: [{ type: 'text', text: assistantContent }],
      attachments: []
    })

    // Return response in format expected by AI SDK
    return NextResponse.json({
      id: assistantMessage.id,
      role: 'assistant',
      content: assistantContent,
      parts: [{ type: 'text', text: assistantContent }],
      createdAt: assistantMessage.createdAt
    })

  } catch (error) {
    console.error('Chat API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Groq Chat API is working' })
}
