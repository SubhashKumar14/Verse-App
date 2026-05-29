/**
 * frontend/src/services/api.js
 *
 * Axios instance shared by all frontend service modules.
 * - Uses `VITE_API_BASE` when provided, otherwise defaults to `/api`
 * - Sends cookies (`withCredentials`) for cookie-based auth
 * - Redirects to /login when the API returns 401 (except initial session check)
 */
import axios from 'axios'

const base = import.meta.env.VITE_API_BASE ?? '/api'

const api = axios.create({
  baseURL: base,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

// Response interceptor — redirect on auth failures, except the initial session check
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || ''
    if (
      error.response?.status === 401 &&
      !requestUrl.includes('/common/user') &&
      window.location.pathname !== '/login' &&
      window.location.pathname !== '/register'
    ) {
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
