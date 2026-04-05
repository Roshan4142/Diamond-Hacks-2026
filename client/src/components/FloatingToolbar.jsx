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
    <div className="floating-toolbar" onMouseDown={e => e.stopPropagation()}>
      <button className="toolbar-btn" onClick={handleAdd}>
        + Add
      </button>
      <div className="toolbar-divider" />
      <button
        className={`toolbar-btn${loadingExpand ? ' loading' : ''}`}
        onClick={handleExpand}
        disabled={loadingExpand}
      >
        {loadingExpand ? <span className="spinner" /> : '✦'} AI Expand
      </button>
      <div className="toolbar-divider" />
      <button
        className={`toolbar-btn${loadingRephrase ? ' loading' : ''}`}
        onClick={handleRephrase}
        disabled={loadingRephrase}
      >
        {loadingRephrase ? <span className="spinner" /> : '↺'} Rephrase
      </button>
    </div>
  )
}
