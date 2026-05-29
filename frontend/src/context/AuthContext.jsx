/**
 * frontend/src/context/AuthContext.jsx
 *
 * Authentication state container for the React app.
 * - Bootstraps the session by calling `/api/common/user`
 * - Exposes login/register/logout helpers
 * - Stores `user` + `loading` state and makes it available via `useAuth()`
 */
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
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const initAuth = async () => {
      try {
        const { data } = await authService.getAuthUser()
        if (isMounted) setUser(data.payload)
      } catch {
        if (isMounted) setUser(null)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    initAuth()
    return () => {
      isMounted = false
    }
  }, [])

  const login = async (credentials) => {
    const { data } = await authService.login(credentials)
    setUser(data.payload)
    return data
  }

  const register = async (userData) => {
    const { data } = await authService.register(userData)
    setUser(data.payload)
    return data
  }

  const logout = async () => {
    try { await authService.logout() } catch { /* ignore */ }
    setUser(null)
  }

  const refreshUser = async () => {
    try {
      const { data } = await authService.getAuthUser()
      setUser(data.payload)
      return data.payload
    } catch {
      setUser(null)
      return null
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}
