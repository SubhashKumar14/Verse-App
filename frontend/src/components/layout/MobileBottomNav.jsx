/**
 * frontend/src/components/layout/MobileBottomNav.jsx
 *
 * Bottom navigation bar for mobile.
 * Hidden on desktop and hidden when the user is not authenticated.
 */
import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { HiHome, HiSearch, HiArchive, HiCog, HiUser, HiBell, HiMail } from 'react-icons/hi'
import { getUnreadCount } from '../../services/messageService'

const links = [
  { path: '/home', icon: HiHome, label: 'Home' },
  { path: '/search', icon: HiSearch, label: 'Explore' },
  { path: '/notifications', icon: HiBell, label: 'Notifications' },
  { path: '/messages', icon: HiMail, label: 'Messages' },
  { path: '/archives', icon: HiArchive, label: 'Archives' },
]

const MobileBottomNav = () => {
  const location = useLocation()
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!user) return

    const fetchUnread = async () => {
      try {
        const { data } = await getUnreadCount()
        setUnreadCount(data.count || 0)
      } catch {
        // fail silently
      }
    }

    fetchUnread()
    const interval = setInterval(fetchUnread, 8000)

    return () => clearInterval(interval)
  }, [user])

  if (!user) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[var(--surface)] border-t border-[var(--border)] z-50 md:hidden pb-safe" aria-label="Mobile navigation">
      <div className="flex items-center justify-around h-16 px-2">
        {links.map((item) => {
          const IconComponent = item.icon
          const isActive = location.pathname === item.path
          const isMessages = item.path === '/messages'
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
              {isMessages && unreadCount > 0 ? (
                <span className="absolute top-2 right-1/2 translate-x-3 bg-[var(--accent)] text-[var(--accent-ink)] text-[9px] font-bold h-4 min-w-4 px-1 flex items-center justify-center rounded-full border-2 border-[var(--surface)]">
                  {unreadCount}
                </span>
              ) : isActive && (
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
