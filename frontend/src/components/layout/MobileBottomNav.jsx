import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { HiHome, HiSearch, HiArchive, HiCog, HiUser } from 'react-icons/hi'

const links = [
  { path: '/home', icon: HiHome, label: 'Home' },
  { path: '/search', icon: HiSearch, label: 'Explore' },
  { path: '/archives', icon: HiArchive, label: 'Archives' },
  { path: '/settings', icon: HiCog, label: 'Settings' },
]

const MobileBottomNav = () => {
  const location = useLocation()
  const { user } = useAuth()

  if (!user) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-[#0a0a0b]/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-800/80 z-50 md:hidden pb-safe">
      <div className="flex items-center justify-around h-14 px-2">
        {links.map((item) => {
          const IconComponent = item.icon
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
              }`}
            >
              <IconComponent className={`text-2xl ${isActive ? 'scale-110 transition-transform' : ''}`} />
            </Link>
          )
        })}
        <Link
          to={`/profile/${user._id}`}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
            location.pathname.startsWith('/profile') ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
          }`}
        >
          <HiUser className={`text-2xl ${location.pathname.startsWith('/profile') ? 'scale-110 transition-transform' : ''}`} />
        </Link>
      </div>
    </nav>
  )
}

export default MobileBottomNav
