import { NextRequest, NextResponse } from 'next/server'
import { getSuggestionsByDocumentId } from '@/lib/db/queries'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get('documentId')
    
    if (!documentId) {
      return NextResponse.json(
        { error: 'documentId parameter is required' },
        { status: 400 }
      )
    }

    // Fix: Pass just the documentId string, not an object
    const suggestions = await getSuggestionsByDocumentId(documentId)
    
    return NextResponse.json({ suggestions })
    
  } catch (error) {
    console.error('Error getting suggestions:', error)
    return NextResponse.json(
      { error: 'Failed to get suggestions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { documentId, suggestion, userId } = body
    
    if (!documentId || !suggestion) {
      return NextResponse.json(
        { error: 'documentId and suggestion are required' },
        { status: 400 }
      )
    }

    // In a real implementation, you'd save the suggestion to the database
    const newSuggestion = {
      id: Date.now().toString(),
      documentId,
      content: suggestion,
      userId: userId || 'default-user',
      createdAt: new Date()
    }
    
    console.log('Created suggestion:', newSuggestion)
    
    return NextResponse.json({ suggestion: newSuggestion })
    
  } catch (error) {
    console.error('Error creating suggestion:', error)
    return NextResponse.json(
      { error: 'Failed to create suggestion' },
      { status: 500 }
    )
  }
}
