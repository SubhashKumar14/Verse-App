import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { HiHome, HiSearch, HiArchive, HiCog, HiUser, HiLogout } from 'react-icons/hi'
import { sidebarClass, sidebarLink, sidebarLinkActive, mutedText } from '../../styles/common'
import VerselyWordmark from '../common/VerselyWordmark'
import logo from '../../assets/versely_logo.png'

const links = [
  { path: '/home', icon: HiHome, label: 'Home' },
  { path: '/search', icon: HiSearch, label: 'Explore' },
  { path: '/archives', icon: HiArchive, label: 'Archives' },
  { path: '/settings', icon: HiCog, label: 'Settings' },
]

const Sidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <aside className={`${sidebarClass} h-full`} aria-label="Main navigation">
      {/* Brand */}
      <Link to="/home" className="flex items-center gap-3 px-3 mb-8">
        <img src={logo} alt="VerseLy" className="h-10 w-10 object-contain" />
        <VerselyWordmark size="lg" />
      </Link>

      {/* Navigation Links */}
      <div className="space-y-1">
        {links.map((item) => {
          const IconComponent = item.icon
          return (
            <Link
              key={item.path}
              to={item.path}
              className={location.pathname === item.path ? sidebarLinkActive : sidebarLink}
            >
              <IconComponent className="text-xl" />
              <span>{item.label}</span>
            </Link>
          )
        })}
        {user && (
          <Link
            to={`/profile/${user._id}`}
            className={location.pathname.startsWith('/profile') ? sidebarLinkActive : sidebarLink}
          >
            <HiUser className="text-xl" />
            <span>Profile</span>
          </Link>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Logout */}
      <div className="pt-4 border-t border-[var(--border)] mt-4">
        <button
          onClick={handleLogout}
          className={`${sidebarLink} w-full text-left`}
          aria-label="Log out"
        >
          <HiLogout className="text-xl" />
          <span>Log out</span>
        </button>
        {user && (
          <p className={`${mutedText} text-xs px-3 mt-3 truncate`}>
            @{user.username}
          </p>
        )}
      </div>
    </aside>
  )
}

export default Sidebar
