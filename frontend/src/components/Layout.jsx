import React from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const roleLabel = { ADMIN: 'Administrator', FACULTY: 'Faculty', STUDENT: 'Student' }[user?.role] || ''

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 shrink-0 bg-navy text-white flex flex-col">
        <div className="px-6 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
              <img src="/images/attendo-mark.svg" alt="" className="h-7 w-7" />
            </div>
            <div>
              <div className="font-serif text-2xl font-semibold tracking-tight">Attendo</div>
              <div className="text-[11px] text-white/50 mt-0.5">College Attendance System</div>
            </div>
          </div>
        </div>
        <div className="px-6 py-5">
          <div className="text-sm font-medium">{user?.name}</div>
          <div className="text-xs text-white/50 mt-0.5">{roleLabel}</div>
        </div>
        <div className="mt-auto px-6 py-5 border-t border-white/10">
          <button
            onClick={() => { logout(); navigate('/login') }}
            className="btn w-full justify-start border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
          >
            <span aria-hidden="true">↪</span>
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
