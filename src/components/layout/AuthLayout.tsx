import { type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '../common/Logo';
import { ThemeToggle } from '../common/ThemeToggle';
import { Disclaimer } from '../common/Disclaimer';
import { pageTransition } from '../../animations/variants';

export function AuthLayout({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle: string;
}) {
  const location = useLocation();
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Visual side */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-clay-100 via-sand-100 to-sage-100 dark:from-clay-800/40 dark:via-sand-800 dark:to-sage-800/40 lg:block">
        <div className="absolute inset-0">
          <motion.div
            className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-clay-200/40 dark:bg-clay-600/20 blur-3xl"
            animate={{ x: [0, 20, 0], y: [0, -10, 0] }}
            transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute right-10 bottom-10 h-80 w-80 rounded-full bg-sage-200/40 dark:bg-sage-600/20 blur-3xl"
            animate={{ x: [0, -16, 0], y: [0, 12, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link to="/" aria-label="Saheli home">
            <Logo />
          </Link>
          <div className="max-w-md">
            <h2 className="font-display text-4xl font-600 text-clay-700 dark:text-clay-100">
              Your body, your questions, answered with care.
            </h2>
            <p className="mt-4 text-lg text-sand-700 dark:text-sand-300">
              Cycle tracking, a medically-reviewed library, and a grounded AI health assistant —
              for every stage, from first cycles to menopause.
            </p>
          </div>
          <p className="text-sm text-sand-600 dark:text-sand-400">
            Privacy-first. Your data is yours to export or delete, anytime.
          </p>
        </div>
      </div>

      {/* Form side */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between p-4 sm:p-6">
          <Link to="/" className="lg:hidden">
            <Logo />
          </Link>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center px-4 pb-10 sm:px-6">
          <div className="w-full max-w-md">
            <h1 className="font-display text-3xl font-600 text-sand-900 dark:text-sand-100">{title}</h1>
            <p className="mt-2 text-sand-600 dark:text-sand-300">{subtitle}</p>
            <div className="mt-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  variants={pageTransition}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="mt-8">
              <Disclaimer variant="inline" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
