import { Handle, Position } from 'reactflow'
import { useStore } from '../../store'

export default function GhostNode({ id, data }) {
  const acceptGhostNode = useStore(s => s.acceptGhostNode)
  const rejectGhostNode = useStore(s => s.rejectGhostNode)

  return (
    <div className="ghost-node">
      <Handle type="target" position={Position.Left} />
      <div className="ghost-label-hint">AI suggestion</div>
      <div className="ghost-node-row">
        <span className="ghost-node-text">{data.label}</span>
        <div className="ghost-node-actions">
          <button
            className="ghost-btn accept"
            onClick={() => acceptGhostNode(id)}
            title="Accept"
          >
            ✓
          </button>
          <button
            className="ghost-btn reject"
            onClick={() => rejectGhostNode(id)}
            title="Reject"
          >
            ✕
          </button>
        </div>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  )
}
