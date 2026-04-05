import { useState } from 'react'
import { useStore } from '../store'

export default function OutlineView() {
  const nodes = useStore(s => s.nodes)
  const edges = useStore(s => s.edges)
  
  const rootNode = nodes.find(n => !n.data.parentId)
  
  if (!rootNode) return null

  // Group children by parent
  const childrenMap = {}
  edges.forEach(e => {
    if (!childrenMap[e.source]) childrenMap[e.source] = []
    childrenMap[e.source].push(e.target)
  })

  function NodeTree({ nodeId, depth = 0 }) {
    const [expanded, setExpanded] = useState(true)
    const node = nodes.find(n => n.id === nodeId)
    if (!node) return null

    const childIds = childrenMap[nodeId] || []
    const ideaChildren = childIds.map(id => nodes.find(n => n.id === id)).filter(n => n && n.type !== 'ghostNode')
    const ghostChildren = childIds.map(id => nodes.find(n => n.id === id)).filter(n => n && n.type === 'ghostNode')

    const hasChildren = ideaChildren.length > 0 || ghostChildren.length > 0

    return (
      <div className="group">
        <div 
          className={`flex items-center gap-4 py-2 px-4 rounded-lg cursor-pointer h-[40px] transition-colors ${expanded && depth > 0 ? 'bg-primary-fixed text-on-primary-fixed' : 'hover:bg-surface-container-low text-on-surface'}`}
          onClick={() => setExpanded(!expanded)}
        >
          {hasChildren ? (
            <span className={`material-symbols-outlined ${expanded ? '' : 'text-stone-400 group-hover:text-primary'}`}>
              {expanded ? 'expand_more' : 'chevron_right'}
            </span>
          ) : (
            <span className="w-6" /> // spacer
          )}
          <span className={`font-[Newsreader] text-xl ${expanded && depth > 0 ? 'font-bold' : 'font-semibold'}`}>
            {node.data.label}
          </span>
        </div>

        {expanded && hasChildren && (
          <div className="ml-[22px] mt-2 pl-6 outline-guide space-y-3 pb-2">
            {ideaChildren.map(child => (
              <div key={child.id} className="pt-1">
                <NodeTree nodeId={child.id} depth={depth + 1} />
              </div>
            ))}
            {ghostChildren.map(child => (
              <div key={child.id} className="flex items-center gap-3 py-1 group/item">
                <span className="w-2 h-2 rounded-full bg-outline-variant shrink-0"></span>
                <div className="px-3 py-1 bg-[#E8EDEA] rounded-lg border border-primary/5">
                  <span className="font-[Newsreader] italic text-primary/70">{child.data.label}</span>
                </div>
                <span className="text-[10px] uppercase tracking-tighter text-stone-400 font-bold ml-2">Suggested</span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  const rootChildIds = childrenMap[rootNode.id] || []

  return (
    <main className="fixed top-[56px] left-0 right-0 md:right-[320px] h-[calc(100vh-56px)] bg-[#fbf9f4] overflow-y-auto">
      <div className="max-w-4xl mx-auto py-16 px-12">
        {/* Root */}
        <div className="mb-12">
          <h1 className="text-5xl font-serif font-bold text-primary tracking-tight leading-tight">
            {rootNode.data.label}
          </h1>
          <div className="h-1 w-24 bg-primary mt-4 rounded-full opacity-20"></div>
        </div>
        
        {/* Outline Hierarchy (Level 1) */}
        <div className="space-y-4">
          {rootChildIds.map(childId => {
             const child = nodes.find(n => n.id === childId)
             if (!child || child.type === 'ghostNode') return null
             return <NodeTree key={childId} nodeId={childId} depth={1} />
          })}
        </div>
      </div>
    </main>
  )
}
