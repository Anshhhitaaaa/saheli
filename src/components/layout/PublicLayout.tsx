import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '../common/Logo';
import { ThemeToggle } from '../common/ThemeToggle';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { pageTransition } from '../../animations/variants';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/library', label: 'Library' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export function PublicLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-sand-200/60 bg-sand-50/80 backdrop-blur-md dark:border-sand-700/60 dark:bg-sand-900/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" aria-label="Saheli home">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((l) => {
              const active = location.pathname === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`relative rounded-lg px-3.5 py-2 text-sm font-500 transition-colors ${
                    active
                      ? 'text-clay-600 dark:text-clay-200'
                      : 'text-sand-600 hover:text-sand-900 dark:text-sand-300 dark:hover:text-sand-100'
                  }`}
                >
                  {l.label}
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-clay-400"
                    />
                  )}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <Button size="sm" onClick={() => navigate('/dashboard')}>
                Go to app
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                  Log in
                </Button>
                <Button size="sm" onClick={() => navigate('/signup')} className="hidden sm:inline-flex">
                  Get started
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageTransition}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="border-t border-sand-200/60 bg-sand-100/50 dark:border-sand-700/60 dark:bg-sand-800/30">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-sm">
              <Logo />
              <p className="mt-3 text-sm text-sand-600 dark:text-sand-400">
                Your body, your questions, answered with care. Saheli is an educational companion —
                not a replacement for your doctor.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm">
              <Link to="/library" className="text-sand-600 hover:text-clay-600 dark:text-sand-400">Library</Link>
              <Link to="/about" className="text-sand-600 hover:text-clay-600 dark:text-sand-400">About</Link>
              <Link to="/contact" className="text-sand-600 hover:text-clay-600 dark:text-sand-400">Contact</Link>
              <Link to="/login" className="text-sand-600 hover:text-clay-600 dark:text-sand-400">Log in</Link>
            </div>
          </div>
          <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-sand-200/60 pt-4 text-xs text-sand-500 dark:border-sand-700/60 sm:flex-row">
            <p>© 2026 Saheli. Designed & Developed by <span className="font-600 text-clay-600 dark:text-clay-300">Anshita Agrawal</span>.</p>
            <p>Educational content only — not medical advice.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
