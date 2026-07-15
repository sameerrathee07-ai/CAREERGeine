import { motion } from 'framer-motion';
import { Card } from '../ui/Card';

const capabilities = [
  {
    title: 'AI Resume Analysis',
    description:
      'Receive intelligent feedback on your resume including formatting, ATS optimization, grammar improvements, and actionable suggestions.',
    icon: (props) => (
      <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
    ),
    gradient: 'from-primary-500 to-primary-600',
    hoverGradient: 'from-primary-400 to-primary-500',
  },
  {
    title: 'Smart Job Matching',
    description:
      'Match your resume against job descriptions and discover the roles that best fit your skills and experience.',
    icon: (props) => (
      <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
    gradient: 'from-amber-500 to-orange-600',
    hoverGradient: 'from-amber-400 to-orange-500',
  },
  {
    title: 'ATS Compatibility',
    description:
      'Understand how well your resume performs against Applicant Tracking Systems with detailed scoring and improvement recommendations.',
    icon: (props) => (
      <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    gradient: 'from-emerald-500 to-teal-600',
    hoverGradient: 'from-emerald-400 to-teal-500',
  },
  {
    title: 'Secure Cloud Storage',
    description:
      'Safely upload, store, and manage resumes using Firebase Authentication and Firebase Storage with secure access controls.',
    icon: (props) => (
      <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
    gradient: 'from-violet-500 to-purple-600',
    hoverGradient: 'from-violet-400 to-purple-500',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export function CapabilitiesSection() {
  return (
    <section
      id="capabilities"
      className="py-24 bg-surface-900 dark:bg-surface-950"
      aria-labelledby="capabilities-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 text-primary-400 text-sm font-medium mb-6">
            Platform Capabilities
          </div>
          <h2
            id="capabilities-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6"
          >
            Powerful Features Built for Modern Job Seekers
          </h2>
          <p className="text-lg sm:text-xl text-surface-400 max-w-3xl mx-auto leading-relaxed">
            Everything you need to build a stronger resume and discover better career opportunities.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
          role="list"
          aria-label="Platform capabilities"
        >
          {capabilities.map((capability, index) => (
            <motion.article
              key={capability.title}
              variants={itemVariants}
              className="group"
              role="listitem"
            >
              <Card hover className="h-full flex flex-col group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${capability.gradient} flex items-center justify-center mb-5 group-hover:scale-105 group-hover:rotate-1 transition-all duration-300`}
                    aria-hidden="true"
                  >
                    {capability.icon({ className: 'w-7 h-7 text-white' })}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3">
                    {capability.title}
                  </h3>
                  <p className="text-sm text-surface-400 leading-relaxed flex-1">
                    {capability.description}
                  </p>
                </div>
              </Card>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}