import { createContext, useContext, useState, useEffect } from 'react'
import * as authService from '../services/authService'

const AuthContext = createContext(null)

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export const AuthProvider = ({ children }) => {
  const [user, setUser]     = useState(null)
  const [token, setToken]   = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  // On mount — if token exists, fetch the authenticated user
  useEffect(() => {
    const initAuth = async () => {
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const { data } = await authService.getAuthUser()
        setUser(data.payload)
      } catch {
        // token is invalid or expired
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setToken(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    initAuth()
  }, [token])

  const login = async (credentials) => {
    const { data } = await authService.login(credentials)
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.payload))
    setToken(data.token)
    setUser(data.payload)
    return data
  }

  const register = async (userData) => {
    const { data } = await authService.register(userData)
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.payload))
    setToken(data.token)
    setUser(data.payload)
    return data
  }

  const logout = async () => {
    try { await authService.logout() } catch { /* ignore */ }
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  const refreshUser = async () => {
    try {
      const { data } = await authService.getAuthUser()
      setUser(data.payload)
      localStorage.setItem('user', JSON.stringify(data.payload))
    } catch { /* ignore */ }
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}
