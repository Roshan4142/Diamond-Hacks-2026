import { useStore } from '../store'

export function useAncestors(nodeId) {
  const nodes = useStore(s => s.nodes)
  function walk(id) {
    const node = nodes.find(n => n.id === id)
    if (!node?.data?.parentId) return []
    const parent = nodes.find(n => n.id === node.data.parentId)
    return [...walk(node.data.parentId), parent?.data?.label ?? '']
  }
  return walk(nodeId)
}
