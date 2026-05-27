import { useState } from 'react'

function Chat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hello! I’m your AI assistant. Ask me to summarize or transform text.' },
  ])
  const [draft, setDraft] = useState('')

  const sendMessage = (event) => {
    event.preventDefault()
    if (!draft.trim()) return
    setMessages((current) => [...current, { role: 'user', text: draft.trim() }])
    setMessages((current) => [
      ...current,
      { role: 'user', text: draft.trim() },
      {
        role: 'assistant',
        text: 'This chat UI is ready. Connect a chat API or task endpoint for real-time responses.',
      },
    ])
    setDraft('')
  }

  return (
    <div className="chat-view">
      <div className="page-header">
        <div>
          <h2>Chat</h2>
          <p>Talk to the AI assistant for prompt ideas and task support.</p>
        </div>
      </div>
      <div className="chat-panel">
        <div className="chat-messages">
          {messages.map((message, index) => (
            <div key={index} className={`chat-bubble ${message.role}`}>
              <span>{message.text}</span>
            </div>
          ))}
        </div>
        <form onSubmit={sendMessage} className="chat-input-row">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type a message..."
          />
          <button type="submit" className="primary-button">
            Send
          </button>
        </form>
      </div>
    </div>
  )
}

export default Chat
