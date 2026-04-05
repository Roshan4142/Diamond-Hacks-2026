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
    <div 
      className={`bg-surface-container-lowest px-6 py-3 rounded-[20px] transition-all duration-300 relative ${selected ? 'border-2 border-tertiary ring-4 ring-tertiary/10 shadow-xl z-20' : 'border border-outline-variant/20 shadow-sm z-10 hover:border-primary/50'}`}
      onDoubleClick={() => setEditing(true)}
    >
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-outline-variant !border-none" />

      {selected && <FloatingToolbar nodeId={id} nodeText={data.label} />}

      {editing ? (
        <input
          ref={inputRef}
          className="bg-transparent border-none p-0 outline-none font-headline text-lg text-primary font-bold min-w-[80px]"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      ) : (
        <span className={`font-headline text-lg ${selected ? 'text-primary font-bold' : 'text-on-surface'}`}>
          {data.label}
        </span>
      )}

      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-outline-variant !border-none" />
    </div>
  )
}
