import { type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { modalTransition, backdropTransition } from '../../animations/variants';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  labelledBy?: string;
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export function Modal({ open, onClose, title, children, size = 'md', labelledBy }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
          <motion.div
            variants={backdropTransition}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0 bg-sand-900/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            variants={modalTransition}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            className={`relative w-full ${sizes[size]} card max-h-[90vh] overflow-y-auto rounded-b-none sm:rounded-2xl p-6`}
          >
            {title && (
              <div className="mb-4 flex items-center justify-between">
                <h2 id={labelledBy} className="font-display text-xl font-600 text-sand-900 dark:text-sand-100">
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="rounded-lg p-1.5 text-sand-500 hover:bg-sand-100 dark:hover:bg-sand-700 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
            {!title && (
              <button
                onClick={onClose}
                aria-label="Close"
                className="absolute right-4 top-4 rounded-lg p-1.5 text-sand-500 hover:bg-sand-100 dark:hover:bg-sand-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
