import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LANGUAGES } from '../config'
import { logout } from '../utils/auth'
import { useAuth } from '../utils/hooks'

function Header({ language, setLanguage }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const t = LANGUAGES[language]
  const { loggedIn, username, checkAuth } = useAuth()

  const [isScrolled, setIsScrolled] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    checkAuth()
  }, [pathname, checkAuth])

  const handleNav = (path) => {
    navigate(path)
    setIsMobileMenuOpen(false)
  }

  const handleLogout = () => {
    logout()
    setIsMobileMenuOpen(false)
  }
  
  const NavLink = ({ path, label, active, mobile }) => (
    <button
      onClick={() => handleNav(path)}
      className={`relative font-bold text-sm uppercase tracking-widest transition-all pb-1
        ${mobile ? 'text-gray-800 hover:text-red-600' : isScrolled ? 'text-gray-700 hover:text-red-600' : 'text-white/90 hover:text-white'}`}
    >
      {label}
      {active && !mobile && <motion.div layoutId="underline" className="absolute bottom-0 inset-x-0 h-0.5 bg-red-600" />}
    </button>
  )

  return (
    <motion.header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-gray-200/90 backdrop-blur-md shadow-md py-2' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-16">
        
        {/* Logo */}
        <div onClick={() => handleNav('/')} className="flex items-center gap-2 md:gap-3 cursor-pointer">
          <motion.span className="text-2xl md:text-3xl" animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 3, repeat: Infinity }}>🍜</motion.span>
          <div className="flex flex-col uppercase tracking-tighter">
            <span className={`text-base md:text-xl font-black ${isScrolled ? 'text-gray-900' : 'text-white'}`}>{t.app_title}</span>
            <span className={`text-[10px] md:text-[12px] font-bold ${isScrolled ? 'text-primary' : 'text-gray-400'}`}>AI Recognition</span>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-10">
          <NavLink path="/" label={t.nav_home} active={pathname === '/'} />
          <NavLink path="/search" label={t.nav_search} active={pathname === '/search'} />
          {loggedIn && <NavLink path="/library" label={t.nav_library} active={pathname === '/library'} />}

          {loggedIn ? (
            <div className="relative" onMouseEnter={() => setIsUserMenuOpen(true)} onMouseLeave={() => setIsUserMenuOpen(false)}>
              <button className={`font-bold text-sm uppercase tracking-widest flex items-center gap-2 ${isScrolled ? 'text-gray-700 hover:text-red-600' : 'text-white/90 hover:text-white'}`}>
                <span className="text-xl">👤</span>{username}
              </button>
              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-100 shadow-xl rounded-lg overflow-hidden">
                    <button onClick={() => handleNav('/history')} className="w-full px-5 py-3 text-left text-[11px] font-bold uppercase text-gray-600 hover:bg-gray-50 hover:text-red-600 transition-all">
                      📊 {t.nav_history}
                    </button>
                    <button onClick={handleLogout} className="w-full px-5 py-3 text-left text-[11px] font-bold uppercase text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all">
                      🚪 Đăng xuất
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button onClick={() => handleNav('/login')} className={`font-bold text-sm uppercase tracking-widest flex items-center gap-1 ${isScrolled ? 'text-gray-700 hover:text-red-600' : 'text-white/90 hover:text-white'}`}>
              <span className="text-xl">🔐</span>{language === 'VN' ? 'Đăng nhập' : 'Login'}
            </button>
          )}
        </nav>

        {/* Desktop Language */}
        <select value={language} onChange={(e) => setLanguage(e.target.value)}
          className={`hidden md:block border-2 rounded-full px-8 py-1 transition-all ${isScrolled ? 'text-gray-800 border-gray-800' : 'text-white border-white/20'}`}>
          <option value="VN" className="text-black">🌐VN</option>
          <option value="EN" className="text-black">🌐EN</option>
        </select>

        {/* Mobile Menu Button */}
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className={`md:hidden p-2 ${isScrolled ? 'text-gray-800' : 'text-white'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? 
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> :
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg">
            <nav className="flex flex-col px-4 py-3 space-y-3">
              <NavLink path="/" label={t.nav_home} active={pathname === '/'} mobile />
              <NavLink path="/search" label={t.nav_search} active={pathname === '/search'} mobile />
              {loggedIn && <NavLink path="/library" label={t.nav_library} active={pathname === '/library'} mobile />}
              {loggedIn && <NavLink path="/history" label={t.nav_history} active={pathname === '/history'} mobile />}
              
              <div className="pt-2 border-t border-gray-200">
                {loggedIn ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-800 font-bold text-sm">
                      <span className="text-xl">👤</span>{username}
                    </div>
                    <button onClick={handleLogout} className="w-full text-left text-sm font-bold uppercase text-gray-700 hover:text-red-600">
                      🚪 Đăng xuất
                    </button>
                  </div>
                ) : (
                  <button onClick={() => handleNav('/login')} className="flex items-center gap-2 text-sm font-bold uppercase text-gray-700 hover:text-red-600">
                    <span className="text-xl">🔐</span>{language === 'VN' ? 'Đăng nhập' : 'Login'}
                  </button>
                )}
              </div>

              <div className="pt-2 border-t border-gray-200">
                <select value={language} onChange={(e) => setLanguage(e.target.value)}
                  className="w-full border-2 border-gray-800 text-gray-800 rounded-full px-4 py-2 text-sm font-bold">
                  <option value="VN">🌐 Tiếng Việt</option>
                  <option value="EN">🌐 English</option>
                </select>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
export default Header
