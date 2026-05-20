import { useLocation } from 'react-router-dom'
import { HiPlus } from 'react-icons/hi'
import { useAuth } from '../../context/AuthContext'

const MobileFAB = () => {
  const location = useLocation()
  const { user } = useAuth()

  if (!user || location.pathname !== '/home') return null

  return (
    <div className="fixed sm:hidden right-4 bottom-20 z-40 pb-safe">
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Write a new post"
        className="w-14 h-14 bg-[var(--accent)] text-[var(--accent-ink)] rounded-full flex items-center justify-center shadow-lg shadow-[var(--accent)]/20 cursor-pointer hover:opacity-90 hover:scale-105 transition-all duration-200"
      >
        <HiPlus className="text-2xl" />
      </button>
    </div>
  )
}

export default MobileFAB
