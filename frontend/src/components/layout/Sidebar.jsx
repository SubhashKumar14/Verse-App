import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { HiHome, HiUser, HiArchive, HiCog, HiSearch } from 'react-icons/hi'
import { sidebarClass, sidebarLink, sidebarLinkActive } from '../../styles/common'

const links = [
  { path: '/home', icon: HiHome, label: 'Home' },
  { path: '/search', icon: HiSearch, label: 'Explore' },
  { path: '/archives', icon: HiArchive, label: 'Archives' },
  { path: '/settings', icon: HiCog, label: 'Settings' },
]

const Sidebar = () => {
  const location = useLocation()
  const { user } = useAuth()

  return (
    <aside className={sidebarClass}>
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
    </aside>
  )
}

export default Sidebar
