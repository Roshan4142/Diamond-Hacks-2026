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
    expandNode: (nodeText, ancestorTexts, chatHistory) =>
      post('expand-node', { nodeText, ancestorTexts, chatHistory }),
    rephrase: (text) => post('rephrase', { text }),
    chat: (nodeText, ancestorTexts, history, message) =>
      post('chat', { nodeText, ancestorTexts, history, message }),
    summarize: (messages) => post('summarize', { messages }),
  }
}
