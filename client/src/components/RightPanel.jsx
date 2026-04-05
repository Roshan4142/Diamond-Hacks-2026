import { useState, useRef, useEffect } from 'react'
import { useStore, useChatStore } from '../store'
import { useAI } from '../hooks/useAI'
import { useAncestors } from '../hooks/useAncestors'

export default function RightPanel() {
  const selectedNodeId = useStore(s => s.selectedNodeId)
  const nodes = useStore(s => s.nodes)
  const edges = useStore(s => s.edges)
  const aiMode = useStore(s => s.aiMode)
  const closePanel = useStore(s => s.closePanel)
  const acceptGhostNode = useStore(s => s.acceptGhostNode)
  const deleteNode = useStore(s => s.deleteNode)

  const { addMessage, getMessages } = useChatStore()
  const { chat } = useAI()
  const ancestorTexts = useAncestors(selectedNodeId)

  const [tab, setTab] = useState('chat')
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)

  const node = nodes.find(n => n.id === selectedNodeId)
  const messages = selectedNodeId ? getMessages(selectedNodeId) : []

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!node) return null

  const nodeText = node.data.label

  // Children of this node
  const childEdges = edges.filter(e => e.source === selectedNodeId)
  const childNodes = childEdges.map(e => nodes.find(n => n.id === e.target)).filter(Boolean)
  const ghostChildren = childNodes.filter(n => n.type === 'ghostNode')

  async function handleSend() {
    const trimmed = input.trim()
    if (!trimmed || sending) return
    setInput('')
    setSending(true)
    addMessage(selectedNodeId, 'user', trimmed)
    try {
      const history = getMessages(selectedNodeId)
      const result = await chat(nodeText, ancestorTexts, history, trimmed, aiMode)
      addMessage(selectedNodeId, 'assistant', result)
    } catch (err) {
      addMessage(selectedNodeId, 'assistant', `Error: ${err.message}`)
    } finally {
      setSending(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function acceptAll() {
    ghostChildren.forEach(n => acceptGhostNode(n.id))
  }

  return (
    <div className="right-panel">
      <div className="panel-header">
        <span className="panel-title">{nodeText}</span>
        <button className="panel-close" onClick={closePanel}>✕</button>
      </div>

      <div className="panel-tabs">
        <button
          className={`panel-tab${tab === 'chat' ? ' active' : ''}`}
          onClick={() => setTab('chat')}
        >
          Chat
        </button>
        <button
          className={`panel-tab${tab === 'details' ? ' active' : ''}`}
          onClick={() => setTab('details')}
        >
          Details
        </button>
      </div>

      {tab === 'chat' && (
        <>
          <div className="chat-messages">
            {messages.length === 0 && (
              <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', marginTop: 24 }}>
                Ask anything about "{nodeText}"
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`chat-msg ${msg.role}`}>
                {msg.content}
              </div>
            ))}
            {sending && (
              <div className="chat-msg assistant" style={{ opacity: 0.6 }}>
                <span className="spinner" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="chat-input-row">
            <textarea
              className="chat-input"
              rows={1}
              placeholder="Ask a question…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className="chat-send-btn" onClick={handleSend} disabled={sending || !input.trim()}>
              Send
            </button>
          </div>
        </>
      )}

      {tab === 'details' && (
        <div className="details-content">
          <div className="detail-section">
            <div className="detail-label">Path</div>
            <div className="breadcrumb">
              {ancestorTexts.length > 0
                ? ancestorTexts.map((text, i) => (
                    <span key={i}>
                      {text}
                      <span className="breadcrumb-sep">›</span>
                    </span>
                  ))
                : null}
              <span style={{ color: 'var(--text-primary)' }}>{nodeText}</span>
            </div>
          </div>

          <div className="detail-section">
            <div className="detail-label">Type</div>
            <span className="node-type-pill">Idea Node</span>
          </div>

          <div className="detail-section">
            <div className="detail-label">Children</div>
            <div className="detail-value">{childNodes.length} node{childNodes.length !== 1 ? 's' : ''}</div>
          </div>

          {ghostChildren.length > 0 && (
            <div className="detail-section">
              <button className="detail-btn" onClick={acceptAll}>
                Accept all suggestions ({ghostChildren.length})
              </button>
            </div>
          )}

          <div className="detail-section">
            <button className="detail-btn danger" onClick={() => deleteNode(selectedNodeId)}>
              Delete node
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
