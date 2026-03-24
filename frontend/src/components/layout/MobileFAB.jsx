import { Link, useLocation } from 'react-router-dom'
import { HiPlus } from 'react-icons/hi'
import { useAuth } from '../../context/AuthContext'

const MobileFAB = () => {
  const location = useLocation()
  const { user } = useAuth()

  // Only show FAB on specific pages (like Home/Feed) where creating a post makes sense
  // and only to logged-in users.
  if (!user || location.pathname !== '/home') return null

  return (
    <div className="fixed sm:hidden right-4 bottom-20 z-40 pb-safe">
      <div 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} // Simple scroll to top where CreatePost is mounted
        className="w-14 h-14 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 transition-transform"
      >
        <HiPlus className="text-2xl" />
      </div>
    </div>
  )
}

export default MobileFAB
