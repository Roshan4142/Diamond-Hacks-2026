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
    <main className="flex flex-col items-center justify-center min-h-screen px-6 relative z-10 w-full pt-[56px]">
      <div className="absolute inset-0 dot-grid pointer-events-none"></div>
      <div className="w-full max-w-3xl text-center relative z-20">
        <h1 className="font-headline text-5xl md:text-7xl text-on-surface font-bold tracking-tight mb-12">
          What are you thinking about?
        </h1>
        <form className="relative group" onSubmit={handleSubmit}>
          <div className="flex items-center gap-3 bg-surface-container-lowest p-2 pl-6 pr-2 rounded-[20px] shadow-[0px_4px_24px_rgba(27,28,25,0.04)] focus-within:shadow-[0px_12px_32px_rgba(27,28,25,0.08)] transition-all duration-300">
            <input
              className="flex-1 bg-transparent border-none focus:ring-0 text-xl font-headline placeholder:text-outline italic outline-none w-full"
              placeholder="e.g. Start a clothing brand..."
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              autoFocus
            />
            <button 
              type="submit" 
              disabled={!topic.trim()}
              className="bg-primary text-on-primary font-body font-medium px-6 py-4 rounded-[20px] flex items-center gap-2 hover:opacity-90 transition-opacity active:scale-[0.98] disabled:opacity-50"
            >
              Generate map
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </div>
          <p className="mt-4 text-outline text-sm tracking-wide text-left ml-6">
            Press Enter to generate
          </p>
        </form>
      </div>
    </main>
  )
}
