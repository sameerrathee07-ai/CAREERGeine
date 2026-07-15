import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    q: 'How does the AI resume analysis work?',
    a: 'Our AI analyzes your resume across multiple dimensions including ATS compatibility, keyword optimization, content quality, and formatting. It provides a detailed score breakdown with actionable suggestions to improve each area.',
  },
  {
    q: 'Is my resume data secure?',
    a: 'Absolutely. We use industry-standard encryption for all data. Your resume is only used for analysis purposes and is never shared with third parties without your explicit consent.',
  },
  {
    q: 'How accurate is the job matching?',
    a: 'Our semantic matching engine achieves 95% accuracy by analyzing the full context of your skills and experience against job requirements, not just keyword matching.',
  },
  {
    q: 'Can recruiters use CareerGenie?',
    a: 'Yes! Recruiters can post jobs, manage applications, view candidate match scores, and track the entire hiring workflow from one dashboard.',
  },
  {
    q: 'What file formats are supported?',
    a: 'We support PDF, DOCX, and plain text formats. For best results, we recommend uploading PDF versions of your resume.',
  },
  {
    q: 'Is there a free plan?',
    a: 'Yes! Our free plan includes one resume analysis, basic ATS scoring, and up to 3 job matches per day. Upgrade to Pro for unlimited access.',
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section id="faq" className="py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-surface-900 dark:text-surface-100 mb-4">
            Frequently Asked{' '}
            <span className="gradient-text">Questions</span>
          </h2>
          <p className="text-lg text-surface-500 dark:text-surface-400">
            Got questions? We&apos;ve got answers.
          </p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="glass-card overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="text-sm font-medium text-surface-900 dark:text-surface-100 pr-4">
                  {faq.q}
                </span>
                <svg
                  className={`w-5 h-5 text-surface-400 flex-shrink-0 transition-transform duration-200 ${openIndex === index ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="px-5 pb-5 text-sm text-surface-500 dark:text-surface-400 leading-relaxed">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
