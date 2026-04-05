# CLAUDE.md — AI Mind Map Project

## What We Are Building
A dark-themed, AI-powered mind map web app. Users type a topic, AI generates a
visual node map. They can expand any node with AI suggestions, rephrase nodes,
and chat with an AI about any node in context. Aesthetic: Notion meets Linear.
Dark, minimal, no gradients, purple AI accent color.

## Tech Stack
- Frontend: React + Vite, React Flow (canvas), Zustand (state), nanoid (IDs)
- Backend: Express, Groq SDK (llama-4-scout-17b-16e-instruct model)
- No database — all state is in-memory client-side
- No UI libraries — custom CSS only

## File Structure to Create
```
mindmap/
├── server.js                         ← entire backend
├── .env                              ← GROQ_API_KEY, PORT (already exists)
└── client/src/
    ├── main.jsx
    ├── App.jsx
    ├── store.js
    ├── hooks/
    │   ├── useAI.js
    │   └── useAncestors.js
    ├── utils/
    │   └── treeHelpers.js
    ├── components/
    │   ├── EntryPrompt.jsx
    │   ├── Canvas.jsx
    │   ├── FloatingToolbar.jsx
    │   ├── RightPanel.jsx
    │   ├── AIModeToggle.jsx
    │   └── nodes/
    │       ├── IdeaNode.jsx
    │       └── GhostNode.jsx
    └── styles/
        └── app.css
```

---

## server.js — Complete Spec

One file. All routes inline. No subfolders.

```js
import express from 'express'
import cors from 'cors'
import Groq from 'groq-sdk'

const app = express()
app.use(cors())
app.use(express.json())

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
const MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct'

async function callGroq(systemPrompt, userMessage, maxTokens = 512) {
  const response = await groq.chat.completions.create({
    model: MODEL,
    max_tokens: maxTokens,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ]
  })
  const raw = response.choices[0].message.content
  return raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
}

// POST /api/generate-map
// Body: { topic: string }
// Returns: { root: string, children: [{ text, children: [] }] }
app.post('/api/generate-map', async (req, res) => {
  try {
    const { topic } = req.body
    const system = `You are a mind map generator. Given a topic, return a JSON object.
Return ONLY valid JSON. No markdown, no explanation, no code fences.
Schema: { "root": "string", "children": [{ "text": "string", "children": [] }] }
Generate exactly 5 top-level children. Each may have 2-3 sub-children. Keep all text under 6 words.`
    const raw = await callGroq(system, `Generate a mind map for: "${topic}"`, 1024)
    const data = JSON.parse(raw)
    res.json({ success: true, data })
  } catch (e) {
    res.status(500).json({ success: false, error: e.message })
  }
})

// POST /api/expand-node
// Body: { nodeText: string, ancestorTexts: string[], mode: string }
// Returns: string[] of 4 suggestions
app.post('/api/expand-node', async (req, res) => {
  try {
    const { nodeText, ancestorTexts = [], mode = 'brainstorm' } = req.body
    const modeMap = {
      brainstorm: 'Be creative and divergent. Unexpected angles welcome.',
      critic: 'Challenge assumptions. Surface risks and weak points.',
      structuring: 'Be systematic. Break into logical components.'
    }
    const system = `You are a mind map assistant. Suggest 4 child node ideas to expand a node.
Mode: ${modeMap[mode] || modeMap.brainstorm}
Return ONLY a JSON array of 4 strings. Each under 7 words. No markdown, no explanation.
Example: ["Research competitors", "Define brand voice", "Set price range", "Pick launch platform"]`
    const context = ancestorTexts.length
      ? `Context (root to parent): ${ancestorTexts.join(' > ')}\n\nCurrent node: "${nodeText}"`
      : `Current node: "${nodeText}"`
    const raw = await callGroq(system, context)
    const data = JSON.parse(raw)
    res.json({ success: true, data })
  } catch (e) {
    res.status(500).json({ success: false, error: e.message })
  }
})

// POST /api/rephrase
// Body: { text: string }
// Returns: string
app.post('/api/rephrase', async (req, res) => {
  try {
    const { text } = req.body
    const system = `Rephrase the given text to be clearer and more compelling. Under 7 words. Return ONLY the rephrased text, nothing else.`
    const raw = await callGroq(system, `Rephrase: "${text}"`, 64)
    res.json({ success: true, data: raw.trim() })
  } catch (e) {
    res.status(500).json({ success: false, error: e.message })
  }
})

// POST /api/chat
// Body: { nodeText, ancestorTexts, history, message, mode }
// Returns: string
app.post('/api/chat', async (req, res) => {
  try {
    const { nodeText, ancestorTexts = [], history = [], message, mode = 'brainstorm' } = req.body
    const modeInstructions = {
      brainstorm: 'Be generative and encouraging. Suggest new angles.',
      critic: 'Ask tough questions. Surface risks. Challenge the idea.',
      structuring: 'Help organize and clarify. Break it into components.'
    }
    const system = `You are a thinking partner embedded in a mind map node. Help the user think deeper.
