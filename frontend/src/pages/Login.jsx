import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  pageBackground, formCard, formTitle, formGroup, labelClass,
  inputClass, submitBtn, formError, formLink, mutedText
} from '../styles/common'
import toast from 'react-hot-toast'
import VerselyWordmark from '../components/common/VerselyWordmark'
import logo from '../assets/versely_logo.png'

const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values) => {
    try {
      await login(values)
      toast.success('Welcome back!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className={`${pageBackground} flex items-center justify-center`}>
      <div className="w-full max-w-md px-4">
        {/* Brand */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="VerseLy" className="h-[72px] w-[72px] object-contain" />
          </div>
          <VerselyWordmark size="lg" className="block mb-2" />
          <p className={`${mutedText} mt-1`}>Sign in to continue writing.</p>
        </div>

        <div className={formCard}>
          <h2 className={formTitle}>Welcome back</h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className={formGroup}>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                autoComplete="email"
                className={inputClass}
                placeholder="you@example.com"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /\S+@\S+\.\S+/, 
                    message: 'Invalid email',
                  },
                })}
              />
              {errors.email && <p className={formError}>{errors.email.message}</p>}
            </div>
            <div className={formGroup}>
              <label className={labelClass}>Password</label>
              <input
                type="password"
                autoComplete="current-password"
                className={inputClass}
                placeholder="••••••••"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Min 6 characters',
                  },
                })}
              />
              {errors.password && <p className={formError}>{errors.password.message}</p>}
            </div>
            <button type="submit" disabled={isSubmitting} className={submitBtn}>
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className={`${mutedText} text-center mt-6`}>
            Don't have an account?{' '}
            <Link to="/register" className={formLink}>Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
