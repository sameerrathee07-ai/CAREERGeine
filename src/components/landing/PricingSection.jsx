import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import { cn } from '../../utils/cn';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started',
    features: [
      '1 resume analysis',
      'Basic ATS score',
      '3 job matches per day',
      'Email support',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$12',
    period: '/month',
    description: 'For serious job seekers',
    features: [
      'Unlimited resume analysis',
      'Advanced ATS & keyword scoring',
      'Unlimited job matches',
      'Skill gap analysis',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '$29',
    period: '/month',
    description: 'For teams & recruiters',
    features: [
      'Everything in Pro',
      'Bulk resume analysis',
      'Recruiter dashboard',
      'API access',
      'Dedicated account manager',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-surface-100/50 dark:bg-surface-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium mb-4">
            Pricing
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-surface-900 dark:text-surface-100 mb-4">
            Simple, Transparent{' '}
            <span className="gradient-text">Pricing</span>
          </h2>
          <p className="text-lg text-surface-500 dark:text-surface-400 max-w-2xl mx-auto">
            Start free and upgrade when you need more power.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'relative rounded-2xl p-8',
                plan.popular
                  ? 'bg-primary-600 text-white shadow-xl shadow-primary-500/25 scale-105'
                  : 'glass-card'
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-white text-primary-600 text-xs font-semibold rounded-full shadow-lg">
                  Most Popular
                </div>
              )}
              <div className="mb-6">
                <h3 className={cn('text-lg font-semibold mb-1', plan.popular ? 'text-white' : 'text-surface-900 dark:text-surface-100')}>
                  {plan.name}
                </h3>
                <p className={cn('text-sm', plan.popular ? 'text-primary-100' : 'text-surface-500 dark:text-surface-400')}>
                  {plan.description}
                </p>
              </div>
              <div className="mb-6">
                <span className={cn('text-4xl font-bold', plan.popular ? 'text-white' : 'text-surface-900 dark:text-surface-100')}>
                  {plan.price}
                </span>
                <span className={cn('text-sm ml-1', plan.popular ? 'text-primary-100' : 'text-surface-500 dark:text-surface-400')}>
                  {plan.period}
                </span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <svg className={cn('w-4 h-4 flex-shrink-0', plan.popular ? 'text-primary-200' : 'text-primary-500')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className={cn('text-sm', plan.popular ? 'text-primary-100' : 'text-surface-600 dark:text-surface-400')}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              <Link to="/signup">
                <Button
                  variant={plan.popular ? 'secondary' : 'primary'}
                  className="w-full"
                >
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
