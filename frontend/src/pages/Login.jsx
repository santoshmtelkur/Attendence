import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await login(username.trim(), password)
      const dest = data.role === 'ADMIN' ? '/admin' : data.role === 'FACULTY' ? '/faculty' : '/student'
      navigate(dest)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid username or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <div className="hidden md:flex flex-col justify-between bg-navy text-white px-14 py-12">
        <div>
          <div className="font-serif text-3xl font-semibold">Attendo</div>
          <div className="text-white/50 text-sm mt-1">College Attendance System</div>
        </div>
        <div className="max-w-sm">
          <img src="/images/attendance-hero.svg" alt="Attendance dashboard illustration" className="w-full max-w-md mb-8 rounded-2xl shadow-2xl" />
          <p className="font-serif text-2xl leading-snug text-white/90">
            Every class, every roll call, one accurate record.
          </p>
          <p className="text-white/50 text-sm mt-4">
            Faculty mark attendance in seconds. Students see exactly where they stand.
            Nobody discovers a shortage the week before exams.
          </p>
        </div>
        <div className="text-xs text-white/30">Departments · Sections · Subjects · Attendance</div>
      </div>

      <div className="flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-sm">
          <h1 className="font-serif text-2xl font-semibold text-ink mb-1">Sign in</h1>
          <p className="text-sm text-ink/50 mb-8">Use your college-issued username and password.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Username</label>
              <input
                className="input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. CSE21001 or admin"
                autoFocus
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="mt-8 border-t border-line pt-5 text-xs text-ink/40 leading-relaxed">
            Demo accounts (seeded locally) — admin / admin123 · anita.rao / password123 (faculty) · CSE21001 / password123 (student)
          </div>
        </div>
      </div>
    </div>
  )
}
