import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

axios.defaults.withCredentials = true
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    // Auto-redirect if already authenticated
    axios.get(`${API_URL}/api/auth/me`).then(() => navigate('/welcome')).catch(() => {})
  }, [navigate])

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      await axios.post(`${API_URL}/api/auth/login`, { email, password })
      navigate('/welcome')
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed')
    }
  }

  return (
    <main className="card">
      <h1>Log in</h1>
      {error && <div className="error">{error}</div>}
      <form onSubmit={onSubmit}>
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </label>
        <label>
          Password
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </label>
        <button type="submit">Login</button>
      </form>
      <p>New here? <Link to="/register">Create an account</Link></p>
    </main>
  )
}



