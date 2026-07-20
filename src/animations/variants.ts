import type { Variants } from 'framer-motion';

// Soft, calm easing — "breathing, not bouncing"
export const easeOut = [0.4, 0, 0.2, 1] as const;
export const easeInOut = [0.4, 0, 0.2, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOut } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, ease: easeOut } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: easeOut } },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

export const staggerContainerSlow: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.08 },
  },
};

export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: easeOut } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.25, ease: easeOut } },
};

export const modalTransition: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: easeOut } },
  exit: { opacity: 0, y: 16, scale: 0.98, transition: { duration: 0.2, ease: easeOut } },
};

export const drawerTransition: Variants = {
  hidden: { x: '100%' },
  visible: { x: 0, transition: { duration: 0.35, ease: easeOut } },
  exit: { x: '100%', transition: { duration: 0.25, ease: easeOut } },
};

export const backdropTransition: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, ease: easeOut } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: easeOut } },
};

// Calm, supportive entrance for the seek-care banner — never alarming
export const seekCareTransition: Variants = {
  hidden: { opacity: 0, scale: 0.98, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeOut },
  },
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0.3, ease: easeOut } },
};

export const chipReveal: Variants = {
  hidden: { opacity: 0, y: 6, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.25, ease: easeOut } },
};

export const listItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: easeOut } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.2, ease: easeOut } },
};

// Viewport-triggered fade+rise for scroll sections
export const viewportFade = {
  variants: fadeUp,
  initial: 'hidden',
  whileInView: 'visible',
  viewport: { once: true, margin: '-80px' },
};

export const viewportStagger = {
  variants: staggerContainer,
  initial: 'hidden',
  whileInView: 'visible',
  viewport: { once: true, margin: '-80px' },
};
