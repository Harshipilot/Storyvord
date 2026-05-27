import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { loginUser } from '../api'

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const from = location.state?.from?.pathname || '/'

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (token) {
      navigate(from, { replace: true })
    }
  }, [from, navigate])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await loginUser({ username, password })
      // Prefer `access` token from SimpleJWT
      let raw = response.data?.access || response.data?.token || response.data?.authToken || null
      if (!raw) {
        throw new Error('Authentication token not returned by server')
      }
      // Strip surrounding quotes if present
      const token = typeof raw === 'string' ? raw.replace(/^"|"$/g, '') : raw
      localStorage.setItem('authToken', token)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-card">
        <h1>Welcome Back!</h1>
        <p className="auth-subtitle">Login to your account to continue</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Email or Username
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <div className="auth-actions">
            <label className="checkbox-field">
              <input type="checkbox" /> Remember me
            </label>
            <button type="button" className="text-button">
              Forgot Password?
            </button>
          </div>
          {error && <div className="form-error">{error}</div>}
          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>
        <div className="auth-footer">
          Don’t have an account? <Link to="/register">Sign up</Link>
        </div>
      </section>
    </div>
  )
}

export default Login
