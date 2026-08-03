import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { motion } from 'framer-motion';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline';
type Size = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    'bg-clay-500 text-white hover:bg-clay-600 active:bg-clay-700 shadow-soft',
  secondary:
    'bg-sage-500 text-white hover:bg-sage-600 active:bg-sage-700 shadow-soft',
  ghost:
    'text-sand-700 dark:text-sand-200 hover:bg-sand-100 dark:hover:bg-sand-800',
  outline:
    'border border-sand-300 dark:border-sand-700 text-sand-800 dark:text-sand-100 hover:bg-sand-100 dark:hover:bg-sand-800',
};

const sizes: Record<Size, string> = {
  xs: 'px-2.5 py-1 text-xs rounded-lg',
  sm: 'px-3.5 py-2 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3.5 text-base rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    leftIcon,
    rightIcon,
    loading,
    fullWidth,
    className = '',
    children,
    disabled,
    ...rest
  },
  ref,
) {
  return (
    <motion.button
      ref={ref}
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      transition={{ duration: 0.15 }}
      className={`inline-flex items-center justify-center gap-2 font-600 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-clay-400 focus-visible:ring-offset-1
        disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]}
        ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      {...(rest as React.ComponentProps<typeof motion.button>)}
    >
      {loading && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" />
        </svg>
      )}
      {!loading && leftIcon}
      {children}
      {!loading && rightIcon}
    </motion.button>
  );
});
