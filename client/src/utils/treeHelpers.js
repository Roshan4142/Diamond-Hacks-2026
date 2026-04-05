import { nanoid } from 'nanoid'

export function mapToFlow(data, parentId = null, depth = 0, index = 0) {
  const id = nanoid()
  const x = depth * 300
  const y = index * 100

  const node = {
    id,
    type: 'ideaNode',
    position: { x, y },
    data: { label: depth === 0 ? data.root : data.text, parentId },
  }

  const nodes = [node]
  const edges = []

  if (parentId) {
    edges.push({
      id: `e-${parentId}-${id}`,
      source: parentId,
      target: id,
      type: 'solidEdge',
    })
  }

  let childIndex = 0
  for (const child of data.children ?? []) {
    const result = mapToFlow(child, id, depth + 1, index + childIndex)
    nodes.push(...result.nodes)
    edges.push(...result.edges)
    childIndex += result.nodes.length
  }

  return { nodes, edges }
}
