import { useStore } from '../store'

const MODES = [
  { key: 'brainstorm', label: 'Brainstorm' },
  { key: 'critic', label: 'Critic' },
  { key: 'structuring', label: 'Structuring' },
]

export default function AIModeToggle() {
  const aiMode = useStore(s => s.aiMode)
  const setAiMode = useStore(s => s.setAiMode)

  return (
    <div className="ai-mode-toggle">
      {MODES.map(m => (
        <button
          key={m.key}
          className={`mode-btn${aiMode === m.key ? ' active' : ''}`}
          onClick={() => setAiMode(m.key)}
        >
          {m.label}
        </button>
      ))}
    </div>
  )
}
