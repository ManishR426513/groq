'use server'

import { getSuggestionsByDocumentId } from '@/lib/db/queries'

export async function getSuggestions({ documentId }: { documentId: string }) {
  // Fix: Pass just the documentId string, not an object
  const suggestions = await getSuggestionsByDocumentId(documentId)
  return suggestions ?? []
}
