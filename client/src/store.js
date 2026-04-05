import { create } from 'zustand'
import { applyNodeChanges, applyEdgeChanges } from 'reactflow'
import { nanoid } from 'nanoid'

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

  setSelectedNodeId: (id) => set({ selectedNodeId: id, rightPanelOpen: !!id }),
  setAiMode: (mode) => set({ aiMode: mode }),
  setLoading: (val) => set({ isLoading: val }),
  closePanel: () => set({ rightPanelOpen: false, selectedNodeId: null }),
  setViewMode: (mode) => set({ viewMode: mode }),

  loadMap: (nodes, edges) => set({ nodes, edges, selectedNodeId: null, rightPanelOpen: false, viewMode: 'map' }),

  addChildNode: (parentId) => {
    const id = nanoid()
    const parent = get().nodes.find(n => n.id === parentId)
    const newNode = {
      id,
      type: 'ideaNode',
      position: {
        x: (parent?.position.x ?? 0) + 250,
        y: (parent?.position.y ?? 0) + (Math.random() * 100 - 50),
      },
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
    const parent = get().nodes.find(n => n.id === parentId)
    const newNodes = suggestions.map((text, i) => ({
      id: nanoid(),
      type: 'ghostNode',
      position: {
        x: parent?.position.x > 900 ? (parent?.position.x ?? 0) - 280 : (parent?.position.x ?? 0) + 280,
        y: (parent?.position.y ?? 0) + (i - suggestions.length / 2) * 90,
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
  addMessage: (nodeId, role, content) =>
    set(state => ({
      chats: {
        ...state.chats,
        [nodeId]: [...(state.chats[nodeId] ?? []), { role, content }],
      },
    })),
  getMessages: (nodeId) => get().chats[nodeId] ?? [],
}))
