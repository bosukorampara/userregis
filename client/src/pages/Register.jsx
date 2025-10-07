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

  useEffect(() => {
    axios.get(`${API_URL}/api/auth/me`).then(() => navigate('/welcome')).catch(() => {})
  }, [navigate])

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      await axios.post(`${API_URL}/api/auth/register`, { name, email, password })
      navigate('/login')
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <main className="card">
      <h1>Create account</h1>
      {error && <div className="error">{error}</div>}
      <form onSubmit={onSubmit}>
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </label>
        <label>
          Password
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" minLength={6} required />
        </label>
        <button type="submit">Register</button>
      </form>
      <p>Already have an account? <Link to="/login">Log in</Link></p>
    </main>
  )
}


