import { Link } from 'react-router-dom'
import { pageBackground, primaryBtn, secondaryBtn } from '../styles/common'

const Landing = () => {
  return (
    <div className={`${pageBackground} flex flex-col items-center justify-center min-h-[90vh] text-center px-4`}>
      <div className="max-w-3xl mx-auto flex flex-col items-center">
        
        {/* Brand/Logo Area */}
        <div className="mb-8 flex items-center justify-center bg-gray-100 dark:bg-gray-800/80 w-24 h-24 rounded-3xl border border-gray-200 dark:border-gray-700/80 shadow-sm">
          <img src="/src/assets/logo.png" alt="VerseLy" className="w-16 h-16 object-contain" />
        </div>

        {/* Hero Copy */}
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6 leading-tight">
          Join the conversation on <span className="text-blue-600 dark:text-blue-500">VerseLy.</span>
        </h1>
        
        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl leading-relaxed">
          The cleanest, fastest way to connect with your community. Share your thoughts, discover new ideas, and interact in a premium, distraction-free environment.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link to="/register" className={`${primaryBtn} py-3.5 px-8 text-base sm:w-auto w-full text-center flex items-center justify-center`}>
            Get Started
          </Link>
          <Link to="/login" className={`${secondaryBtn} py-3.5 px-8 text-base sm:w-auto w-full text-center flex items-center justify-center`}>
            Log In
          </Link>
        </div>

      </div>
    </div>
  )
}

export default Landing
