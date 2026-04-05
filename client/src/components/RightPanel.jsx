import { useState, useRef, useEffect } from 'react'
import { useStore, useChatStore } from '../store'
import { useAI } from '../hooks/useAI'
import { useAncestors } from '../hooks/useAncestors'

export default function RightPanel() {
  const selectedNodeId = useStore(s => s.selectedNodeId)
  const nodes = useStore(s => s.nodes)
  const edges = useStore(s => s.edges)
  const closePanel = useStore(s => s.closePanel)
  const acceptGhostNode = useStore(s => s.acceptGhostNode)
  const deleteNode = useStore(s => s.deleteNode)
  const addInsightNode = useStore(s => s.addInsightNode)
  const { addMessage, getMessages, setSummary } = useChatStore()
  const { chat, summarize, condense } = useAI()
  const ancestorTexts = useAncestors(selectedNodeId)

  const [tab, setTab] = useState('chat')
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [pinningIndex, setPinningIndex] = useState(null)
  const messagesEndRef = useRef(null)

  const node = nodes.find(n => n.id === selectedNodeId)
  const messages = selectedNodeId ? getMessages(selectedNodeId) : []

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!node) return null

  const nodeText = node.data.label

  const childEdges = edges.filter(e => e.source === selectedNodeId)
  const childNodes = childEdges.map(e => nodes.find(n => n.id === e.target)).filter(Boolean)
  const ghostChildren = childNodes.filter(n => n.type === 'ghostNode')

  async function handleSend() {
    const trimmed = input.trim()
    if (!trimmed || sending) return
    setInput('')
    setSending(true)
    const history = getMessages(selectedNodeId)
    addMessage(selectedNodeId, 'user', trimmed)
    try {
      const result = await chat(nodeText, ancestorTexts, history, trimmed)
      addMessage(selectedNodeId, 'assistant', result)

      const updatedHistory = [...history, { role: 'user', content: trimmed }, { role: 'assistant', content: result }]
      const nodeId = selectedNodeId
      summarize(updatedHistory).then(summary => setSummary(nodeId, summary)).catch(err => console.error('Summarize failed:', err))
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

  async function handlePin(content, index) {
    if (pinningIndex !== null) return
    setPinningIndex(index)
    try {
      const label = await condense(content)
      addInsightNode(selectedNodeId, label, content)
    } catch (err) {
      alert('Pin failed: ' + err.message)
    } finally {
      setPinningIndex(null)
    }
  }

  function acceptAll() {
    ghostChildren.forEach(n => acceptGhostNode(n.id))
  }

  return (
    <aside className="right-panel">
      <div className="panel-header">
        <h3 className="panel-title">{nodeText}</h3>
        <button onClick={closePanel} className="panel-close">✕</button>
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
              <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 16 }}>
                Context: {nodeText}
              </p>
            )}
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'assistant' ? 'flex-start' : 'flex-end', gap: 4 }}>
                <div className={`chat-msg ${msg.role}`}>{msg.content}</div>
                {msg.role === 'assistant' && (
                  <button
                    onClick={() => handlePin(msg.content, i)}
                    disabled={pinningIndex !== null}
                    title="Pin to canvas as insight node"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--teal)',
                      cursor: pinningIndex !== null ? 'wait' : 'pointer',
                      fontSize: 11,
                      padding: '0 2px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                      opacity: 0.6,
                      transition: 'opacity 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = 1}
                    onMouseLeave={e => e.currentTarget.style.opacity = 0.6}
                  >
                    {pinningIndex === i ? <span className="spinner" /> : '⊕ pin to canvas'}
                  </button>
                )}
              </div>
            ))}
            {sending && (
              <div className="chat-msg assistant">Thinking…</div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="chat-input-row">
            <input
              className="chat-input"
              placeholder="Ask anything…"
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sending}
            />
            <button
              className="chat-send-btn"
              onClick={handleSend}
              disabled={sending || !input.trim()}
            >
              ↑
            </button>
          </div>
        </>
      )}

      {tab === 'details' && (
        <div className="details-content">
          <div className="detail-section">
            <span className="detail-label">Path</span>
            <div className="breadcrumb">
              {ancestorTexts.length > 0 ? ancestorTexts.map((text, i) => (
                <span key={i}>{text}<span className="breadcrumb-sep">›</span></span>
              )) : null}
              <span style={{ color: 'var(--text-primary)' }}>{nodeText}</span>
            </div>
          </div>

          <div className="detail-section">
            <span className="detail-label">Children</span>
            <div className="detail-value">{childNodes.length} node{childNodes.length !== 1 ? 's' : ''}</div>
          </div>

          {ghostChildren.length > 0 && (
            <div className="detail-section">
              <button onClick={acceptAll} className="detail-btn">
                Accept all suggestions ({ghostChildren.length})
              </button>
            </div>
          )}

          <div className="detail-section">
            <button onClick={() => deleteNode(selectedNodeId)} className="detail-btn danger">
              Delete Node
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}
