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
        className="w-14 h-14 bg-[color:var(--accent)] text-[color:var(--accent-ink)] rounded-full flex items-center justify-center shadow-md cursor-pointer hover:brightness-95 transition-all duration-150"
      >
        <HiPlus className="text-2xl" />
      </button>
    </div>
  )
}

export default MobileFAB
