import { motion } from 'framer-motion';
import { easeOut } from '../../animations/variants';

export function Logo({ size = 36, animated = true }: { size?: number; animated?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        initial={animated ? { rotate: -8, opacity: 0 } : false}
        animate={animated ? { rotate: 0, opacity: 1 } : undefined}
        transition={{ duration: 0.5, ease: easeOut }}
        aria-hidden
      >
        <rect width="32" height="32" rx="9" fill="currentColor" className="text-clay-500" />
        <path
          d="M16 7c-3 4-3 8 0 12 3-4 3-8 0-12z"
          fill="#FBEEEA"
        />
        <circle cx="16" cy="20.5" r="3.2" fill="none" stroke="#FBEEEA" strokeWidth="2" />
      </motion.svg>
      <span className="font-display text-xl font-600 tracking-tight text-clay-700 dark:text-clay-100">
        Saheli
      </span>
    </div>
  );
}
