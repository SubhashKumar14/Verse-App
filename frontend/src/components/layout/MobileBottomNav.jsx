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
    <nav className="fixed bottom-0 left-0 right-0 bg-[color:var(--bg)] border-t border-[color:var(--border)] z-50 md:hidden pb-safe">
      <div className="flex items-center justify-around h-14 px-2">
        {links.map((item) => {
          const IconComponent = item.icon
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              aria-label={item.label}
              className={`relative flex flex-col items-center justify-center w-full h-full transition-colors duration-150 ${
                isActive ? 'text-[color:var(--accent)]' : 'text-[color:var(--muted)] hover:text-[color:var(--text)]'
              }`}
            >
              <IconComponent className="text-[22px]" />
              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[color:var(--accent)]"></span>
              )}
            </Link>
          )
        })}
        <Link
          to={`/profile/${user._id}`}
          aria-label="Profile"
          className={`relative flex flex-col items-center justify-center w-full h-full transition-colors duration-150 ${
            location.pathname.startsWith('/profile') ? 'text-[color:var(--accent)]' : 'text-[color:var(--muted)] hover:text-[color:var(--text)]'
          }`}
        >
          <HiUser className="text-[22px]" />
          {location.pathname.startsWith('/profile') && (
            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[color:var(--accent)]"></span>
          )}
        </Link>
      </div>
    </nav>
  )
}

export default MobileBottomNav
