'use client'

import { useState, useEffect, useCallback } from 'react'

interface Agent {
  id: string
  name: string
  description: string
  knowledgeBase: string[]
  systemPrompt: string
  userId: string
  createdAt: Date
  updatedAt: Date
}

interface AgentSidebarProps {
  selectedAgent: Agent | null
  onAgentSelect: (agent: Agent | null) => void
  userId: string
}

export function AgentSidebar({ selectedAgent, onAgentSelect, userId }: AgentSidebarProps) {
  const [agents, setAgents] = useState<Agent[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showTrainModal, setShowTrainModal] = useState(false)
  const [agentName, setAgentName] = useState('')
  const [agentDescription, setAgentDescription] = useState('')
  const [knowledgeInput, setKnowledgeInput] = useState('')

  // Load agents on component mount
  const loadAgents = useCallback(async () => {
    try {
      const response = await fetch(`/api/agents?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setAgents(data.agents || [])
      }
    } catch (error) {
      console.error('Error loading agents:', error)
    }
  }, [userId])

  useEffect(() => {
    loadAgents()
  }, [loadAgents])

  const createAgent = async () => {
    if (!agentName.trim() || !agentDescription.trim()) {
      alert('Please fill in all fields')
      return
    }

    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: agentName,
          description: agentDescription,
          userId
        })
      })

      if (response.ok) {
        const data = await response.json()
        setAgents(prev => [...prev, data.agent])
        setAgentName('')
        setAgentDescription('')
        setShowCreateModal(false)
        onAgentSelect(data.agent)
      }
    } catch (error) {
      console.error('Error creating agent:', error)
    }
  }

  const addKnowledge = async () => {
    if (!selectedAgent || !knowledgeInput.trim()) {
      alert('Please select an agent and enter knowledge')
      return
    }

    try {
      const response = await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgent.id,
          content: knowledgeInput,
          type: 'text'
        })
      })

      if (response.ok) {
        // Update local agent with new knowledge
        const updatedAgent = {
          ...selectedAgent,
          knowledgeBase: [...selectedAgent.knowledgeBase, knowledgeInput.trim()]
        }
        setAgents(prev => prev.map(a => a.id === selectedAgent.id ? updatedAgent : a))
        onAgentSelect(updatedAgent)
        setKnowledgeInput('')
        setShowTrainModal(false)
        alert('Knowledge added successfully!')
      }
    } catch (error) {
      console.error('Error adding knowledge:', error)
    }
  }

  return (
    <>
      <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">AI Agents</h3>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            ➕ Add
          </button>
        </div>

        {/* Agent Selection */}
        <div className="mb-4">
          <select 
            value={selectedAgent?.id || ''} 
            onChange={(e) => {
              const agent = agents.find(a => a.id === e.target.value) || null
              onAgentSelect(agent)
            }}
            className="w-full p-2 border border-gray-300 rounded text-sm"
          >
            <option value="">Normal Chat</option>
            {agents.map(agent => (
              <option key={agent.id} value={agent.id}>
                🤖 {agent.name}
              </option>
            ))}
          </select>
        </div>

        {/* Train Agent Button */}
        {selectedAgent && (
          <button
            onClick={() => setShowTrainModal(true)}
            className="mb-4 w-full px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
          >
            ⚙️ Train Agent
          </button>
        )}

        {/* Selected Agent Info */}
        {selectedAgent && (
          <div className="flex-1 bg-white rounded-lg p-3 border">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-blue-600">🤖</span>
              <h4 className="font-medium">{selectedAgent.name}</h4>
            </div>
            <p className="text-sm text-gray-600 mb-2">{selectedAgent.description}</p>
            <div className="text-xs text-gray-500">
              Knowledge Items: {selectedAgent.knowledgeBase.length}
            </div>
          </div>
        )}
      </div>

      {/* Create Agent Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Create New Agent</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Agent Name</label>
                <input
                  type="text"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="e.g., Customer Support Bot"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={agentDescription}
                  onChange={(e) => setAgentDescription(e.target.value)}
                  placeholder="Describe what this agent specializes in..."
                  className="w-full p-2 border border-gray-300 rounded h-20 resize-none"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={createAgent}
                  className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Create Agent
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Train Agent Modal */}
      {showTrainModal && selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Train {selectedAgent.name}</h3>
            <div className="space-y-4">
              {selectedAgent.knowledgeBase.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Current Knowledge ({selectedAgent.knowledgeBase.length} items)
                  </label>
                  <div className="max-h-32 overflow-y-auto bg-gray-50 p-2 rounded text-sm border">
                    {selectedAgent.knowledgeBase.map((kb, index) => (
                      <div key={index} className="mb-2 p-2 bg-white rounded border">
                        <strong>#{index + 1}:</strong> {kb.substring(0, 100)}...
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-1">Add Knowledge</label>
                <textarea
                  value={knowledgeInput}
                  onChange={(e) => setKnowledgeInput(e.target.value)}
                  placeholder="Enter knowledge content..."
                  className="w-full p-2 border border-gray-300 rounded h-32 resize-none"
                />
              </div>
              
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowTrainModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
                >
                  Done
                </button>
                <button
                  onClick={addKnowledge}
                  className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  Add Knowledge
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
