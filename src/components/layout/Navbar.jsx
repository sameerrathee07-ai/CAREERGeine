import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '../../hooks/useTheme';
import { logout } from '../../store/slices/authSlice';
import { Dropdown, DropdownItem } from '../ui';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();
  const isLanding = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 dark:bg-surface-950/80 backdrop-blur-xl border-b border-surface-200/50 dark:border-surface-800/50'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <span className="text-white font-bold text-sm">CG</span>
            </div>
            <span className="text-xl font-bold text-surface-900 dark:text-surface-100">
              Career<span className="text-primary-600">Genie</span>
            </span>
          </Link>

          {isLanding && (
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {user ? (
              <Dropdown
                trigger={
                  <button className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
                    {user.profilePhoto ? (
                      <img src={user.profilePhoto} alt="" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-medium">
                        {user.name?.[0] || user.email?.[0] || 'U'}
                      </div>
                    )}
                  </button>
                }
              >
                <div className="px-3 py-2 border-b border-surface-200 dark:border-surface-700">
                  <p className="text-sm font-medium text-surface-900 dark:text-surface-100 truncate">{user.name || user.email}</p>
                  <p className="text-xs text-surface-500 capitalize">{user.role}</p>
                </div>
                <DropdownItem onClick={() => {}}>
                  <Link to={user.role === 'admin' ? '/admin' : user.role === 'recruiter' ? '/recruiter' : '/dashboard'} className="flex items-center gap-2 w-full">
                    Dashboard
                  </Link>
                </DropdownItem>
                <DropdownItem onClick={() => dispatch(logout())} danger>
                  Sign out
                </DropdownItem>
              </Dropdown>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link to="/login" className="btn-ghost text-sm">Sign in</Link>
                <Link to="/signup" className="btn-primary text-sm">Get Started</Link>
              </div>
            )}

            <button
              className="md:hidden p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <svg className="w-5 h-5 text-surface-600 dark:text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-950"
          >
            <div className="px-4 py-4 space-y-2">
              {isLanding && navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 text-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg"
                >
                  {link.label}
                </a>
              ))}
              {!user && (
                <div className="flex flex-col gap-2 pt-2">
                  <Link to="/login" className="btn-ghost text-sm w-full justify-center" onClick={() => setMobileOpen(false)}>Sign in</Link>
                  <Link to="/signup" className="btn-primary text-sm w-full justify-center" onClick={() => setMobileOpen(false)}>Get Started</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
