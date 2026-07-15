import { motion } from 'framer-motion';

const activities = [
  { action: 'Resume uploaded', detail: 'resume_v2.pdf', time: '2 hours ago', type: 'upload' },
  { action: 'Resume analyzed', detail: 'Score: 92%', time: '1 hour ago', type: 'analysis' },
  { action: 'Job application sent', detail: 'Software Engineer at Google', time: '3 days ago', type: 'application' },
  { action: 'Profile updated', detail: 'Skills section updated', time: '1 week ago', type: 'profile' },
];

const typeIcons = {
  upload: (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>,
  analysis: (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
  application: (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>,
  profile: (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
};

export function ActivityTimeline() {
  return (
    <div>
      <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">Recent Activity</h3>
      <div className="space-y-0">
        {activities.map((activity, index) => {
          const Icon = typeIcons[activity.type];
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative flex gap-4 pb-6 last:pb-0"
            >
              {index < activities.length - 1 && (
                <div className="absolute left-5 top-10 bottom-0 w-px bg-surface-200 dark:bg-surface-700" />
              )}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                activity.type === 'upload' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                activity.type === 'analysis' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' :
                activity.type === 'application' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
              }`}>
                {Icon && <Icon className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-surface-900 dark:text-surface-100">{activity.action}</p>
                <p className="text-xs text-surface-500">{activity.detail}</p>
                <p className="text-xs text-surface-400 mt-0.5">{activity.time}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
