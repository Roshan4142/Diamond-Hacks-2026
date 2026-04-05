import { useState, useRef, useEffect } from 'react'
import { useStore, useChatStore } from '../store'
import { useAI } from '../hooks/useAI'
import { useAncestors } from '../hooks/useAncestors'

export default function RightPanel() {
  const selectedNodeId = useStore(s => s.selectedNodeId)
  const nodes = useStore(s => s.nodes)
  const edges = useStore(s => s.edges)
  const aiMode = useStore(s => s.aiMode)
  const closePanel = useStore(s => s.closePanel)
  const acceptGhostNode = useStore(s => s.acceptGhostNode)
  const deleteNode = useStore(s => s.deleteNode)

  const { addMessage, getMessages } = useChatStore()
  const { chat } = useAI()
  const ancestorTexts = useAncestors(selectedNodeId)

  const [tab, setTab] = useState('chat')
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)

  const node = nodes.find(n => n.id === selectedNodeId)
  const messages = selectedNodeId ? getMessages(selectedNodeId) : []

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!node) return null

  const nodeText = node.data.label

  // Children of this node
  const childEdges = edges.filter(e => e.source === selectedNodeId)
  const childNodes = childEdges.map(e => nodes.find(n => n.id === e.target)).filter(Boolean)
  const ghostChildren = childNodes.filter(n => n.type === 'ghostNode')

  async function handleSend() {
    const trimmed = input.trim()
    if (!trimmed || sending) return
    setInput('')
    setSending(true)
    addMessage(selectedNodeId, 'user', trimmed)
    try {
      const history = getMessages(selectedNodeId)
      const result = await chat(nodeText, ancestorTexts, history, trimmed, aiMode)
      addMessage(selectedNodeId, 'assistant', result)
    } catch (err) {
      addMessage(selectedNodeId, 'assistant', `Error: ${err.message}`)
    } finally {
      setSending(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function acceptAll() {
    ghostChildren.forEach(n => acceptGhostNode(n.id))
  }

  return (
    <aside className="fixed right-0 top-[56px] h-[calc(100vh-56px)] w-[320px] bg-[#fbf9f4] border-l border-[#1b1c19]/10 flex flex-col z-40">
      <div className="p-6 pb-2">
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-[Newsreader] text-2xl font-bold text-[#163328] truncate pr-2">{nodeText}</h3>
          <button onClick={closePanel} className="text-stone-400 hover:text-[#163328] transition-colors rounded-full flex-shrink-0">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
        <p className="text-xs font-sans text-stone-500 uppercase tracking-widest">{aiMode} Mode</p>
      </div>

      <div className="flex px-6 border-b border-[#1b1c19]/10 mb-4">
        <button
          className={`flex-1 pb-2 flex items-center justify-center gap-2 font-bold transition-colors ${tab === 'chat' ? 'text-[#163328] font-serif border-b-2 border-[#163328]' : 'text-stone-400 font-sans hover:text-[#163328]'}`}
          onClick={() => setTab('chat')}
        >
          <span className="material-symbols-outlined text-[18px]">chat_bubble</span> Chat
        </button>
        <button
          className={`flex-1 pb-2 flex items-center justify-center gap-2 font-bold transition-colors ${tab === 'details' ? 'text-[#163328] font-serif border-b-2 border-[#163328]' : 'text-stone-400 font-sans hover:text-[#163328]'}`}
          onClick={() => setTab('details')}
        >
          <span className="material-symbols-outlined text-[18px]">info</span> Details
        </button>
      </div>

      {tab === 'chat' && (
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto px-6 pb-4">
          <div className="flex-1 flex flex-col gap-4">
             {messages.length === 0 && (
                <div className="text-xs font-bold text-primary uppercase text-center mt-4">
                  Context: {nodeText}
                </div>
             )}
             {messages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  {msg.role === 'user' ? (
                    <>
                      <div className="max-w-[85%] bg-surface-container-high rounded-2xl rounded-tr-none px-4 py-3">
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                      </div>
                      <span className="text-[10px] text-outline mt-2 uppercase tracking-tighter text-right">You</span>
                    </>
                  ) : (
                    <>
                      <div className="max-w-[90%] bg-tertiary-fixed/30 rounded-2xl rounded-tl-none px-4 py-3 border-l-4 border-tertiary/20">
                        <p className="text-sm leading-relaxed text-on-surface">{msg.content}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-4 h-4 rounded-sm bg-tertiary-container flex items-center justify-center">
                          <span className="material-symbols-outlined text-[10px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                        </div>
                        <span className="text-[10px] text-tertiary font-bold uppercase tracking-tighter">Athenaeum AI</span>
                      </div>
                    </>
                  )}
                </div>
             ))}
             {sending && (
                <div className="flex flex-col items-start opacity-60">
                   <div className="max-w-[90%] bg-tertiary-fixed/30 rounded-2xl rounded-tl-none px-4 py-3 border-l-4 border-tertiary/20">
                      <p className="text-sm">Thinking...</p>
                   </div>
                </div>
             )}
             <div ref={messagesEndRef} />
          </div>
          <div className="mt-auto bg-surface-container-low rounded-2xl relative group shrink-0">
             <input
               className="w-full bg-transparent border-none focus:ring-2 focus:ring-primary/10 rounded-2xl px-4 py-4 pr-12 text-sm placeholder-outline-variant transition-all font-sans"
               placeholder="Ask anything..."
               type="text"
               value={input}
               onChange={e => setInput(e.target.value)}
               onKeyDown={handleKeyDown}
               disabled={sending}
             />
             <button onClick={handleSend} disabled={sending || !input.trim()} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary hover:scale-110 transition-transform disabled:opacity-50">
               <span className="material-symbols-outlined">send</span>
             </button>
          </div>
        </div>
      )}

      {tab === 'details' && (
        <div className="flex-1 overflow-y-auto px-6 space-y-6 pb-6">
          <div>
            <span className="text-xs font-bold text-primary uppercase mb-2 block">Path</span>
            <div className="text-sm text-on-surface-variant flex flex-wrap gap-1 items-center">
              {ancestorTexts.length > 0 ? ancestorTexts.map((text, i) => (
                <span key={i} className="flex gap-1 items-center">
                  {text} <span className="text-stone-300">›</span>
                </span>
              )) : null}
              <span className="text-[#163328] font-medium">{nodeText}</span>
            </div>
          </div>

          <div>
             <span className="text-xs font-bold text-primary uppercase mb-2 block">Type</span>
             <span className="bg-surface-container-highest px-2 py-1 rounded text-xs">Idea Node</span>
          </div>

          <div>
             <span className="text-xs font-bold text-primary uppercase mb-2 block">Children</span>
             <div className="text-sm">{childNodes.length} node{childNodes.length !== 1 ? 's' : ''}</div>
          </div>

          {ghostChildren.length > 0 && (
             <div className="pt-2">
               <button onClick={acceptAll} className="w-full py-2 bg-primary-fixed text-primary font-medium rounded-lg hover:opacity-90 transition-opacity text-sm">
                 Accept all suggestions ({ghostChildren.length})
               </button>
             </div>
          )}

          <div className="pt-4 border-t border-stone-100">
             <button onClick={() => deleteNode(selectedNodeId)} className="w-full py-2 text-error bg-error-container/30 hover:bg-error-container/60 rounded-lg text-sm font-medium transition-colors">
                Delete Node
             </button>
          </div>
        </div>
      )}
    </aside>
  )
}
