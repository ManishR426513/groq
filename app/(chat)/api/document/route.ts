import { NextRequest, NextResponse } from 'next/server'
import type { ArtifactKind } from '@/components/artifact'
import {
  deleteDocumentsByIdAfterTimestamp,
  getDocumentsById,
  saveDocument,
} from '@/lib/db/queries'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID parameter is required' },
        { status: 400 }
      )
    }

    // Fix: Pass just the id string, not an object
    const documents = await getDocumentsById(id)
    
    return NextResponse.json({ documents })
  } catch (error) {
    console.error('Error getting documents:', error)
    return NextResponse.json(
      { error: 'Failed to get documents' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, kind } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    const document = {
      title,
      content,
      kind: kind as ArtifactKind,
      userId: 'default-user', // Replace with actual user ID
    }

    const savedDocument = await saveDocument(document)
    
    return NextResponse.json({ document: savedDocument })
  } catch (error) {
    console.error('Error saving document:', error)
    return NextResponse.json(
      { error: 'Failed to save document' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const timestamp = searchParams.get('timestamp')
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID parameter is required' },
        { status: 400 }
      )
    }

    const timestampDate = timestamp ? new Date(timestamp) : new Date()
    
    // Fix: Pass just the id string, not an object
    const success = await deleteDocumentsByIdAfterTimestamp(id, timestampDate)
    
    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { error: 'Failed to delete documents' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error deleting documents:', error)
    return NextResponse.json(
      { error: 'Failed to delete documents' },
      { status: 500 }
    )
  }
}
