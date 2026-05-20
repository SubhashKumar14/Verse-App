import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { HiHome, HiSearch, HiArchive, HiCog, HiLogout } from 'react-icons/hi'
import logo from '../../assets/logo.png'
import {
  navbarClass, navContainerClass, navBrandClass, navBrandText,
  navLogoClass, navSearchClass, navSearchInput, navLinksClass,
  navLinkClass, navLinkActiveClass, iconBtn
} from '../../styles/common'
import { useState } from 'react'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const location = useLocation()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <nav className={navbarClass}>
      <div className={navContainerClass}>
        {/* LOGO */}
        <Link to="/home" className={navBrandClass}>
          <div className="bg-[color:var(--surface-2)] border border-[color:var(--border)] p-1.5 rounded-2xl">
            <img src={logo} alt="VerseLy" className={navLogoClass} />
          </div>
          <span className={navBrandText}>VerseLy</span>
        </Link>

        {/* Search */}
        {user && (
          <form onSubmit={handleSearch} className={navSearchClass}>
            <HiSearch className="text-[color:var(--muted)] text-lg" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={navSearchInput}
            />
          </form>
        )}

        {/* Nav Links */}
        {user && (
          <div className={navLinksClass}>
            {/* On desktop the sidebar owns navigation — only show these icons on mobile */}
            <Link
              to="/home"
              className={`md:hidden ${location.pathname === '/home' ? navLinkActiveClass : navLinkClass}`}
              title="Home"
            >
              <HiHome className="text-xl" />
            </Link>
            <Link
              to="/archives"
              className={`md:hidden ${location.pathname === '/archives' ? navLinkActiveClass : navLinkClass}`}
              title="Archives"
            >
              <HiArchive className="text-xl" />
            </Link>
            <Link
              to="/settings"
              className={`md:hidden ${location.pathname === '/settings' ? navLinkActiveClass : navLinkClass}`}
              title="Settings"
            >
              <HiCog className="text-xl" />
            </Link>
            <Link to={`/profile/${user._id}`} className="ml-1" title="Profile">
              <div className="w-8 h-8 rounded-full bg-[color:var(--accent)] text-[color:var(--accent-ink)] flex items-center justify-center font-semibold text-xs cursor-pointer hover:brightness-95 transition-all duration-150">
                {user.username?.charAt(0).toUpperCase()}
              </div>
            </Link>
            <button onClick={handleLogout} className={iconBtn} title="Logout" aria-label="Log out">
              <HiLogout className="text-xl" />
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
