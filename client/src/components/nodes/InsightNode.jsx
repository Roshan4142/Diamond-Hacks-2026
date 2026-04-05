import { useState } from 'react'
import { Handle, Position } from 'reactflow'
import { useStore } from '../../store'
import FloatingToolbar from '../FloatingToolbar'

export default function InsightNode({ id, data, selected }) {
  const updateNodeLabel = useStore(s => s.updateNodeLabel)
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div
      className={`insight-node${selected ? ' selected' : ''}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <Handle type="target" position={Position.Left} id="target-left" />
      <Handle type="target" position={Position.Right} id="target-right" />

      {selected && <FloatingToolbar nodeId={id} nodeText={data.label} />}

      <div className="insight-label-hint">Insight</div>
      <div className="insight-node-label">{data.label}</div>

      {showTooltip && !selected && data.sourceMessage && (
        <div className="insight-tooltip">
          <div className="insight-tooltip-header">From chat</div>
          <div className="insight-tooltip-text">{data.sourceMessage}</div>
        </div>
      )}

      <Handle type="source" position={Position.Left} id="source-left" />
      <Handle type="source" position={Position.Right} id="source-right" />
    </div>
  )
}
