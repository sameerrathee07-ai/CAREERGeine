import { cn } from '../../utils/cn';

const variants = {
  default: 'bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300',
  primary: 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300',
  success: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  warning: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  danger: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

export function Badge({ variant = 'default', size = 'md', className, children, dot }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 font-medium rounded-lg',
      variants[variant],
      sizes[size],
      className
    )}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', variants[variant].split(' ')[3])} />}
      {children}
    </span>
  );
}
