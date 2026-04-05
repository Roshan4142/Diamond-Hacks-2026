import { useStore } from '../store'

const MODES = [
  { key: 'brainstorm', label: 'Brainstorm', icon: 'psychology' },
  { key: 'critic', label: 'Critic', icon: 'rate_review' },
  { key: 'structuring', label: 'Structuring', icon: 'account_tree' },
]

export default function BottomNavBar() {
  const aiMode = useStore(s => s.aiMode)
  const setAiMode = useStore(s => s.setAiMode)

  return (
    <nav style={{
      position: 'fixed',
      bottom: '32px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'var(--bg-surface-2)',
      border: '1px solid var(--border)',
      borderRadius: '20px',
      padding: '4px 8px',
      display: 'flex',
      alignItems: 'center',
      gap: '2px',
      zIndex: 50,
      boxShadow: 'var(--shadow-lg)',
    }}>
      {MODES.map(m => {
        const isActive = aiMode === m.key
        return (
          <button
            key={m.key}
            onClick={() => setAiMode(m.key)}
            style={{
              background: isActive ? 'var(--purple)' : 'none',
              border: 'none',
              borderRadius: '16px',
              color: isActive ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '12px',
              padding: '4px 9px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 500,
              transition: 'background 0.1s, color 0.1s',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{m.icon}</span>
            <span style={{ fontFamily: 'inherit', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{m.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
