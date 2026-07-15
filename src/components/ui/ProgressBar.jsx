import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export function ProgressBar({ value, max = 100, size = 'md', color, showLabel, className }) {
  const percentage = Math.min((value / max) * 100, 100);
  const sizes = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-3.5' };

  const colors = {
    low: 'bg-red-500',
    medium: 'bg-amber-500',
    high: 'bg-primary-500',
    perfect: 'bg-green-500',
  };

  const getColor = () => {
    if (color) return color;
    if (percentage >= 80) return colors.perfect;
    if (percentage >= 60) return colors.high;
    if (percentage >= 40) return colors.medium;
    return colors.low;
  };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between mb-1.5">
          <span className="text-sm text-surface-500 dark:text-surface-400">Progress</span>
          <span className="text-sm font-medium text-surface-700 dark:text-surface-300">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={cn('w-full bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden', sizes[size])}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={cn('h-full rounded-full transition-colors', getColor())}
        />
      </div>
    </div>
  );
}
