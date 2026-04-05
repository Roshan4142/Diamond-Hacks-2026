import { Handle, Position } from 'reactflow'
import { useStore } from '../../store'

export default function GhostNode({ id, data }) {
  const acceptGhostNode = useStore(s => s.acceptGhostNode)
  const rejectGhostNode = useStore(s => s.rejectGhostNode)

  return (
    <div className="relative">
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-outline-variant !border-none !opacity-50" />
      
      <span className="absolute -top-5 left-1 text-[11px] font-medium text-outline uppercase tracking-wider">AI Suggestion</span>
      
      <div className="ghost-node border-2 border-primary/20 rounded-2xl p-4 min-w-[280px] max-w-[320px] flex justify-between items-center group hover:border-primary/40 transition-all duration-300">
        <span className="font-body text-on-surface font-medium pr-4 leading-snug">{data.label}</span>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            className="w-8 h-8 rounded-full bg-surface-container-lowest text-primary shadow-sm flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors"
            onClick={() => acceptGhostNode(id)}
            title="Accept"
          >
            <span className="material-symbols-outlined text-[16px]">check</span>
          </button>
          <button
            className="w-8 h-8 rounded-full bg-surface-container-lowest text-error shadow-sm flex items-center justify-center hover:bg-error-container transition-colors"
            onClick={() => rejectGhostNode(id)}
            title="Reject"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-outline-variant !border-none !opacity-0" />
    </div>
  )
}
