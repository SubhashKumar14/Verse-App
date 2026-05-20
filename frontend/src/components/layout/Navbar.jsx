import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { HiLogout } from 'react-icons/hi'
import logo from '../../assets/logo.png'
import {
  navbarClass, navContainerClass, navBrandClass, navBrandText,
  navLogoClass, iconBtn
} from '../../styles/common'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <nav className={navbarClass}>
      <div className={navContainerClass}>
        {/* Logo + Brand */}
        <Link to="/home" className={navBrandClass}>
          <div className="bg-[var(--surface-2)] border border-[var(--border)] p-1.5 rounded-xl">
            <img src={logo} alt="VerseLy" className={navLogoClass} />
          </div>
          <span className={navBrandText}>VerseLy</span>
        </Link>

        {/* Avatar + Logout */}
        {user && (
          <div className="flex items-center gap-1.5">
            <Link to={`/profile/${user._id}`} title="Profile">
              <div className="w-8 h-8 rounded-full bg-[var(--accent)] text-[var(--accent-ink)] flex items-center justify-center font-semibold text-xs cursor-pointer hover:opacity-90 transition-all duration-200">
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
