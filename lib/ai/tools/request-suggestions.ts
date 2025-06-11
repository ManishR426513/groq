// Tool for generating suggestions
export interface SuggestionParams {
  context: string
  type?: 'questions' | 'topics' | 'followup'
  count?: number
}

export interface Suggestion {
  text: string
  type: string
  relevance: number
}

export async function requestSuggestions(params: SuggestionParams): Promise<Suggestion[]> {
  // Simple implementation - in a real app, this might use AI to generate suggestions
  const { context, type = 'questions', count = 3 } = params
  
  const suggestions: Suggestion[] = []
  
  // Generate simple suggestions based on type
  switch (type) {
    case 'questions':
      suggestions.push(
        { text: 'Can you explain this in more detail?', type: 'question', relevance: 0.8 },
        { text: 'What are the main benefits?', type: 'question', relevance: 0.7 },
        { text: 'How does this work?', type: 'question', relevance: 0.6 }
      )
      break
    case 'topics':
      suggestions.push(
        { text: 'Related concepts', type: 'topic', relevance: 0.8 },
        { text: 'Alternative approaches', type: 'topic', relevance: 0.7 },
        { text: 'Best practices', type: 'topic', relevance: 0.6 }
      )
      break
    case 'followup':
      suggestions.push(
        { text: 'Tell me more about this', type: 'followup', relevance: 0.8 },
        { text: 'What are the next steps?', type: 'followup', relevance: 0.7 },
        { text: 'Can you provide examples?', type: 'followup', relevance: 0.6 }
      )
      break
  }
  
  return suggestions.slice(0, count)
}

// Tool definition for AI to use
export const requestSuggestionsTool = {
  name: 'request_suggestions',
  description: 'Generate helpful suggestions based on the conversation context',
  parameters: {
    type: 'object',
    properties: {
      context: {
        type: 'string',
        description: 'The conversation context to generate suggestions for'
      },
      type: {
        type: 'string',
        enum: ['questions', 'topics', 'followup'],
        description: 'The type of suggestions to generate'
      },
      count: {
        type: 'number',
        description: 'Number of suggestions to generate (default: 3)'
      }
    },
    required: ['context']
  }
}