Mode: ${modeInstructions[mode] || modeInstructions.brainstorm}
Be concise — 2-4 sentences unless asked for more.
Node context: ${ancestorTexts.length ? ancestorTexts.join(' > ') + ' > ' : ''}${nodeText}`

    const messages = [
      { role: 'system', content: system },
      ...history.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: message }
    ]
    const response = await groq.chat.completions.create({
      model: MODEL,
      max_tokens: 512,
      messages
    })
    const data = response.choices[0].message.content.trim()
    res.json({ success: true, data })
  } catch (e) {
    res.status(500).json({ success: false, error: e.message })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server on :${PORT}`))
```

---

## store.js — Complete Spec

```js
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

  onNodesChange: (changes) =>
    set(state => ({ nodes: applyNodeChanges(changes, state.nodes) })),
  onEdgesChange: (changes) =>
    set(state => ({ edges: applyEdgeChanges(changes, state.edges) })),

  setSelectedNodeId: (id) => set({ selectedNodeId: id, rightPanelOpen: !!id }),
  setAiMode: (mode) => set({ aiMode: mode }),
  setLoading: (val) => set({ isLoading: val }),
  closePanel: () => set({ rightPanelOpen: false, selectedNodeId: null }),

  loadMap: (nodes, edges) => set({ nodes, edges, selectedNodeId: null, rightPanelOpen: false }),

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
```

---

## useAncestors.js

```js
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
```

---

## useAI.js

```js
export function useAI() {
  async function post(endpoint, body) {
    const res = await fetch(`/api/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const json = await res.json()
    if (!json.success) throw new Error(json.error)
    return json.data
  }

  return {
    generateMap: (topic) => post('generate-map', { topic }),
    expandNode: (nodeText, ancestorTexts, mode) =>
      post('expand-node', { nodeText, ancestorTexts, mode }),
    rephrase: (text) => post('rephrase', { text }),
    chat: (nodeText, ancestorTexts, history, message, mode) =>
      post('chat', { nodeText, ancestorTexts, history, message, mode }),
  }
}
```

---

## treeHelpers.js

```js
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
```

---

## Component Specs

### App.jsx
- Reads `nodes` from store. If empty → render `<EntryPrompt />`.
- Otherwise render: top bar (48px, project name left side) + canvas area row.
- Canvas area = `<Canvas />` flex-1 + `<RightPanel />` conditionally if `rightPanelOpen`.
- Wrap canvas area in `<ReactFlowProvider>`.

### EntryPrompt.jsx
- Full viewport, centered content, dot-grid background via CSS.
- Heading "What are you thinking about?" + input + "Generate map →" button.
- On submit: call `generateMap(topic)` → `mapToFlow(result)` → `loadMap(nodes, edges)`.
- Show loading state on button. On error: `alert(error.message)`.

### Canvas.jsx
- `<ReactFlow>` filling its container with these EXACT props:
  - `nodes={nodes}` `edges={edges}`
  - `onNodesChange={onNodesChange}` (from store — CRITICAL)
  - `onEdgesChange={onEdgesChange}` (from store — CRITICAL)
  - `onNodeClick={(_, node) => setSelectedNodeId(node.id)}`
  - `onPaneClick={() => closePanel()}`
  - `nodeTypes={nodeTypes}` `edgeTypes={edgeTypes}`
  - `fitView`
- useEffect: when nodes.length goes from 0 to > 0, call `fitView({ padding: 0.2 })` after 50ms timeout.
- Render `<AIModeToggle />` as absolute overlay, bottom-left, z-index 10.
- Import `'reactflow/dist/style.css'`.

### IdeaNode.jsx
- Props: `{ id, data, selected }`
- Purple border when `selected` is true.
- Double-click → inline text input (controlled), commit on Enter or blur.
- Render `<FloatingToolbar nodeId={id} nodeText={data.label} />` when `selected`.
- React Flow Handles: target left, source right.

### GhostNode.jsx
- Props: `{ id, data }`
- 60% opacity wrapper, dashed purple border, purple-dim background.
- "AI suggestion" label above in 11px muted purple text.
- Label text left, ✓ and ✕ buttons right (16px).
- React Flow Handles: target left, source right.

### SolidEdge.jsx
```jsx
import { BaseEdge, getSmoothStepPath } from 'reactflow'
export default function SolidEdge(props) {
  const [path] = getSmoothStepPath(props)
  return <BaseEdge path={path} style={{ stroke: 'rgba(255,255,255,0.25)', strokeWidth: 1 }} />
}
```

### DashedEdge.jsx
```jsx
import { BaseEdge, getSmoothStepPath } from 'reactflow'
export default function DashedEdge(props) {
  const [path] = getSmoothStepPath(props)
  return <BaseEdge path={path} style={{ stroke: 'rgba(124,92,191,0.6)', strokeWidth: 1, strokeDasharray: '5,5' }} />
}
```

### FloatingToolbar.jsx
- Positioned absolute, above the node, centered horizontally.
- Pill shape with 3 buttons: "+ Add" | "✦ AI Expand" | "↺ Rephrase"
- "+ Add": calls `addChildNode(nodeId)`.
- "✦ AI Expand": sets local loading=true, calls `expandNode(nodeText, ancestorTexts, aiMode)`, calls `addGhostNodes(nodeId, result)`, sets loading=false.
- "↺ Rephrase": calls `rephrase(nodeText)`, calls `updateNodeLabel(nodeId, result)`.
- Show spinner on active button while loading.
- Stop event propagation on all button clicks (prevent node deselect).

### RightPanel.jsx
- 320px wide, dark surface, left border, full height.
- Header: node label + X close button.
- Two tabs: Chat (default) | Details.
- Chat tab: renders message list + input row. Each message uses `useChatStore`.
  On send: `addMessage(nodeId, 'user', text)` → call `chat(...)` → `addMessage(nodeId, 'assistant', result)`.
- Details tab: ancestor breadcrumb, node type pill ("Idea Node"), children count,
  "Accept all suggestions" button (calls `acceptGhostNode` for each ghost child),
  "Delete node" button in red text.

### AIModeToggle.jsx
- Three-segment pill: Brainstorm | Critic | Structuring.
- Reads `aiMode` from store, calls `setAiMode(mode)` on click.
- Active segment: filled purple background, white text.
- Inactive: dark bg, muted text.
- Position: absolute, bottom 80px, left 16px, z-index 10.

---

## Design Tokens — app.css

```css
@import 'reactflow/dist/style.css';

:root {
  --bg-base: #0f0f0f;
  --bg-surface: #1a1a1a;
  --bg-surface-2: #222222;
  --border: #2a2a2a;
  --text-primary: #e8e8e8;
  --text-secondary: #888888;
  --text-muted: #555555;
  --purple: #7c5cbf;
  --purple-dim: rgba(124, 92, 191, 0.15);
  --purple-border: rgba(124, 92, 191, 0.5);
  --radius: 8px;
  --radius-sm: 4px;
}

* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: var(--bg-base); color: var(--text-primary); font-family: 'Inter', system-ui, sans-serif; height: 100vh; overflow: hidden; }
#root { height: 100vh; display: flex; flex-direction: column; }

.react-flow__background { background: var(--bg-base) !important; }
.react-flow__minimap { background: var(--bg-surface) !important; border: 1px solid var(--border) !important; border-radius: var(--radius) !important; }
.react-flow__controls { background: var(--bg-surface) !important; border: 1px solid var(--border) !important; border-radius: var(--radius) !important; }
.react-flow__controls button { background: transparent !important; border: none !important; color: var(--text-secondary) !important; }
.react-flow__controls button:hover { background: var(--bg-surface-2) !important; color: var(--text-primary) !important; }
.react-flow__handle { background: var(--border) !important; border: none !important; width: 8px !important; height: 8px !important; }
```

---

## Critical Implementation Notes

### 1. React Flow + Zustand sync — MOST IMPORTANT
Canvas.jsx MUST pass `onNodesChange` and `onEdgesChange` from the store to `<ReactFlow>`.
Without this, dragged nodes snap back on every re-render.

### 2. ReactFlowProvider placement
Wrap the canvas area in App.jsx with `<ReactFlowProvider>`.
The `useReactFlow()` hook only works inside this provider.

### 3. fitView after loadMap
```js
const { fitView } = useReactFlow()
const nodeCount = useStore(s => s.nodes.length)
useEffect(() => {
  if (nodeCount > 0) setTimeout(() => fitView({ padding: 0.2 }), 50)
}, [nodeCount])
```

### 4. Groq JSON stripping
Already handled in `callGroq()`. Do not remove the `.replace` lines.

### 5. Stop propagation in FloatingToolbar
Every button in FloatingToolbar must call `e.stopPropagation()` to prevent
the click from bubbling to the canvas pane and deselecting the node.

### 6. main.jsx
```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/app.css'

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
```

---

## Done State

App is complete when:
1. Entry prompt shows on dark dot-grid background
2. Typing a topic + Enter generates a mind map with 5 nodes
3. Nodes can be dragged and stay put
4. Clicking a node selects it (purple border) + opens right panel
5. Floating toolbar appears above selected node
6. "+ Add" creates a child node
7. "✦ AI Expand" creates 4 ghost nodes with dashed edges
8. ✓ accepts a ghost node, ✕ rejects it
9. "↺ Rephrase" updates the node label
10. Right panel chat sends a message and gets an AI response
11. AI Mode toggle visibly switches between Brainstorm / Critic / Structuring
