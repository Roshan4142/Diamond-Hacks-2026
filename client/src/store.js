import { create } from 'zustand'
import { applyNodeChanges, applyEdgeChanges } from 'reactflow'
import { nanoid } from 'nanoid'

const W = 250
const H = 80
const PAD = 20
const RADIUS = 160

function overlaps(a, b) {
  return Math.abs(a.x - b.x) < W + PAD && Math.abs(a.y - b.y) < H + PAD
}

function findFreePosition(existingPositions, candidate) {
  // Spiral outward from candidate until no overlap
  const angles = [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4, Math.PI, (5 * Math.PI) / 4, (3 * Math.PI) / 2, (7 * Math.PI) / 4]
  let pos = { ...candidate }
  let r = 0
  let attempts = 0
  while (existingPositions.some(p => overlaps(p, pos)) && attempts < 80) {
    r += H + PAD
    const angle = angles[attempts % angles.length]
    pos = { x: candidate.x + Math.cos(angle) * r, y: candidate.y + Math.sin(angle) * r }
    attempts++
  }
  return pos
}

function bestAngle(parentPos, existingPositions) {
  const steps = 12
  let best = 0
  let bestDist = -1
  for (let i = 0; i < steps; i++) {
    const angle = (i * 2 * Math.PI) / steps
    const cand = { x: parentPos.x + Math.cos(angle) * RADIUS, y: parentPos.y + Math.sin(angle) * RADIUS }
    const minDist = existingPositions.length
      ? Math.min(...existingPositions.map(p => Math.hypot(cand.x - p.x, cand.y - p.y)))
      : Infinity
    if (minDist > bestDist) { bestDist = minDist; best = angle }
  }
  return best
}

export const useStore = create((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  aiMode: 'brainstorm',
  rightPanelOpen: false,
  isLoading: false,
  viewMode: 'entry', // 'entry' | 'map' | 'outline'

  onNodesChange: (changes) =>
    set(state => ({ nodes: applyNodeChanges(changes, state.nodes) })),
  onEdgesChange: (changes) =>
    set(state => ({ edges: applyEdgeChanges(changes, state.edges) })),

  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  openPanel: () => set({ rightPanelOpen: true }),
  setAiMode: (mode) => set({ aiMode: mode }),
  setLoading: (val) => set({ isLoading: val }),
  closePanel: () => set({ rightPanelOpen: false, selectedNodeId: null }),
  setViewMode: (mode) => set({ viewMode: mode }),

  loadMap: (nodes, edges) => set({ nodes, edges, selectedNodeId: null, rightPanelOpen: false, viewMode: 'map' }),

  addChildNode: (parentId) => {
    const id = nanoid()
    const { nodes } = get()
    const parent = nodes.find(n => n.id === parentId)
    const parentPos = parent?.position ?? { x: 0, y: 0 }
    const angle = bestAngle(parentPos, nodes.map(n => n.position))
    const candidate = {
      x: parentPos.x + Math.cos(angle) * RADIUS,
      y: parentPos.y + Math.sin(angle) * RADIUS,
    }
    const position = findFreePosition(nodes.map(n => n.position), candidate)
    const newNode = {
      id,
      type: 'ideaNode',
      position,
      data: { label: 'New idea', parentId },
    }
    const newEdge = {
      id: `e-${parentId}-${id}`,
      source: parentId,
      target: id,
      type: 'solidEdge',
    }
    set(state => ({
      nodes: [...state.nodes, newNode],
      edges: [...state.edges, newEdge],
    }))
    return id
  },

  addGhostNodes: (parentId, suggestions) => {
    const { nodes } = get()
    const parent = nodes.find(n => n.id === parentId)
    const parentPos = parent?.position ?? { x: 0, y: 0 }
    // Pick best horizontal direction (left or right), ignore vertical angles
    const rightFree = nodes.filter(n => n.position.x > parentPos.x + 50).length
    const leftFree = nodes.filter(n => n.position.x < parentPos.x - 50).length
    const goRight = rightFree <= leftFree
    const xOffset = goRight ? RADIUS + 80 : -(RADIUS + 80)
    const count = suggestions.length
    const totalH = (count - 1) * 90
    const newNodes = suggestions.map((text, i) => ({
      id: nanoid(),
      type: 'ghostNode',
      position: {
        x: parentPos.x + xOffset,
        y: parentPos.y - totalH / 2 + i * 90,
      },
      data: { label: text, parentId },
    }))
    const newEdges = newNodes.map(node => ({
      id: `e-${parentId}-${node.id}`,
      source: parentId,
      target: node.id,
      type: 'dashedEdge',
    }))
    set(state => ({
      nodes: [...state.nodes, ...newNodes],
      edges: [...state.edges, ...newEdges],
    }))
  },

  acceptGhostNode: (nodeId) => {
    set(state => ({
      nodes: state.nodes.map(n =>
        n.id === nodeId ? { ...n, type: 'ideaNode' } : n
      ),
      edges: state.edges.map(e =>
        e.target === nodeId ? { ...e, type: 'solidEdge' } : e
      ),
    }))
  },

  rejectGhostNode: (nodeId) => {
    set(state => ({
      nodes: state.nodes.filter(n => n.id !== nodeId),
      edges: state.edges.filter(e => e.target !== nodeId && e.source !== nodeId),
    }))
  },

  updateNodeLabel: (nodeId, label) => {
    set(state => ({
      nodes: state.nodes.map(n =>
        n.id === nodeId ? { ...n, data: { ...n.data, label } } : n
      ),
    }))
  },

  clearGhostNodes: () => {
    set(state => {
      const ghostIds = new Set(state.nodes.filter(n => n.type === 'ghostNode').map(n => n.id))
      return {
        nodes: state.nodes.filter(n => !ghostIds.has(n.id)),
        edges: state.edges.filter(e => !ghostIds.has(e.target) && !ghostIds.has(e.source)),
      }
    })
  },

  deleteNode: (nodeId) => {
    set(state => ({
      nodes: state.nodes.filter(n => n.id !== nodeId),
      edges: state.edges.filter(e => e.source !== nodeId && e.target !== nodeId),
      selectedNodeId: null,
      rightPanelOpen: false,
    }))
  },
}))

export const useChatStore = create((set, get) => ({
  chats: {},
  summaries: {},
  addMessage: (nodeId, role, content) =>
    set(state => ({
      chats: {
        ...state.chats,
        [nodeId]: [...(state.chats[nodeId] ?? []), { role, content }],
      },
    })),
  getMessages: (nodeId) => get().chats[nodeId] ?? [],
  setSummary: (nodeId, summary) =>
    set(state => ({ summaries: { ...state.summaries, [nodeId]: summary } })),
  getSummary: (nodeId) => get().summaries[nodeId] ?? null,
}))
