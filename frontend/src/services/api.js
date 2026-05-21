import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
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
