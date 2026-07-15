import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex flex-col items-center justify-center py-16 px-4', className)}
    >
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-surface-400" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-surface-500 dark:text-surface-400 text-center max-w-sm mb-4">{description}</p>
      )}
      {action}
    </motion.div>
  );
}
