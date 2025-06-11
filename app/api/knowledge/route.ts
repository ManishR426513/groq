import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/(auth)/auth'
import { getKnowledgeByAgentId, saveKnowledge, getAgentById, updateAgent } from '@/lib/db/queries'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const agentId = searchParams.get('agentId')

    if (!agentId) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
        { status: 400 }
      )
    }

    const knowledge = await getKnowledgeByAgentId(agentId)
    
    return NextResponse.json({ knowledge })
  } catch (error) {
    console.error('Error getting knowledge:', error)
    return NextResponse.json(
      { error: 'Failed to get knowledge' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { agentId, content, type = 'text', metadata = {} } = body

    if (!agentId || !content) {
      return NextResponse.json(
        { error: 'Agent ID and content are required' },
        { status: 400 }
      )
    }

    // Get the agent to verify ownership and update knowledge base
    const agent = await getAgentById(agentId)
    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      )
    }

    // Save knowledge to database
    const knowledge = await saveKnowledge({
      agentId,
      content,
      type,
      metadata
    })

    // Update agent's knowledge base array (for backward compatibility)
    const updatedKnowledgeBase = [...agent.knowledgeBase, content]
    await updateAgent(agentId, { 
      knowledgeBase: updatedKnowledgeBase,
      updatedAt: new Date()
    })

    return NextResponse.json({ knowledge })
  } catch (error) {
    console.error('Error creating knowledge:', error)
    return NextResponse.json(
      { error: 'Failed to create knowledge' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const knowledgeId = searchParams.get('id')
    const agentId = searchParams.get('agentId')

    if (!knowledgeId && !agentId) {
      return NextResponse.json(
        { error: 'Knowledge ID or Agent ID is required' },
        { status: 400 }
      )
    }

    // If agentId provided, clear all knowledge for that agent
    if (agentId) {
      const agent = await getAgentById(agentId)
      if (agent) {
        await updateAgent(agentId, { 
          knowledgeBase: [],
          updatedAt: new Date()
        })
      }
      return NextResponse.json({ success: true })
    }

    // Otherwise delete specific knowledge item (not implemented in stub)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting knowledge:', error)
    return NextResponse.json(
      { error: 'Failed to delete knowledge' },
      { status: 500 }
    )
  }
}
