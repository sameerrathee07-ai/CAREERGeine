import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export function Tabs({ tabs, activeTab, onChange, className }) {
  return (
    <div className={cn('flex gap-1 p-1 bg-surface-100 dark:bg-surface-800 rounded-xl', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            'relative px-4 py-2 text-sm font-medium rounded-lg transition-colors',
            activeTab === tab.value
              ? 'text-surface-900 dark:text-surface-100'
              : 'text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-300'
          )}
        >
          {activeTab === tab.value && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-white dark:bg-surface-700 rounded-lg shadow-sm"
              transition={{ type: 'spring', duration: 0.3 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            {tab.icon && <tab.icon className="w-4 h-4" />}
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  );
}
