/**
 * frontend/src/components/ProtectedRoute.jsx
 *
 * Route guard component.
 * Renders a loading spinner while auth state initializes and redirects
 * unauthenticated users to /login.
 */
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { loadingClass } from '../styles/common'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className={loadingClass}>
        <div className="w-8 h-8 border-3 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  return children
}

export default ProtectedRoute
