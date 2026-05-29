/**
 * frontend/src/components/layout/MobileBottomNav.jsx
 *
 * Bottom navigation bar for mobile.
 * Hidden on desktop and hidden when the user is not authenticated.
 */
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { HiHome, HiSearch, HiArchive, HiCog, HiUser, HiBell } from 'react-icons/hi'

const links = [
  { path: '/home', icon: HiHome, label: 'Home' },
  { path: '/search', icon: HiSearch, label: 'Explore' },
  { path: '/notifications', icon: HiBell, label: 'Notifications' },
  { path: '/archives', icon: HiArchive, label: 'Archives' },
]

const MobileBottomNav = () => {
  const location = useLocation()
  const { user } = useAuth()

  if (!user) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[var(--surface)] border-t border-[var(--border)] z-50 md:hidden pb-safe" aria-label="Mobile navigation">
      <div className="flex items-center justify-around h-16 px-2">
        {links.map((item) => {
          const IconComponent = item.icon
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              aria-label={item.label}
              className={`relative flex flex-col items-center justify-center w-full h-full transition-all duration-200 ${
                isActive ? 'text-[var(--accent)]' : 'text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              <IconComponent className="text-[24px]" />
              {isActive && (
                <span className="absolute bottom-2 w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></span>
              )}
            </Link>
          )
        })}
        <Link
          to={`/profile/${user._id}`}
          aria-label="Profile"
          className={`relative flex flex-col items-center justify-center w-full h-full transition-all duration-200 ${
            location.pathname.startsWith('/profile') ? 'text-[var(--accent)]' : 'text-[var(--muted)] hover:text-[var(--text)]'
          }`}
        >
          <HiUser className="text-[24px]" />
          {location.pathname.startsWith('/profile') && (
            <span className="absolute bottom-2 w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></span>
          )}
        </Link>
      </div>
    </nav>
  )
}

export default MobileBottomNav
