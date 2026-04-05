import { useEffect } from 'react'
import ReactFlow, { Background, Controls, useReactFlow } from 'reactflow'
import { useStore } from '../store'
import IdeaNode from './nodes/IdeaNode'
import GhostNode from './nodes/GhostNode'
import SolidEdge from './nodes/SolidEdge'
import DashedEdge from './nodes/DashedEdge'
import BottomNavBar from './BottomNavBar'

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
  }, [nodeCount, fitView])

  return (
    <div className="absolute inset-0">
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
        <Controls 
          className="bg-surface-container-lowest/80 backdrop-blur-xl border border-outline-variant/30 rounded-full shadow-none overflow-hidden m-4 [&>button]:border-none [&>button]:p-2 [&>button]:hover:bg-surface-container-high" 
          position="bottom-center"
          showInteractive={false}
        />
      </ReactFlow>
      <BottomNavBar />
    </div>
  )
}
