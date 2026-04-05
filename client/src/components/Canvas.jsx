import { useEffect, useMemo } from 'react'
import ReactFlow, { Background, Controls, useReactFlow } from 'reactflow'
import { useStore } from '../store'
import IdeaNode from './nodes/IdeaNode'
import GhostNode from './nodes/GhostNode'
import SolidEdge from './nodes/SolidEdge'
import DashedEdge from './nodes/DashedEdge'
import AIModeToggle from './AIModeToggle'

const nodeTypes = {
  ideaNode: IdeaNode,
  ghostNode: GhostNode,
}

const edgeTypes = {
  solidEdge: SolidEdge,
  dashedEdge: DashedEdge,
}

export default function Canvas() {
  const nodes = useStore(s => s.nodes)
  const edges = useStore(s => s.edges)
  const onNodesChange = useStore(s => s.onNodesChange)
  const onEdgesChange = useStore(s => s.onEdgesChange)
  const setSelectedNodeId = useStore(s => s.setSelectedNodeId)
  const closePanel = useStore(s => s.closePanel)

  const { fitView } = useReactFlow()
  const nodeCount = nodes.length

  useEffect(() => {
    if (nodeCount > 0) {
      const timer = setTimeout(() => fitView({ padding: 0.2 }), 50)
      return () => clearTimeout(timer)
    }
  }, [nodeCount])

  return (
    <div className="canvas-wrap">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={(_, node) => setSelectedNodeId(node.id)}
        onPaneClick={() => closePanel()}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
      >
        <Background color="var(--border)" gap={28} size={1} />
        <Controls />
      </ReactFlow>
      <AIModeToggle />
    </div>
  )
}
