import { motion } from 'framer-motion';
import { Card } from '../ui/Card';

const stats = [
  {
    title: 'Resume Score',
    value: '92%',
    change: '+5%',
    positive: true,
    icon: (p) => (
      <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    gradient: 'from-primary-500 to-primary-600',
  },
  {
    title: 'ATS Score',
    value: '78%',
    change: '+12%',
    positive: true,
    icon: (p) => (
      <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    title: 'Job Matches',
    value: '24',
    change: '+8',
    positive: true,
    icon: (p) => (
      <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    gradient: 'from-green-500 to-emerald-600',
  },
  {
    title: 'Applications',
    value: '6',
    change: '-2',
    positive: false,
    icon: (p) => (
      <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
    ),
    gradient: 'from-violet-500 to-purple-600',
  },
];

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-surface-500 dark:text-surface-400">{stat.title}</span>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                {stat.icon({ className: 'w-5 h-5 text-white' })}
              </div>
            </div>
            <div className="text-2xl font-bold text-surface-900 dark:text-surface-100">{stat.value}</div>
            <div className={`flex items-center gap-1 mt-1 text-sm ${stat.positive ? 'text-green-500' : 'text-red-500'}`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.positive ? 'M5 10l7-7m0 0l7 7m-7-7v18' : 'M19 14l-7 7m0 0l-7-7m7 7V3'} />
              </svg>
              {stat.change} from last month
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
