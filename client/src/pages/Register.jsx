import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

axios.defaults.withCredentials = true
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export default function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({ name: '', email: '', password: '' })

  useEffect(() => {
    axios.get(`${API_URL}/api/auth/me`).then(() => navigate('/welcome')).catch(() => {})
  }, [navigate])

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setFieldErrors({ name: '', email: '', password: '' })
    try {
      // client-side validation
      const trimmedName = String(name || '').trim()
      const trimmedEmail = String(email || '').trim().toLowerCase()
      const rawPassword = String(password || '')
      if (!trimmedName) return setFieldErrors((s) => ({ ...s, name: 'Name is required.' }))
      if (trimmedName.length < 2) return setFieldErrors((s) => ({ ...s, name: 'Name must be at least 2 characters.' }))
      if (!trimmedEmail) return setFieldErrors((s) => ({ ...s, email: 'Email is required.' }))
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i
      if (!emailRegex.test(trimmedEmail)) return setFieldErrors((s) => ({ ...s, email: 'Enter a valid email address.' }))
      if (!rawPassword) return setFieldErrors((s) => ({ ...s, password: 'Password is required.' }))
      if (rawPassword.length < 6) return setFieldErrors((s) => ({ ...s, password: 'Password must be at least 6 characters.' }))

      await axios.post(`${API_URL}/api/auth/register`, { name: trimmedName, email: trimmedEmail, password: rawPassword })
      navigate('/login')
    } catch (err) {
      const serverMsg = err?.response?.data?.message
      const fallback = err?.message || 'Service temporarily unavailable. Please try again.'
      const finalMsg = serverMsg || fallback
      setError(finalMsg)
      if (finalMsg.toLowerCase().includes('email')) {
        setFieldErrors((s) => ({ ...s, email: finalMsg }))
      } else if (finalMsg.toLowerCase().includes('password')) {
        setFieldErrors((s) => ({ ...s, password: finalMsg }))
      }
    }
  }

  // Password strength checks
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }

  return (
    <main className="card">
      <h1>Create account</h1>
      {error && <div className="error">{error}</div>}
      <form onSubmit={onSubmit}>
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} required />
          {fieldErrors.name && <div className="field-error">{fieldErrors.name}</div>}
        </label>
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          {fieldErrors.email && <div className="field-error">{fieldErrors.email}</div>}
        </label>
        <label>
          Password
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" minLength={6} required />
          {fieldErrors.password && <div className="field-error">{fieldErrors.password}</div>}
          <div className="pw-checklist">
            <p>Password strength (recommended):</p>
            <ul>
              <li style={{ color: checks.length ? 'green' : 'red' }}>At least 8 characters</li>
              <li style={{ color: checks.lowercase ? 'green' : 'red' }}>Contains lowercase letter</li>
              <li style={{ color: checks.uppercase ? 'green' : 'red' }}>Contains uppercase letter</li>
              <li style={{ color: checks.number ? 'green' : 'red' }}>Contains a number</li>
              <li style={{ color: checks.special ? 'green' : 'red' }}>Contains a special character (e.g. !@#$%)</li>
            </ul>
          </div>
        </label>
        <button type="submit">Register</button>
      </form>
      <p>Already have an account? <Link to="/login">Log in</Link></p>
    </main>
  )
}


