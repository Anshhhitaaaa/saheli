import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { fadeUp, viewportFade } from '../../animations/variants';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  scrollReveal?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = '', hover, scrollReveal, onClick }: CardProps) {
  const Comp = scrollReveal || hover ? motion.div : 'div';
  const props = scrollReveal
    ? { ...viewportFade }
    : hover
      ? {
          whileHover: { y: -4 },
          transition: { duration: 0.2 },
        }
      : {};
  return (
    <Comp
      className={`card p-5 ${hover ? 'transition-shadow duration-200 hover:shadow-lift' : ''} ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      onClick={onClick}
      {...(props as object)}
    >
      {children}
    </Comp>
  );
}

export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mb-3 ${className}`}>{children}</div>;
}

export function SectionTitle({
  eyebrow,
  title,
  subtitle,
  center,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      className={center ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}
    >
      {eyebrow && (
        <span className="mb-2 block text-sm font-600 uppercase tracking-wider text-clay-500">
          {eyebrow}
        </span>
      )}
      <h2 className="font-display text-3xl font-600 text-sand-900 dark:text-sand-100 sm:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-lg text-sand-600 dark:text-sand-300">{subtitle}</p>
      )}
    </motion.div>
  );
}
