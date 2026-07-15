import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const stats = [
  { value: '50K+', label: 'Active Users', sub: 'Trusted by job seekers worldwide' },
  { value: '100K+', label: 'Resumes Processed', sub: 'Analyzed by our AI engine' },
  { value: '15K+', label: 'Job Matches', sub: 'Successful placements' },
  { value: '4.9/5', label: 'User Rating', sub: 'From verified users' },
];

export function StatsSection() {
  const ref = useRef();
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="py-24 bg-surface-900 dark:bg-surface-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl sm:text-5xl font-bold text-white mb-2">
                {stat.value}
              </div>
              <div className="text-primary-400 font-medium mb-1">{stat.label}</div>
              <div className="text-sm text-surface-400">{stat.sub}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
