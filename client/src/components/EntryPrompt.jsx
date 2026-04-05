import { useState } from 'react'
import { useStore } from '../store'
import { useAI } from '../hooks/useAI'
import { mapToFlow } from '../utils/treeHelpers'

export default function EntryPrompt() {
  const loadMap = useStore(s => s.loadMap)
  const { generateMap } = useAI()
  const [topic, setTopic] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    const trimmed = topic.trim()
    if (!trimmed || loading) return
    setLoading(true)
    try {
      const data = await generateMap(trimmed)
      const { nodes, edges } = mapToFlow(data)
      loadMap(nodes, edges)
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
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
          <button className="entry-btn" type="submit" disabled={loading || !topic.trim()}>
            {loading ? <span className="spinner" /> : 'Generate map →'}
          </button>
        </form>
      </div>
    </div>
  )
}
