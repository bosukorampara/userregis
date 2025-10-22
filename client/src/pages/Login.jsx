import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

axios.defaults.withCredentials = true
// Default backend URL (can be overridden with VITE_API_URL)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' })

  useEffect(() => {
    // Auto-redirect if already authenticated
    axios.get(`${API_URL}/api/auth/me`).then(() => navigate('/welcome')).catch(() => {})
  }, [navigate])

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setFieldErrors({ email: '', password: '' })
    // Client-side validation with exact messages
    const trimmedEmail = String(email || '').trim()
    const rawPassword = String(password || '')
    if (!trimmedEmail) {
      setFieldErrors((s) => ({ ...s, email: 'Email is required.' }))
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i
    if (!emailRegex.test(trimmedEmail)) {
      setFieldErrors((s) => ({ ...s, email: 'Enter a valid email address.' }))
      return
    }
    if (!rawPassword) {
      setFieldErrors((s) => ({ ...s, password: 'Password is required.' }))
      return
    }
    try {
      await axios.post(`${API_URL}/api/auth/login`, { email: trimmedEmail, password: rawPassword })
      navigate('/welcome')
    } catch (err) {
      // Surface exact error message from server when available, otherwise show network/error text
      const serverMsg = err?.response?.data?.message
      const fallback = err?.message || 'Service temporarily unavailable. Please try again.'
      const finalMsg = serverMsg || fallback
      setError(finalMsg)
      // Map server field-specific issues to field errors when possible
      if (finalMsg.toLowerCase().includes('email')) {
        setFieldErrors((s) => ({ ...s, email: finalMsg }))
      } else if (finalMsg.toLowerCase().includes('password')) {
        setFieldErrors((s) => ({ ...s, password: finalMsg }))
      }
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
          {fieldErrors.email && <div className="field-error">{fieldErrors.email}</div>}
        </label>
        <label>
          Password
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
          {fieldErrors.password && <div className="field-error">{fieldErrors.password}</div>}
        </label>
        <button type="submit">Login</button>
      </form>
      <p>New here? <Link to="/register">Create an account</Link></p>
    </main>
  )
}



