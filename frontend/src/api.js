import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

// JWT interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// AUTH
export const registerUser = (payload) =>
  apiClient.post('/api/register', payload)

export const loginUser = (payload) =>
  apiClient.post('/api/login', payload)

// TASK
export const createTask = ({ prompt, taskType, file }) => {
  const formData = new FormData()
  formData.append('task_type', taskType)
  formData.append('input_text', prompt || '')

  if (file) {
    formData.append('file', file)
  }

  return apiClient.post('/api/tasks/create/', formData)
}

export const fetchTasks = () =>
  apiClient.get('/api/tasks/')

export const fetchTaskStatus = (id) =>
  apiClient.get(`/api/tasks/${id}/status/`)

export const fetchTaskResult = (id) =>
  apiClient.get(`/api/tasks/${id}/result/`)

export const deleteTask = (id) =>
  apiClient.delete(`/api/tasks/${id}/`)

export const retryTask = (id) =>
  apiClient.post(`/api/tasks/${id}/retry/`)

// QUEUE
export const fetchQueueStatus = () =>
  apiClient.get('/api/queue/status/')

export default apiClient