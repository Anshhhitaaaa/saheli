import { type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeUp } from '../../animations/variants';
import { Button } from './Button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface AsyncStateProps {
  loading: boolean;
  error?: string | null;
  empty?: boolean;
  emptyTitle?: string;
  emptyBody?: ReactNode;
  emptyAction?: { label: string; onClick: () => void };
  onRetry?: () => void;
  skeleton?: ReactNode;
  children: ReactNode;
}

/** Wraps a data-driven view with smooth loading/empty/error transitions. */
export function AsyncState({
  loading,
  error,
  empty,
  emptyTitle = 'Nothing here yet',
  emptyBody,
  emptyAction,
  onRetry,
  skeleton,
  children,
}: AsyncStateProps) {
  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <motion.div key="loading" variants={fadeUp} initial="hidden" animate="visible" exit="exit">
          {skeleton}
        </motion.div>
      ) : error ? (
        <motion.div
          key="error"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="card flex flex-col items-center gap-3 p-8 text-center"
        >
          <AlertCircle className="h-8 w-8 text-danger" />
          <p className="font-600 text-sand-800 dark:text-sand-100">Something went wrong</p>
          <p className="max-w-sm text-sm text-sand-500 dark:text-sand-400">{error}</p>
          {onRetry && (
            <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={onRetry}>
              Try again
            </Button>
          )}
        </motion.div>
      ) : empty ? (
        <motion.div
          key="empty"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="card flex flex-col items-center gap-3 p-8 text-center"
        >
          <p className="font-600 text-sand-800 dark:text-sand-100">{emptyTitle}</p>
          <p className="max-w-sm text-sm text-sand-500 dark:text-sand-400">{emptyBody}</p>
          {emptyAction && (
            <Button variant="primary" size="sm" onClick={emptyAction.onClick} className="mt-1">
              {emptyAction.label}
            </Button>
          )}
        </motion.div>
      ) : (
        <motion.div key="content" variants={fadeUp} initial="hidden" animate="visible" exit="exit">
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
