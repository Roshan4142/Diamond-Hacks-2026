import { useState } from 'react'
import { nanoid } from 'nanoid'
import { useStore } from '../store'

export default function EntryPrompt() {
  const loadMap = useStore(s => s.loadMap)
  const [topic, setTopic] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = topic.trim()
    if (!trimmed) return
    const id = nanoid()
    loadMap(
      [{ id, type: 'ideaNode', position: { x: 0, y: 0 }, data: { label: trimmed, parentId: null } }],
      []
    )
  }

  return (
    <div className="entry-prompt">
      <div className="entry-inner">
        <h1 className="entry-heading">What are you thinking about?</h1>
        <form className="entry-input-row" onSubmit={handleSubmit}>
          <input
            className="entry-input"
            type="text"
            placeholder="e.g. building a startup, climate change, my novel…"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            autoFocus
          />
          <button className="entry-btn" type="submit" disabled={!topic.trim()}>
            Start →
          </button>
        </form>
      </div>
    </div>
  )
}
