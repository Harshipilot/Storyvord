import { useState } from 'react'
import { createTask } from '../api'

const taskTypes = [
  { label: 'Text Summarization', value: 'summarize' },
  { label: 'Text Enhancement', value: 'enhance' },
  { label: 'Tag Generation', value: 'tags' },
  { label: 'Email Generation', value: 'email' },
  { label: 'Text Translate', value: 'translate' },
]

function Upload() {
  const [taskType, setTaskType] = useState(taskTypes[0].value)
  const [file, setFile] = useState(null)
  const [prompt, setPrompt] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!file) {
      setStatus('Please choose a file before submitting.')
      return
    }
    setStatus('')
    setLoading(true)

    try {
      const resp = await createTask({ prompt, taskType, file })
      const taskId = resp?.data?.task_id
      setStatus(taskId ? `Upload submitted (id: ${taskId}). Visit Task Status to track progress.` : 'Upload submitted. Visit Task Status to track progress.')
      setFile(null)
      setPrompt('')
    } catch (err) {
      setStatus(err.response?.data?.detail || 'Failed to create task.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="upload-view">
      <div className="page-header">
        <div>
          <h2>Upload</h2>
          <p>Submit a file for AI processing and track the result in Task Status.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="upload-card">
        <label>
          Choose task type
          <select value={taskType} onChange={(e) => setTaskType(e.target.value)}>
            {taskTypes.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="file-upload-field">
          Select file
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </label>
        <label>
          Brief instructions (optional)
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Add any extra instructions for the task"
          />
        </label>
        <button type="submit" className="primary-button" disabled={loading}>
          {loading ? 'Uploading...' : 'Create Task'}
        </button>
        {status && <div className="form-note">{status}</div>}
      </form>
    </div>
  )
}

export default Upload
