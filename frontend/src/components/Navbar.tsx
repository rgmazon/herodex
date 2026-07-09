import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    setMenuOpen(false)
    navigate('/login')
  }

  const closeMenu = () => setMenuOpen(false)

  return (
    <nav className="bg-gray-900 border-b border-gray-700 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">

        {/* Logo */}
        <Link to="/" onClick={closeMenu} className="text-2xl font-bold text-white tracking-tight">
          Hero<span className="text-yellow-400">Dex</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
            Explore
          </Link>
          <Link to="/compare" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
            Compare
          </Link>
          {isAuthenticated && (
            <Link to="/favorites" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
              Favorites
            </Link>
          )}
          {isAuthenticated && (
            <Link
              to="/teams"
              className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
            >
              Teams
            </Link>
          )}
        </div>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="text-gray-400 text-sm">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="bg-gray-700 hover:bg-gray-600 text-white text-sm px-4 py-2 rounded-lg transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">
                Login
              </Link>
              <Link to="/register" className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 text-sm font-bold px-4 py-2 rounded-lg transition-colors">
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Hamburger button — mobile only */}
        <button
          className="md:hidden text-gray-300 hover:text-white transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            // X icon
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            // Hamburger icon
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="md:hidden mt-4 pb-2 flex flex-col gap-4 border-t border-gray-700 pt-4">
          <Link to="/" onClick={closeMenu} className="text-gray-300 hover:text-white text-sm font-medium transition-colors">
            Explore
          </Link>
          <Link to="/compare" onClick={closeMenu} className="text-gray-300 hover:text-white text-sm font-medium transition-colors">
            Compare
          </Link>
          {isAuthenticated && (
            <Link to="/favorites" onClick={closeMenu} className="text-gray-300 hover:text-white text-sm font-medium transition-colors">
              Favorites
            </Link>
          )}
          {isAuthenticated && (
            <Link
              to="/teams"
              className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
            >
              Teams
            </Link>
          )}

          <div className="border-t border-gray-700 pt-4 flex flex-col gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-gray-400 text-sm">{user?.name}</span>
                <button
                  onClick={handleLogout}
                  className="bg-gray-700 hover:bg-gray-600 text-white text-sm px-4 py-2 rounded-lg transition-colors text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={closeMenu} className="text-gray-300 hover:text-white text-sm font-medium transition-colors">
                  Login
                </Link>
                <Link to="/register" onClick={closeMenu} className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 text-sm font-bold px-4 py-2 rounded-lg transition-colors text-center">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}