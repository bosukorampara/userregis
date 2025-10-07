import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Welcome from './pages/Welcome.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/welcome" element={<Welcome />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="card">
      <h1>Not Found</h1>
      <button onClick={() => navigate('/login')}>Go to Login</button>
    </div>
  )
}

