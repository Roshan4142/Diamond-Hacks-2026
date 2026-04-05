import { ReactFlowProvider } from 'reactflow'
import { useStore } from './store'
import EntryPrompt from './components/EntryPrompt'
import Canvas from './components/Canvas'
import RightPanel from './components/RightPanel'

export default function App() {
  const nodes = useStore(s => s.nodes)
  const rightPanelOpen = useStore(s => s.rightPanelOpen)

  if (nodes.length === 0) {
    return <EntryPrompt />
  }

  return (
    <>
      <div className="topbar">
        <div className="topbar-dot" />
        <span className="topbar-title">MindMap</span>
      </div>
      <div className="canvas-area">
        <ReactFlowProvider>
          <Canvas />
        </ReactFlowProvider>
        {rightPanelOpen && <RightPanel />}
      </div>
    </>
  )
}
