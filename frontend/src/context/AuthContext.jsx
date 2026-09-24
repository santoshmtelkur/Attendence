import React, { createContext, useContext, useState, useCallback } from 'react'
import { AuthApi } from '../api/endpoints'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('attendo_user')
    return raw ? JSON.parse(raw) : null
  })

  const login = useCallback(async (username, password) => {
    const data = await AuthApi.login(username, password)
    localStorage.setItem('attendo_token', data.token)
    localStorage.setItem('attendo_user', JSON.stringify(data))
    setUser(data)
    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('attendo_token')
    localStorage.removeItem('attendo_user')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
