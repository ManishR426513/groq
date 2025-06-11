import { NextRequest, NextResponse } from 'next/server'
import { getChatsByUserId } from '@/lib/db/queries'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Get parameters from URL
    const userId = searchParams.get('userId') || 'default-user'
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50
    const startingAfter = searchParams.get('startingAfter')
    const endingBefore = searchParams.get('endingBefore')

    // For now, our getChatsByUserId function only takes userId
    // In a real implementation, you'd modify the function to handle pagination
    const chats = await getChatsByUserId(userId)
    
    // Simple pagination simulation (in a real app, this would be done in the database query)
    let filteredChats = chats
    
    if (startingAfter) {
      const startIndex = chats.findIndex(chat => chat.id === startingAfter)
      if (startIndex !== -1) {
        filteredChats = chats.slice(startIndex + 1)
      }
    }
    
    if (endingBefore) {
      const endIndex = filteredChats.findIndex(chat => chat.id === endingBefore)
      if (endIndex !== -1) {
        filteredChats = filteredChats.slice(0, endIndex)
      }
    }
    
    // Apply limit
    const limitedChats = filteredChats.slice(0, limit)
    
    return NextResponse.json({ 
      chats: limitedChats,
      hasMore: filteredChats.length > limit
    })
    
  } catch (error) {
    console.error('Error getting chat history:', error)
    return NextResponse.json(
      { error: 'Failed to get chat history' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'default-user'
    
    // In a real implementation, you'd delete all chats for the user
    // For now, just return success
    console.log('Deleting chat history for user:', userId)
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Error deleting chat history:', error)
    return NextResponse.json(
      { error: 'Failed to delete chat history' },
      { status: 500 }
    )
  }
}
