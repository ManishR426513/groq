// Tool for updating documents
export interface UpdateDocumentParams {
  id: string
  title?: string
  content?: string
  userId?: string
}

export interface UpdateResult {
  success: boolean
  document?: {
    id: string
    title: string
    content: string
    updatedAt: Date
  }
  error?: string
}

export async function updateDocument(params: UpdateDocumentParams): Promise<UpdateResult> {
  // Simple implementation - in a real app, this would update database
  try {
    const updatedDocument = {
      id: params.id,
      title: params.title || 'Untitled Document',
      content: params.content || '',
      updatedAt: new Date()
    }
    
    console.log('Updated document:', params.id)
    return {
      success: true,
      document: updatedDocument
    }
  } catch (error) {
    return {
      success: false,
      error: 'Failed to update document'
    }
  }
}

// Tool definition for AI to use
export const updateDocumentTool = {
  name: 'update_document',
  description: 'Update an existing document with new title or content',
  parameters: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'The ID of the document to update'
      },
      title: {
        type: 'string',
        description: 'The new title for the document'
      },
      content: {
        type: 'string',
        description: 'The new content for the document'
      }
    },
    required: ['id']
  }
}
