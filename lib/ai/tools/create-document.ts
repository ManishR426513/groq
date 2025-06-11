// Tool for creating documents
export interface CreateDocumentParams {
  title: string
  content: string
  userId?: string
}

export interface DocumentResult {
  id: string
  title: string
  content: string
  createdAt: Date
  userId?: string
}

export async function createDocument(params: CreateDocumentParams): Promise<DocumentResult> {
  // Simple implementation - in a real app, this would save to database
  const document: DocumentResult = {
    id: Date.now().toString(),
    title: params.title,
    content: params.content,
    createdAt: new Date(),
    userId: params.userId
  }
  
  console.log('Created document:', document.title)
  return document
}

// Tool definition for AI to use
export const createDocumentTool = {
  name: 'create_document',
  description: 'Create a new document with the given title and content',
  parameters: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        description: 'The title of the document'
      },
      content: {
        type: 'string',
        description: 'The content of the document'
      }
    },
    required: ['title', 'content']
  }
}
