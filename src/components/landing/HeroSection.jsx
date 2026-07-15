import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../ui/Button';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary-50/50 to-transparent dark:from-primary-950/20 dark:to-transparent" />
      <div className="absolute top-20 -left-32 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 -right-32 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
              Powered by Advanced AI
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-surface-900 dark:text-surface-100 leading-tight mb-6">
              Your AI-Powered{' '}
              <span className="gradient-text">Career Companion</span>
            </h1>

            <p className="text-lg text-surface-600 dark:text-surface-400 mb-8 max-w-lg">
              Upload your resume, get instant AI analysis, and discover jobs perfectly matched to your skills. 
              Stop guessing, start growing.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/signup">
                <Button size="lg">
                  Get Started Free
                  <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Button>
              </Link>
              <a href="#features">
                <Button variant="secondary" size="lg">
                  Learn More
                </Button>
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden lg:block"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-700 rounded-3xl blur-2xl opacity-20" />
              <div className="relative glass-card p-1">
                <div className="rounded-2xl bg-gradient-to-br from-surface-50 to-surface-100 dark:from-surface-900 dark:to-surface-950 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-surface-800 shadow-sm">
                      <div>
                        <div className="text-sm font-medium text-surface-900 dark:text-surface-100">Resume Score</div>
                        <div className="text-xs text-surface-500">ATS Compatibility</div>
                      </div>
                      <div className="text-2xl font-bold text-primary-600">92%</div>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-surface-800 shadow-sm">
                      <div>
                        <div className="text-sm font-medium text-surface-900 dark:text-surface-100">Keyword Match</div>
                        <div className="text-xs text-surface-500">Job Alignment</div>
                      </div>
                      <div className="text-2xl font-bold text-green-500">85%</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white dark:bg-surface-800 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <span className="text-sm font-medium text-surface-900 dark:text-surface-100">AI Suggestions</span>
                      </div>
                      <p className="text-xs text-surface-500">Add more technical keywords to improve your match score by 15%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
