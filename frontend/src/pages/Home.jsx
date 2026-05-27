import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createTask, fetchTaskStatus, fetchTaskResult } from '../api'

const services = [
  { title: 'Text Summarisation', subtitle: 'Summarize long text into short, clear summaries.', value: 'summarize' },
  { title: 'Text Enhancement', subtitle: 'Enhance your text for clarity, tone & polish.', value: 'enhance' },
  { title: 'Tag Generation', subtitle: 'Generate relevant tags & keywords instantly.', value: 'tags' },
  { title: 'Email Generation', subtitle: 'Create professional emails in seconds.', value: 'email' },
  { title: 'Text Translate', subtitle: 'Translate text into multiple languages accurately.', value: 'translate' },
]

function Home() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [selectedService, setSelectedService] = useState(services[0].value)
  const [prompt, setPrompt] = useState('')
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([])

  const navigate = useNavigate()
  const token = localStorage.getItem('authToken')

 

  useEffect(() => {
    setSelectedService(services[activeIndex].value)
  }, [activeIndex])

  const selectedServiceData = useMemo(
    () => services.find((item) => item.value === selectedService),
    [selectedService],
  )

  const submitTask = async (event) => {
    event.preventDefault()
    if (!token) {
      navigate('/login')
      return
    }

    setStatus('')
    if (!prompt && !file) {
      setStatus('Enter a prompt or upload a file.')
      return
    }

    // Append user's message to chat
    const userMsg = { role: 'user', text: prompt }
    setMessages((m) => [...m, userMsg])

    setLoading(true)

    try {
      const resp = await createTask({ prompt, taskType: selectedService, file })
      const taskId = resp?.data?.task_id
      setStatus(taskId ? `Task submitted (id: ${taskId}). Waiting for result...` : 'Task submitted. Waiting for result...')
      setPrompt('')
      setFile(null)

      if (!taskId) {
        setStatus('No task id returned.')
        setLoading(false)
        return
      }

      // Poll status until completed or failed (timeout ~60s)
      const start = Date.now()
      let finalResult = null
      while (Date.now() - start < 60000) {
        // eslint-disable-next-line no-await-in-loop
        const s = await fetchTaskStatus(taskId)
        const st = s.data?.status
        if (st === 'COMPLETED') {
          // eslint-disable-next-line no-await-in-loop
          const r = await fetchTaskResult(taskId)
          finalResult = r.data
          break
        }
        if (st === 'FAILED') {
          // eslint-disable-next-line no-await-in-loop
          const r = await fetchTaskResult(taskId)
          finalResult = r.data
          break
        }
        // wait 1s before next poll
        // eslint-disable-next-line no-await-in-loop
        await new Promise((res) => setTimeout(res, 1000))
      }

      if (finalResult) {
        const clean = formatResult(finalResult)
        const assistantMsg = { role: 'assistant', text: clean, taskId }
        setMessages((m) => [...m, assistantMsg])
        setStatus('Result received.')
      } else {
        setStatus('Timed out waiting for result. Check Task Status page.')
      }
    } catch (err) {
      setStatus(err.response?.data?.detail || 'Task submission failed.')
    } finally {
      setLoading(false)
    }
  }

  const formatResult = (res) => {
    try {
      const obj = res?.result ?? res
      let text = ''
      if (typeof obj === 'string') text = obj
      else if (Array.isArray(obj.tags)) text = obj.tags.join(', ')
      else text = obj.output ?? obj.translation ?? obj.summary ?? obj.email ?? obj.enhanced_text ?? obj.text ?? ''

      // unwrap quotes and unescape newlines
      if (typeof text === 'string') {
        if (text.startsWith('"') && text.endsWith('"')) text = text.slice(1, -1)
        text = text.replace(/\\n/g, '\n').trim()
      }

      if (!text && typeof obj === 'object') {
        const entries = Object.entries(obj)
          .filter(([key, value]) => value !== null && value !== undefined)
          .map(([key, value]) => {
            if (Array.isArray(value)) return `${key}: ${value.join(', ')}`
            return `${key}: ${typeof value === 'string' ? value : JSON.stringify(value, null, 2)}`
          })
        return entries.join('\n\n') || JSON.stringify(obj, null, 2)
      }

      return text || JSON.stringify(obj, null, 2)
    } catch (e) {
      return JSON.stringify(res, null, 2)
    }
  }

  const handleServiceClick = (index) => {
    setActiveIndex(index)
    setSelectedService(services[index].value)
  }

  return (
    <div className="home-view">
      <section className="hero-panel">
        <div className="hero-header-row">
          <div className="hero-copy-block">
            <div className="hero-label">AI Media Processing Platform</div>
            <h1>Smart AI tools for text and media processing</h1>
            <p className="hero-copy">
              Use fast, reliable AI services for summarization, translation, email creation, tagging and more.
            </p>
          </div>
          <div className="hero-action">
            <button
              className="ghost-button"
              onClick={() => navigate(token ? '/chat' : '/login')}
            >
              {token ? 'Go to Dashboard' : 'Login'}
            </button>
          </div>
        </div>
      </section>

      <section className="feature-panel">
        <div className="feature-header">
          <div>
            <p className="section-tag">Featured Tools</p>
            <h2>Discover AI features in motion</h2>
            <p className="section-copy">Browse the service cards as they transition automatically and choose the one you need.</p>
          </div>
          <div className="slider-controls">
            <button type="button" onClick={() => handleServiceClick((activeIndex - 1 + services.length) % services.length)}>
              ‹
            </button>
            <button type="button" onClick={() => handleServiceClick((activeIndex + 1) % services.length)}>
              ›
            </button>
          </div>
        </div>

        <div className="feature-slider">
          {services.map((item, index) => (
            <button
              key={item.value}
              type="button"
              className={`feature-card ${index === activeIndex ? 'active' : ''}`}
              onClick={() => handleServiceClick(index)}
            >
              <div className="feature-icon">{item.title
                .split(' ')
                .map((word) => word[0])
                .join('')}</div>
              <strong>{item.title}</strong>
              <p>{item.subtitle}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="assistant-card">
        <div className="assistant-header">
          <div>
            <h2>How can I help you today? 👋</h2>
            <p>Type your message or prompt here.</p>
          </div>
          <div className="assistant-meta">Selected: {selectedServiceData.title}</div>
        </div>

        <div className="assistant-form">
          <div className="chat-window">
            <div className="messages">
              {messages.map((m, idx) => (
                <div key={idx} className={`chat-message ${m.role}`}>
                  <div className="msg-role">{m.role === 'user' ? 'You' : 'Assistant'}</div>
                  <div className="msg-text">{m.text}</div>
                  {m.taskId && (
                    <div className="msg-meta">Task ID: <strong>{m.taskId}</strong></div>
                  )}
                </div>
              ))}
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter a prompt, text, or file instructions..."
            />

            <div className="assistant-actions">
              <button type="button" className="primary-button" onClick={submitTask} disabled={loading}>
                {loading ? 'Submitting...' : 'Send'}
              </button>
            </div>

            {status && <div className="form-note">{status}</div>}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
