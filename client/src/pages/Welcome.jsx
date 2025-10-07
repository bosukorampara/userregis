import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

axios.defaults.withCredentials = true
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export default function Welcome() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  useEffect(() => {
    axios.get(`${API_URL}/api/auth/me`).then((res) => setUser(res.data)).catch(() => navigate('/login'))
  }, [navigate])

  async function logout() {
    await axios.post(`${API_URL}/api/auth/logout`)
    navigate('/login')
  }

  if (!user) return null

  return (
    <main className="card">
      <h1>Welcome, {user.name}!</h1>
      <button onClick={logout}>Logout</button>
    </main>
  )
}



