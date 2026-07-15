import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'inline-flex items-center justify-center px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50',
  outline: 'inline-flex items-center justify-center px-6 py-2.5 border-2 border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400 font-medium rounded-xl hover:bg-primary-50 dark:hover:bg-primary-950 transition-all duration-200 active:scale-[0.98]',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-6 py-2.5 text-sm',
  lg: 'px-8 py-3 text-base',
};

const Button = forwardRef(({ variant = 'primary', size = 'md', className, children, icon: Icon, loading, disabled, ...props }, ref) => {
  return (
    <motion.button
      ref={ref}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={cn(variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : Icon ? (
        <Icon className="w-4 h-4 mr-2" />
      ) : null}
      {children}
    </motion.button>
  );
});

Button.displayName = 'Button';
export default Button;
