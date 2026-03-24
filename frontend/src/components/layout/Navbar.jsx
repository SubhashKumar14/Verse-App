import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { HiHome, HiSearch, HiArchive, HiCog, HiLogout } from 'react-icons/hi'
import {
  navbarClass, navContainerClass, navBrandClass, navBrandText,
  navLogoClass, navSearchClass, navSearchInput, navLinksClass,
  navLinkClass, iconBtn
} from '../../styles/common'
import { useState } from 'react'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

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
          <div className="bg-gray-100 dark:bg-gray-800/80 p-1 rounded-xl">
            <img src="/src/assets/logo.png" alt="VerseLy" className={navLogoClass} />
          </div>
          <span className={navBrandText}>VerseLy</span>
        </Link>

        {/* Search */}
        {user && (
          <form onSubmit={handleSearch} className={navSearchClass}>
            <HiSearch className="text-gray-500 text-lg" />
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
            <Link to="/home" className={navLinkClass} title="Home">
              <HiHome className="text-xl" />
            </Link>
            <Link to="/archives" className={navLinkClass} title="Archives">
              <HiArchive className="text-xl" />
            </Link>
            <Link to="/settings" className={navLinkClass} title="Settings">
              <HiCog className="text-xl" />
            </Link>
            <Link to={`/profile/${user._id}`} className="ml-2" title="Profile">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xs cursor-pointer hover:scale-110 transition-transform">
                {user.username?.charAt(0).toUpperCase()}
              </div>
            </Link>
            <button onClick={handleLogout} className={iconBtn} title="Logout">
              <HiLogout className="text-xl" />
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
