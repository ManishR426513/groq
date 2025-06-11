'use client'

import { useState, useEffect, useRef } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface Agent {
  id: string
  name: string
  description: string
  knowledgeBase: string[]
  systemPrompt: string
  createdAt: Date
}

interface ChatHistory {
  id: string
  title: string
  messages: Message[]
  mode: 'global' | 'agentic'
  agentId?: string
  createdAt: Date
  updatedAt: Date
}

export default function Page() {
  // Your Groq API Key
  const GROQ_API_KEY = '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'
  
  // State
  const [chatMode, setChatMode] = useState<'global' | 'agentic'>('global')
  const [messages, setMessages] = useState<Message[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  // Chat History State
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Modal states
  const [showAgentCreator, setShowAgentCreator] = useState(false)
  const [showTrainer, setShowTrainer] = useState(false)
  
  // Form states
  const [messageInput, setMessageInput] = useState('')
  const [agentName, setAgentName] = useState('')
  const [agentDescription, setAgentDescription] = useState('')
  const [knowledgeInput, setKnowledgeInput] = useState('')
  const [selectedModel, setSelectedModel] = useState('llama-3.1-8b-instant')
  
  const messagesAreaRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load chat history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('chatHistory')
    const savedAgents = localStorage.getItem('agents')
    
    if (savedHistory) {
      const history = JSON.parse(savedHistory)
      setChatHistory(history)
    }
    
    if (savedAgents) {
      const agentsData = JSON.parse(savedAgents)
      setAgents(agentsData)
    }
  }, [])

  // Save to localStorage whenever history or agents change
  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory))
  }, [chatHistory])

  useEffect(() => {
    localStorage.setItem('agents', JSON.stringify(agents))
  }, [agents])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesAreaRef.current) {
      messagesAreaRef.current.scrollTop = messagesAreaRef.current.scrollHeight
    }
  }, [messages, isLoading])

  // Update current chat when messages change
  useEffect(() => {
    if (currentChatId && messages.length > 0) {
      setChatHistory(prev => prev.map(chat => 
        chat.id === currentChatId 
          ? { ...chat, messages, updatedAt: new Date() }
          : chat
      ))
    }
  }, [messages, currentChatId])

  // Create new chat
  const createNewChat = () => {
    const newChatId = Date.now().toString()
    const newChat: ChatHistory = {
      id: newChatId,
      title: 'New Chat',
      messages: [],
      mode: chatMode,
      agentId: currentAgent?.id,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    setChatHistory(prev => [newChat, ...prev])
    setCurrentChatId(newChatId)
    setMessages([])
    setSidebarOpen(false)
  }

  // Load existing chat
  const loadChat = (chat: ChatHistory) => {
    setCurrentChatId(chat.id)
    setMessages(chat.messages)
    setChatMode(chat.mode)
    
    if (chat.agentId) {
      const agent = agents.find(a => a.id === chat.agentId)
      setCurrentAgent(agent || null)
    } else {
      setCurrentAgent(null)
    }
    
    setSidebarOpen(false)
  }

  // Delete chat
  const deleteChat = (chatId: string) => {
    setChatHistory(prev => prev.filter(chat => chat.id !== chatId))
    
    if (currentChatId === chatId) {
      setCurrentChatId(null)
      setMessages([])
    }
  }

  // Generate chat title from first message
  const generateChatTitle = (firstMessage: string): string => {
    if (firstMessage.length > 50) {
      return firstMessage.substring(0, 50) + '...'
    }
    return firstMessage
  }

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Auto-resize textarea
  const autoResize = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
  }

  // Send message
  const sendMessage = async () => {
    const content = messageInput.trim()
    if (!content || isLoading) return

    // Check agentic mode requirements
    if (chatMode === 'agentic') {
      if (!currentAgent) {
        alert('Please create and select an agent first!')
        return
      }
      
      if (currentAgent.knowledgeBase.length === 0) {
        alert('Your agent needs training! Please add some knowledge first.')
        setShowTrainer(true)
        return
      }
    }

    // Create new chat if none exists
    if (!currentChatId) {
      const newChatId = Date.now().toString()
      const newChat: ChatHistory = {
        id: newChatId,
        title: generateChatTitle(content),
        messages: [],
        mode: chatMode,
        agentId: currentAgent?.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      setChatHistory(prev => [newChat, ...prev])
      setCurrentChatId(newChatId)
    } else {
      // Update title if it's still "New Chat"
      setChatHistory(prev => prev.map(chat => 
        chat.id === currentChatId && chat.title === 'New Chat'
          ? { ...chat, title: generateChatTitle(content) }
          : chat
      ))
    }

    // Add user message
    const newMessage: Message = {
      role: 'user',
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])
    setMessageInput('')
    setIsLoading(true)

    try {
      const response = await callGroqAPI(content)
      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // API Call
  const callGroqAPI = async (userMessage: string): Promise<string> => {
    const chatMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }))

    let systemPrompt = ''
    let context = ''

    // Handle agentic mode
    if (chatMode === 'agentic' && currentAgent) {
      systemPrompt = currentAgent.systemPrompt
      
      // Search knowledge base
      const knowledge = searchKnowledge(currentAgent.id, userMessage)
      if (knowledge.length > 0) {
        context = `Knowledge Base Information:\n\n${knowledge.join('\n\n---\n\n')}`
      } else {
        return `I don't have information about "${userMessage}" in my knowledge base. 

My knowledge base contains ${currentAgent.knowledgeBase.length} items. You can:
1. Try rephrasing your question
2. Add more relevant content to my knowledge base
3. Ask about topics I've been trained on`
      }
    }

    const requestMessages = [
      ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
      ...(context ? [{ role: 'system', content: context }] : []),
      ...chatMessages,
      { role: 'user', content: userMessage }
    ]

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: requestMessages,
          temperature: 0.7,
          max_tokens: 1024,
          stream: false
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your Groq API key.')
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment and try again.')
        } else {
          throw new Error(`API Error (${response.status}): ${errorText}`)
        }
      }

      const data = await response.json()
      return data.choices[0]?.message?.content || 'No response from AI'
      
    } catch (error: any) {
      console.error('Detailed error:', error)
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return `🚫 **Connection Error**: Cannot connect to Groq API.

**Note**: API should work when deployed on Vercel.

Error details: ${error.message}`
      } else {
        return `❌ **Error**: ${error.message}`
      }
    }
  }

  // Search knowledge base
  const searchKnowledge = (agentId: string, query: string): string[] => {
    const agent = agents.find(a => a.id === agentId)
    if (!agent || agent.knowledgeBase.length === 0) {
      return []
    }
    
    const queryLower = query.toLowerCase()
    const queryWords = queryLower.split(' ').filter(word => word.length > 2)
    
    // Score each knowledge item
    const scoredKnowledge = agent.knowledgeBase.map(kb => {
      const kbLower = kb.toLowerCase()
      let score = 0
      
      // Exact phrase match gets highest score
      if (kbLower.includes(queryLower)) {
        score += 100
      }
      
      // Word matches
      queryWords.forEach(word => {
        if (kbLower.includes(word)) {
          score += 10
        }
      })
      
      return { content: kb, score: score }
    })
    
    // Sort by score and filter relevant items
    const relevantKnowledge = scoredKnowledge
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5) // Top 5 most relevant
      .map(item => item.content)
    
    return relevantKnowledge
  }

  // Create agent
  const createAgent = () => {
    if (!agentName.trim()) {
      alert('Please enter an agent name')
      return
    }
    
    if (!agentDescription.trim()) {
      alert('Please enter an agent description')
      return
    }

    const agent: Agent = {
      id: Date.now().toString(),
      name: agentName,
      description: agentDescription,
      knowledgeBase: [],
      systemPrompt: `You are ${agentName}. ${agentDescription}. You should only answer questions based on the knowledge base provided to you. If the question is not covered in your knowledge base, respond with "I don't have information about that in my knowledge base."`,
      createdAt: new Date()
    }

    setAgents(prev => [...prev, agent])
    setCurrentAgent(agent)
    setShowAgentCreator(false)
    setAgentName('')
    setAgentDescription('')
    
    alert(`✅ Agent "${agentName}" created successfully!`)
  }

  // Add knowledge
  const addKnowledge = () => {
    const knowledge = knowledgeInput.trim()
    
    if (!knowledge) {
      alert('Please enter some knowledge content or upload files first')
      return
    }
    
    if (!currentAgent) {
      alert('No agent selected. Please create an agent first.')
      return
    }

    // Split knowledge into chunks if it's very long
    const chunks = knowledge.split('\n\n---\n\n').filter(chunk => chunk.trim())
    
    // Add each chunk as separate knowledge
    const updatedAgent = {
      ...currentAgent,
      knowledgeBase: [...currentAgent.knowledgeBase, ...chunks.map(chunk => chunk.trim())]
    }
    
    setAgents(prev => prev.map(a => a.id === currentAgent.id ? updatedAgent : a))
    setCurrentAgent(updatedAgent)
    setKnowledgeInput('')
    
    alert(`✅ Knowledge added successfully!\n\nAgent "${currentAgent.name}" now has ${updatedAgent.knowledgeBase.length} knowledge item(s).`)
  }

  // Clear current chat
  const clearChat = () => {
    setMessages([])
    setCurrentChatId(null)
  }

  // File handling
  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return
    
    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        const fileContent = `📄 File: ${file.name}\n\n${content}`
        setKnowledgeInput(prev => prev ? prev + '\n\n---\n\n' + fileContent : fileContent)
      }
      reader.readAsText(file)
    })
  }

  // Suggestion cards for empty state
  const suggestions = chatMode === 'global' 
    ? [
        { text: "What are the advantages of using Next.js?", icon: "⚡" },
        { text: "Write code to demonstrate dijkstra's algorithm", icon: "💻" },
        { text: "Help me write an essay about silicon valley", icon: "📝" },
        { text: "What is the weather in San Francisco?", icon: "🌤️" }
      ]
    : currentAgent && currentAgent.knowledgeBase.length > 0
      ? [
          { text: `What does ${currentAgent.name} know about?`, icon: "🧠" },
          { text: "Show me the knowledge base", icon: "📚" },
          { text: "What can you help me with?", icon: "❓" },
          { text: "Tell me about your training", icon: "🎯" }
        ]
      : [
          { text: "Create a new agent", icon: "🤖" },
          { text: "Train an existing agent", icon: "📚" },
          { text: "Switch to global chat", icon: "🌍" }
        ]

  return (
    <div className="flex h-screen bg-white dark:bg-gray-950">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Chat History</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              ✕
            </button>
          </div>

          {/* New Chat Button */}
          <div className="p-4">
            <button
              onClick={createNewChat}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
              </svg>
              New Chat
            </button>
          </div>

          {/* Chat History List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {chatHistory.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 text-sm py-8">
                No chat history yet.<br />
                Start a new conversation!
              </div>
            ) : (
              chatHistory.map((chat) => (
                <div key={chat.id} className="group">
                  <button
                    onClick={() => loadChat(chat)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      currentChatId === chat.id
                        ? 'bg-gray-100 dark:bg-gray-800'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-900'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {chat.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {chat.mode === 'agentic' ? '🤖 Agent' : '🌍 Global'} • {chat.messages.length} messages
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {new Date(chat.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteChat(chat.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-opacity"
                      >
                        <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                          <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                        </svg>
                      </button>
                    </div>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-40 flex items-center justify-between w-full h-16 px-4 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
              </svg>
            </button>

            {/* Chat Mode Selector */}
            <div className="flex items-center">
              <button 
                className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-9 px-4 py-2 ${
                  chatMode === 'global' ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                onClick={() => setChatMode('global')}
              >
                Global Chat
              </button>
              <button 
                className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-9 px-4 py-2 ${
                  chatMode === 'agentic' ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                onClick={() => setChatMode('agentic')}
              >
                Agentic Chat
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Model Selector */}
            <select 
              className="flex h-9 w-full items-center justify-between rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
            >
              <option value="llama-3.1-8b-instant">Llama 3.1 8B</option>
              <option value="llama-3.1-70b-versatile">Llama 3.1 70B</option>
              <option value="mixtral-8x7b-32768">Mixtral 8x7B</option>
              <option value="gemma2-9b-it">Gemma2 9B</option>
            </select>

            {/* Agentic Controls */}
            {chatMode === 'agentic' && (
              <>
                <select 
                  className="flex h-9 w-full items-center justify-between rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                  value={currentAgent?.id || ''}
                  onChange={(e) => setCurrentAgent(agents.find(a => a.id === e.target.value) || null)}
                >
                  <option value="">Select Agent</option>
                  {agents.map(agent => (
                    <option key={agent.id} value={agent.id}>{agent.name}</option>
                  ))}
                </select>
                <button 
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-black dark:bg-white text-white dark:text-black shadow hover:bg-gray-800 dark:hover:bg-gray-200 h-9 px-4 py-2"
                  onClick={() => setShowAgentCreator(true)}
                >
                  Add Agent
                </button>
                <button 
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-800 h-9 px-4 py-2"
                  onClick={() => setShowTrainer(true)}
                >
                  Train
                </button>
              </>
            )}

            <button 
              onClick={clearChat}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-800 h-9 px-4 py-2"
            >
              Clear
            </button>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-hidden">
          <div className="w-full overflow-auto">
            <div className="pb-[200px] pt-4 md:pt-10">
              <div className="mx-auto max-w-2xl px-4">
                {messages.length === 0 ? (
                  <div className="mx-auto max-w-2xl px-4">
                    {/* Empty State */}
                    <div className="flex flex-col items-center justify-center space-y-4 text-center">
                      <div className="space-y-2">
                        <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">Hello there!</h1>
                        <p className="text-gray-600 dark:text-gray-400 text-lg">How can I help you today?</p>
                      </div>
                      
                      {chatMode === 'agentic' && currentAgent && currentAgent.knowledgeBase.length === 0 && (
                        <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:border-yellow-200/20 dark:bg-yellow-900/20 p-4 text-yellow-800 dark:text-yellow-200 max-w-md">
                          <strong>Your agent needs training!</strong><br />
                          Click "Train" to add knowledge so your agent can answer questions.
                        </div>
                      )}
                      
                      {/* Suggestion Cards */}
                      <div className="grid grid-cols-2 gap-2 w-full max-w-2xl pt-4">
                        {suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => setMessageInput(suggestion.text)}
                            className="flex flex-col items-start gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 p-3 text-left text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-900"
                          >
                            <div className="text-base">{suggestion.icon}</div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">{suggestion.text.split(' ').slice(0, 6).join(' ')}</div>
                            <div className="text-gray-600 dark:text-gray-400 text-xs">{suggestion.text.split(' ').slice(6).join(' ')}</div>
                          </button>
                        ))}
                      </div>
                  </div>
                ) : (
                  // Messages
                  messages.map((message, index) => (
                    <div key={index} className="group relative mb-4 flex items-start md:-ml-12">
                      <div className={`flex size-8 shrink-0 select-none items-center justify-center rounded-md border shadow ${
                        message.role === 'user'
                          ? 'bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-700'
                          : 'bg-black dark:bg-white text-white dark:text-black border-gray-200 dark:border-gray-700'
                      }`}>
                        {message.role === 'user' ? (
                          <span className="text-xs font-medium">U</span>
                        ) : (
                          <span className="text-xs font-medium">AI</span>
                        )}
                      </div>
                      <div className="flex-1 px-1 ml-4 space-y-2 overflow-hidden">
                        <div className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0">
                          <p className="mb-2 last:mb-0 whitespace-pre-wrap text-gray-900 dark:text-gray-100">{message.content}</p>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                
                {isLoading && (
                  <div className="group relative mb-4 flex items-start md:-ml-12">
                    <div className="flex size-8 shrink-0 select-none items-center justify-center rounded-md border shadow bg-black dark:bg-white text-white dark:text-black border-gray-200 dark:border-gray-700">
                      <span className="text-xs font-medium">AI</span>
                    </div>
                    <div className="flex-1 px-1 ml-4 space-y-2 overflow-hidden">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <div className="size-4 animate-spin rounded-full border-2 border-gray-300 dark:border-gray-600 border-t-gray-900 dark:border-t-gray-100"></div>
                        {chatMode === 'agentic' && currentAgent ? `${currentAgent.name} is thinking...` : 'Thinking...'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="fixed inset-x-0 bottom-0 w-full bg-gradient-to-b from-gray-50/30 dark:from-gray-900/30 from-0% to-gray-50/30 dark:to-gray-900/30 to-50% duration-300 ease-in-out animate-in backdrop-blur-sm lg:left-72">
            <div className="mx-auto sm:max-w-2xl sm:px-4">
              <div className="space-y-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-2 shadow-lg sm:rounded-t-xl sm:border md:py-4">
                <div className="relative flex max-h-60 w-full grow flex-col overflow-hidden bg-white dark:bg-gray-950 px-8 sm:rounded-md sm:border sm:border-gray-200 dark:sm:border-gray-700 sm:px-12">
                  <textarea 
                    value={messageInput}
                    onChange={(e) => {
                      setMessageInput(e.target.value)
                      autoResize(e.target)
                    }}
                    onKeyDown={handleKeyDown}
                    className="min-h-[60px] w-full resize-none bg-transparent px-4 py-[1.3rem] focus-within:outline-none sm:text-sm text-gray-900 dark:text-gray-100"
                    placeholder="Send a message..."
                    disabled={chatMode === 'agentic' && !currentAgent}
                    rows={1}
                  />
                  <div className="absolute left-0 top-4 size-8 rounded-full bg-white dark:bg-gray-950 p-0 sm:left-4">
                    <button 
                      type="button"
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 size-8"
                    >
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-4">
                        <path d="M7.5 1C7.77614 1 8 1.22386 8 1.5V7H14.5C14.7761 7 15 7.22386 15 7.5C15 7.77614 14.7761 8 14.5 8H8V14.5C8 14.7761 7.77614 15 7.5 15C7.22386 15 7 14.7761 7 14.5V8H0.5C0.223858 8 0 7.77614 0 7.5C0 7.22386 0.223858 7 0.5 7H7V1.5C7 1.22386 7.22386 1 7.5 1Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                      </svg>
                    </button>
                  </div>
                  <div className="absolute right-0 top-4 sm:right-4">
                    <button 
                      onClick={sendMessage}
                      disabled={isLoading || !messageInput.trim() || (chatMode === 'agentic' && !currentAgent)}
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 bg-black dark:bg-white text-white dark:text-black shadow hover:bg-gray-800 dark:hover:bg-gray-200 size-8"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" className="size-4">
                        <path d="m221.24 136.88-96-32a8 8 0 0 0-10.5 10.5l32 96a8 8 0 0 0 15.18 1.1l13.89-41.67 41.67-13.89a8 8 0 0 0-1.1-15.18Z" opacity="0.2"></path>
                        <path d="m231.4 44.34-200 66.67a16 16 0 0 0-1 30.15l84.92 28.31 28.31 84.92a16 16 0 0 0 30.15-1l66.67-200a16 16 0 0 0-20.1-20.1Z"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Agent Creator Modal */}
      {showAgentCreator && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
          <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 p-6 shadow-lg duration-200 sm:rounded-lg">
            <div className="flex flex-col space-y-1.5 text-center sm:text-left">
              <h2 className="text-lg font-semibold leading-none tracking-tight text-gray-900 dark:text-gray-100">Create New Agent</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Create a specialized AI agent with custom knowledge.</p>
            </div>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium leading-none text-gray-900 dark:text-gray-100">Agent Name</label>
                <input 
                  type="text"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-1 text-sm shadow-sm transition-colors text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  placeholder="e.g., Customer Support Bot"
                />
              </div>
              
              <div className="grid gap-2">
                <label className="text-sm font-medium leading-none text-gray-900 dark:text-gray-100">Description</label>
                <textarea 
                  value={agentDescription}
                  onChange={(e) => setAgentDescription(e.target.value)}
                  className="flex min-h-[60px] w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm shadow-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  placeholder="Describe what this agent specializes in..."
                />
              </div>
            </div>
            
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
              <button 
                onClick={() => setShowAgentCreator(false)}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-800 h-9 px-4 py-2"
              >
                Cancel
              </button>
              <button 
                onClick={createAgent}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-black dark:bg-white text-white dark:text-black shadow hover:bg-gray-800 dark:hover:bg-gray-200 h-9 px-4 py-2"
              >
                Create Agent
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Agent Trainer Modal */}
      {showTrainer && currentAgent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
          <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] gap-4 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 p-6 shadow-lg duration-200 sm:rounded-lg max-h-[80vh] overflow-y-auto">
            <div className="flex flex-col space-y-1.5 text-center sm:text-left">
              <h2 className="text-lg font-semibold leading-none tracking-tight text-gray-900 dark:text-gray-100">Train {currentAgent.name}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Add knowledge to help your agent answer questions accurately.</p>
            </div>
            
            {currentAgent.knowledgeBase.length === 0 ? (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:border-yellow-200/20 dark:bg-yellow-900/20 p-4 text-yellow-800 dark:text-yellow-200">
                <strong>Your agent needs training!</strong><br />
                Add knowledge base content so your agent can answer questions.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">Knowledge Base ({currentAgent.knowledgeBase.length} items)</h3>
                  <button 
                    onClick={() => {
                      if (confirm('Are you sure you want to clear all knowledge for this agent?')) {
                        const updatedAgent = { ...currentAgent, knowledgeBase: [] }
                        setAgents(prev => prev.map(a => a.id === currentAgent.id ? updatedAgent : a))
                        setCurrentAgent(updatedAgent)
                      }
                    }}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-800 h-8 px-3 py-1"
                  >
                    Clear All
                  </button>
                </div>
                <div className="rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3 max-h-32 overflow-y-auto">
                  {currentAgent.knowledgeBase.map((kb, index) => (
                    <div key={index} className="text-sm mb-2 p-2 bg-white dark:bg-gray-950 rounded text-gray-900 dark:text-gray-100">
                      <strong>#{index + 1}:</strong> {kb.substring(0, 150)}{kb.length > 150 ? '...' : ''}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* File Upload */}
            <div className="space-y-4">
              <label 
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onDrop={(e) => {
                  e.preventDefault()
                  handleFileUpload(e.dataTransfer.files)
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                <div className="text-4xl mb-2">📄</div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Drag and drop files here, or click to browse</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">Supported: .txt, .pdf, .doc, .docx</p>
                <input 
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".txt,.pdf,.doc,.docx"
                  multiple
                  onChange={(e) => handleFileUpload(e.target.files)}
                />
                <button 
                  type="button"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-800 h-9 px-4 py-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose Files
                </button>
              </label>
            </div>
            
            <div className="space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium leading-none text-gray-900 dark:text-gray-100">Or type knowledge directly:</label>
                <textarea 
                  value={knowledgeInput}
                  onChange={(e) => setKnowledgeInput(e.target.value)}
                  className="flex min-h-[120px] w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm shadow-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  placeholder={`Enter knowledge base content (facts, FAQs, product info, etc.)

Example:
Product Pricing:
- Basic Plan: $10/month
- Pro Plan: $25/month  
- Enterprise: $100/month

Support Hours: Mon-Fri 9AM-5PM
Contact: support@company.com`}
                />
              </div>
              
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                <button 
                  onClick={() => setShowTrainer(false)}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-800 h-9 px-4 py-2"
                >
                  Done Training
                </button>
                <button 
                  onClick={addKnowledge}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-black dark:bg-white text-white dark:text-black shadow hover:bg-gray-800 dark:hover:bg-gray-200 h-9 px-4 py-2"
                >
                  Add Knowledge
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
