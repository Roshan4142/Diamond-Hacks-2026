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
    <nav className="fixed bottom-8 left-8 rounded-full px-6 py-3 border border-[#1b1c19]/10 bg-[#fbf9f4]/80 backdrop-blur-xl flex items-center gap-4 z-50 shadow-[0px_12px_32px_rgba(27,28,25,0.06)]">
      {MODES.map(m => {
        const isActive = aiMode === m.key
        return (
          <button
            key={m.key}
            onClick={() => setAiMode(m.key)}
            className={
              isActive
                ? "bg-[#33245a] text-white rounded-full px-4 py-1 flex items-center gap-2 transition-transform scale-95"
                : "text-stone-600 flex items-center gap-2 px-3 hover:bg-stone-200 transition-colors rounded-full py-1"
            }
          >
            <span className="material-symbols-outlined text-sm">{m.icon}</span>
            <span className="font-sans text-[10px] uppercase tracking-widest font-medium">{m.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
