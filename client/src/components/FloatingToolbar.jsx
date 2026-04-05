import { useState } from 'react'
import { useStore } from '../store'
import { useAI } from '../hooks/useAI'
import { useAncestors } from '../hooks/useAncestors'

export default function FloatingToolbar({ nodeId, nodeText }) {
  const addChildNode = useStore(s => s.addChildNode)
  const addGhostNodes = useStore(s => s.addGhostNodes)
  const updateNodeLabel = useStore(s => s.updateNodeLabel)
  const aiMode = useStore(s => s.aiMode)
  const { expandNode, rephrase } = useAI()
  const ancestorTexts = useAncestors(nodeId)

  const [loadingExpand, setLoadingExpand] = useState(false)
  const [loadingRephrase, setLoadingRephrase] = useState(false)

  async function handleExpand(e) {
    e.stopPropagation()
    setLoadingExpand(true)
    try {
      const suggestions = await expandNode(nodeText, ancestorTexts, aiMode)
      addGhostNodes(nodeId, suggestions)
    } catch (err) {
      alert(err.message)
    } finally {
      setLoadingExpand(false)
    }
  }

  async function handleRephrase(e) {
    e.stopPropagation()
    setLoadingRephrase(true)
    try {
      const result = await rephrase(nodeText)
      updateNodeLabel(nodeId, result)
    } catch (err) {
      alert(err.message)
    } finally {
      setLoadingRephrase(false)
    }
  }

  function handleAdd(e) {
    e.stopPropagation()
    addChildNode(nodeId)
  }

  return (
    <div 
      className="absolute -top-14 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-surface-container-lowest/80 backdrop-blur-xl shadow-[0px_12px_32px_rgba(27,28,25,0.06)] rounded-full px-2 py-1.5 border border-outline-variant/30 z-30"
      onMouseDown={e => e.stopPropagation()}
    >
      <button 
        className="flex items-center gap-1 px-3 py-1 hover:bg-surface-container-high rounded-full text-xs font-medium uppercase tracking-wider text-on-surface"
        onClick={handleAdd}
      >
        <span className="material-symbols-outlined text-sm">add</span> Add
      </button>

      <button
        className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${loadingExpand ? 'bg-surface-container-high text-stone-400' : 'bg-[#E8EDEA] hover:bg-primary-fixed-dim text-primary'}`}
        onClick={handleExpand}
        disabled={loadingExpand}
      >
        {loadingExpand ? (
           <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
        ) : (
           <span className="material-symbols-outlined text-sm">auto_awesome</span>
        )}
        AI Expand
      </button>

      <button
        className={`flex items-center gap-1 px-3 py-1 hover:bg-surface-container-high rounded-full text-xs font-medium uppercase tracking-wider text-on-surface ${loadingRephrase ? 'opacity-50' : ''}`}
        onClick={handleRephrase}
        disabled={loadingRephrase}
      >
        {loadingRephrase ? (
           <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
        ) : (
           <span className="material-symbols-outlined text-sm">refresh</span>
        )}
        Rephrase
      </button>
    </div>
  )
}
