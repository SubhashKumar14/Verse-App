import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const ThemeContext = createContext()

const getSystemTheme = () =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

const applyTheme = (resolved) => {
  document.documentElement.setAttribute('data-theme', resolved)
  document.documentElement.style.colorScheme = resolved
}

export const ThemeProvider = ({ children }) => {
  const [preference, setPreference] = useState(() => {
    return localStorage.getItem('versely-theme') || 'system'
  })

  const resolved = preference === 'system' ? getSystemTheme() : preference

  // Apply theme on mount and when preference changes
  useEffect(() => {
    applyTheme(resolved)
  }, [resolved])

  // Listen for OS theme changes when in system mode
  useEffect(() => {
    if (preference !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme(getSystemTheme())
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [preference])

  const setTheme = useCallback((value) => {
    // Add transition class for smooth theme switch
    document.documentElement.classList.add('theme-transitioning')
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning')
    }, 350)

    setPreference(value)
    if (value === 'system') {
      localStorage.removeItem('versely-theme')
    } else {
      localStorage.setItem('versely-theme', value)
    }
  }, [])

  return (
    <ThemeContext.Provider value={{ theme: resolved, preference, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
