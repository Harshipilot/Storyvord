import { useEffect, useState } from 'react'
import {
  deleteTask,
  fetchQueueStatus,
  fetchTaskResult,
  fetchTaskStatus,
  fetchTasks,
  retryTask,
} from '../api'

function TaskStatus() {
  const [taskId, setTaskId] = useState('')
  const [tasks, setTasks] = useState([])
  const [queueStatus, setQueueStatus] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)
  const [result, setResult] = useState(null)
  const [statusMessage, setStatusMessage] = useState('')

  const loadData = async () => {
    try {
      const [tasksRes, queueRes] = await Promise.all([fetchTasks(), fetchQueueStatus()])
      setTasks(tasksRes.data || [])
      setQueueStatus(queueRes.data || null)
    } catch (err) {
      setStatusMessage('Unable to load tasks. Please refresh.')
    }
  }

  const renderResult = (res) => {
    try {
      let obj = res
      if (obj && obj.result) obj = obj.result

      let text = ''
      if (typeof obj === 'string') text = obj
      else if (Array.isArray(obj.tags)) text = obj.tags.join(', ')
      else if (obj == null) text = ''
      else text = obj.output ?? obj.translation ?? obj.summary ?? obj.email ?? obj.enhanced_text ?? obj.text ?? ''

      if (!text && typeof obj === 'object') {
        const entries = Object.entries(obj)
          .filter(([key, value]) => value !== null && value !== undefined)
          .map(([key, value]) => {
            if (Array.isArray(value)) return `${key}: ${value.join(', ')}`
            return `${key}: ${typeof value === 'string' ? value : JSON.stringify(value, null, 2)}`
          })
        return entries.join('\n\n') || JSON.stringify(obj, null, 2)
      }

      if (text.startsWith('"') && text.endsWith('"')) {
        text = text.slice(1, -1)
      }

      text = text.replace(/\\n/g, '\n')

      return text.trim()
    } catch (e) {
      return JSON.stringify(res, null, 2)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const searchTask = async () => {
    if (!taskId.trim()) return
    setStatusMessage('')

    try {
      const [statusRes, resultRes] = await Promise.all([
        fetchTaskStatus(taskId.trim()),
        fetchTaskResult(taskId.trim()),
      ])
      setSelectedTask(statusRes.data)
      setResult(resultRes.data)
    } catch (err) {
      setStatusMessage('Task not found or status unavailable.')
      setSelectedTask(null)
      setResult(null)
    }
  }

  const handleRetry = async (id) => {
    try {
      await retryTask(id)
      setStatusMessage('Retry requested. Refreshing task list...')
      loadData()
    } catch (_) {
      setStatusMessage('Retry failed.')
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteTask(id)
      setStatusMessage('Task deleted.')
      loadData()
    } catch (_) {
      setStatusMessage('Delete failed.')
    }
  }

  return (
    <div className="status-view">
      <div className="page-header">
        <div>
          <h2>Task Status Dashboard</h2>
          <p>Track AI tasks in real time and manage your queue.</p>
        </div>
      </div>

      <section className="status-panel">
        <div className="status-query-card">
          <label>
            Enter Task ID
            <input
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
              placeholder="e.g. 15"
            />
          </label>
          <button type="button" className="secondary-button" onClick={searchTask}>
            Search
          </button>
          {statusMessage && <div className="form-note">{statusMessage}</div>}
        </div>

        <div className="status-overview-card">
          {selectedTask ? (
            <>
              <div className="task-meta">
                <span>Task ID: {selectedTask.id}</span>
                <span>Type: {selectedTask.task_type || 'Unknown'}</span>
              </div>
              <div className="task-progress-row">
                <div className="progress-bar" style={{ width: `${selectedTask.progress || 0}%` }} />
              </div>
              <div className="task-status-row">
                <div>Status</div>
                <div>{selectedTask.status || 'Pending'}</div>
              </div>
              {result && (
                <div className="task-result">
                  <strong>Result</strong>
                  <pre>{renderResult(result)}</pre>
                </div>
              )}
              <div className="task-actions">
                <button type="button" className="secondary-button" onClick={() => handleRetry(selectedTask.id)}>
                  Retry
                </button>
                <button type="button" className="text-button" onClick={() => handleDelete(selectedTask.id)}>
                  Delete
                </button>
              </div>
            </>
          ) : (
            <div className="empty-state">Search a task to view its latest status.</div>
          )}
        </div>
      </section>

      <section className="queue-card">
        <div className="queue-header">
          <h3>Queue Status</h3>
          <button type="button" className="secondary-button" onClick={loadData}>
            Refresh
          </button>
        </div>
        <div className="queue-grid">
          <div className="queue-item">
            <span>Position</span>
            <strong>{queueStatus?.position ?? '—'}</strong>
          </div>
          <div className="queue-item">
            <span>Active Tasks</span>
            <strong>{queueStatus?.active_tasks ?? '—'}</strong>
          </div>
          <div className="queue-item">
            <span>Pending</span>
            <strong>{queueStatus?.pending_count ?? '—'}</strong>
          </div>
          <div className="queue-item">
            <span>Estimated time</span>
            <strong>{queueStatus?.estimated_time || '—'}</strong>
          </div>
        </div>
      </section>

      <section className="task-list-card">
        <h3>Recent Tasks</h3>
        <div className="task-table">
          <div className="task-table-head">
            <span>ID</span>
            <span>Type</span>
            <span>Status</span>
            <span>Submitted</span>
          </div>
          {tasks.length === 0 ? (
            <div className="empty-state">No tasks available yet.</div>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="task-row">
                <span>{task.id}</span>
                <span>{task.task_type || '—'}</span>
                <span>{task.status || 'pending'}</span>
                <span>{task.created_at || task.submitted_at || '—'}</span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}

export default TaskStatus
