import { motion } from 'framer-motion';
import { Info } from 'lucide-react';

export function Disclaimer({
  variant = 'banner',
}: {
  variant?: 'banner' | 'inline';
}) {
  const text =
    'This is educational information, not medical advice. It does not replace a conversation with your healthcare provider.';
  if (variant === 'inline') {
    return (
      <p className="flex items-start gap-2 text-xs text-sand-500 dark:text-sand-400">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        {text}
      </p>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex items-start gap-2.5 rounded-xl border border-sage-200 dark:border-sage-700/50 bg-sage-50 dark:bg-sage-800/30 px-4 py-3 text-sm text-sage-700 dark:text-sage-200"
      role="note"
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{text}</span>
    </motion.div>
  );
}
