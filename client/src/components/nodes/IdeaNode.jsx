import { useState, useRef, useEffect } from 'react'
import { Handle, Position } from 'reactflow'
import { useStore } from '../../store'
import FloatingToolbar from '../FloatingToolbar'

export default function IdeaNode({ id, data, selected }) {
  const updateNodeLabel = useStore(s => s.updateNodeLabel)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(data.label)
  const inputRef = useRef(null)

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
    <div className={`idea-node${selected ? ' selected' : ''}`} onDoubleClick={() => setEditing(true)}>
      <Handle type="target" position={Position.Left} />

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

      <Handle type="source" position={Position.Right} />
    </div>
  )
}
