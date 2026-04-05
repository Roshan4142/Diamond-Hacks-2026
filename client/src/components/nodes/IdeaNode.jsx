import { useState, useRef, useEffect } from 'react'
import { Handle, Position } from 'reactflow'
import { useStore, useChatStore } from '../../store'
import FloatingToolbar from '../FloatingToolbar'

export default function IdeaNode({ id, data, selected }) {
  const updateNodeLabel = useStore(s => s.updateNodeLabel)
  const getMessages = useChatStore(s => s.getMessages)
  const summary = useChatStore(s => s.summaries[id] ?? null)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(data.label)
  const [showTooltip, setShowTooltip] = useState(false)
  const inputRef = useRef(null)

  const messages = getMessages(id)
  const hasChat = messages.length > 0

  useEffect(() => {
    setDraft(data.label)
  }, [data.label])

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  function commit() {
    const trimmed = draft.trim()
    if (trimmed) updateNodeLabel(id, trimmed)
    else setDraft(data.label)
    setEditing(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') { e.preventDefault(); commit() }
    if (e.key === 'Escape') { setDraft(data.label); setEditing(false) }
  }

  return (
    <div
      className={`idea-node${selected ? ' selected' : ''}`}
      onDoubleClick={() => setEditing(true)}
      onMouseEnter={() => hasChat && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <Handle type="target" position={Position.Left} id="target-left" />
      <Handle type="target" position={Position.Right} id="target-right" />

      {selected && <FloatingToolbar nodeId={id} nodeText={data.label} />}

      {editing ? (
        <input
          ref={inputRef}
          className="idea-node-input"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={handleKeyDown}
          style={{ minWidth: 80 }}
        />
      ) : (
        <div className="idea-node-label">{data.label}</div>
      )}

      {hasChat && (
        <div className="chat-indicator" title="Has chat history">
          <span className="chat-indicator-dot" />
        </div>
      )}

      {hasChat && showTooltip && !selected && (
        <div className="chat-tooltip">
          <div className="chat-tooltip-header">Chat summary</div>
          <div className="chat-tooltip-text">
            {summary ?? 'Generating summary…'}
          </div>
          <div className="chat-tooltip-count">{messages.length} message{messages.length !== 1 ? 's' : ''}</div>
        </div>
      )}

      <Handle type="source" position={Position.Left} id="source-left" />
      <Handle type="source" position={Position.Right} id="source-right" />
    </div>
  )
}
