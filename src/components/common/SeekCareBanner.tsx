import { motion, AnimatePresence } from 'framer-motion';
import { HeartPulse, Phone } from 'lucide-react';
import { seekCareTransition } from '../../animations/variants';
import { useReducedMotionPref } from '../../hooks/useReducedMotionPref';

/**
 * Calm, supportive banner shown when a red-flag symptom or phrase is detected.
 * Entrance is slow and gentle — never alarming. No red flash, no shake, no pulse.
 * Non-color signaling: icon + text, not just color.
 */
export function SeekCareBanner({ show, reason }: { show: boolean; reason?: string }) {
  const reduced = useReducedMotionPref();
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          variants={seekCareTransition}
          initial={reduced ? { opacity: 0 } : 'hidden'}
          animate={reduced ? { opacity: 1 } : 'visible'}
          exit={reduced ? { opacity: 0 } : 'exit'}
          className="flex items-start gap-3 rounded-2xl border-2 border-clay-300 dark:border-clay-600/70 bg-clay-50 dark:bg-clay-800/30 px-4 py-4"
          role="alert"
          aria-live="polite"
        >
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-clay-100 dark:bg-clay-700/50 text-clay-600 dark:text-clay-200">
            <HeartPulse className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <p className="font-600 text-clay-800 dark:text-clay-100">
              Some things are worth a prompt conversation with your doctor.
            </p>
            <p className="mt-1 text-sm text-clay-700 dark:text-clay-200">
              {reason ??
                'What you described can sometimes need same-day care. This is not a reason to panic — it is a reason to reach out.'}{' '}
              If you feel it is an emergency, contact your local emergency number or go to the nearest emergency room.
            </p>
            <a
              href="tel:112"
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-clay-500 px-3.5 py-2 text-sm font-600 text-white hover:bg-clay-600 transition-colors"
            >
              <Phone className="h-4 w-4" />
              Call emergency services
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
