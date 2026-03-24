import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  pageBackground, formCard, formTitle, formGroup, labelClass,
  inputClass, submitBtn, formError, formLink, mutedText
} from '../styles/common'
import toast from 'react-hot-toast'
import logo from '../assets/logo.png'

const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const errs = {}
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email'
    if (!form.password) errs.password = 'Password is required'
    else if (form.password.length < 6) errs.password = 'Min 6 characters'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      await login(form)
      toast.success('Welcome back!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`${pageBackground} flex items-center justify-center`}>
      <div className="w-full max-w-md px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src={logo} alt="VerseLy" className="h-16 mx-auto mb-3" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            VerseLy
          </h1>
          <p className={mutedText}>Share your verse with the world</p>
        </div>

        <div className={formCard}>
          <h2 className={formTitle}>Sign In</h2>
          <form onSubmit={handleSubmit}>
            <div className={formGroup}>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputClass}
                placeholder="you@example.com"
              />
              {errors.email && <p className={formError}>{errors.email}</p>}
            </div>
            <div className={formGroup}>
              <label className={labelClass}>Password</label>
              <input
                type="password"
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={inputClass}
                placeholder="••••••••"
              />
              {errors.password && <p className={formError}>{errors.password}</p>}
            </div>
            <button type="submit" disabled={loading} className={submitBtn}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className={`${mutedText} text-center mt-5`}>
            Don't have an account?{' '}
            <Link to="/register" className={formLink}>Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
