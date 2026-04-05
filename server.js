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
