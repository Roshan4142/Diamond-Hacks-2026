import { ReactFlowProvider } from 'reactflow'
import { useStore } from './store'
import TopNavBar from './components/TopNavBar'
import EntryPrompt from './components/EntryPrompt'
import Canvas from './components/Canvas'
import RightPanel from './components/RightPanel'
import OutlineView from './components/OutlineView'
import 'reactflow/dist/style.css'

export default function App() {
  const viewMode = useStore(s => s.viewMode)
  const rightPanelOpen = useStore(s => s.rightPanelOpen)

  return (
    <div className="min-h-screen bg-surface">
      <TopNavBar />
      
      {viewMode === 'entry' && <EntryPrompt />}
      
      {viewMode === 'map' && (
        <div className="fixed inset-0 top-[56px] bg-surface-bright overflow-hidden">
          {/* Subtle Canvas Texture / Grid */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#163328 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>
          
          <ReactFlowProvider>
            <Canvas />
          </ReactFlowProvider>

          {rightPanelOpen && <RightPanel />}
        </div>
      )}

      {viewMode === 'outline' && <OutlineView />}
    </div>
  )
}
