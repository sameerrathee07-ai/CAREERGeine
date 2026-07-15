import { motion } from 'framer-motion';
import { Card } from '../ui/Card';

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Software Engineer at Google',
    avatar: 'SC',
    content: 'CareerGenie completely transformed my job search. The AI analysis helped me identify gaps I never noticed, and within two weeks I had interviews lined up.',
    rating: 5,
  },
  {
    name: 'James Wilson',
    role: 'Product Manager at Stripe',
    avatar: 'JW',
    content: 'The job matching is incredibly accurate. It found opportunities I would have never considered that turned out to be perfect fits for my skills.',
    rating: 5,
  },
  {
    name: 'Priya Patel',
    role: 'Data Scientist at Microsoft',
    avatar: 'PP',
    content: 'As a career switcher, CareerGenie was invaluable. The skill gap analysis showed me exactly what courses to take to transition successfully.',
    rating: 5,
  },
  {
    name: 'Michael Torres',
    role: 'UX Designer at Apple',
    avatar: 'MT',
    content: 'The ATS score feature is a game-changer. I went from never hearing back to getting multiple callbacks after optimizing my resume based on the suggestions.',
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-surface-900 dark:text-surface-100 mb-4">
            Loved by <span className="gradient-text">Thousands</span>
          </h2>
          <p className="text-lg text-surface-500 dark:text-surface-400 max-w-2xl mx-auto">
            Hear from professionals who transformed their careers with CareerGenie.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-surface-600 dark:text-surface-400 mb-4 leading-relaxed">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-medium">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-surface-900 dark:text-surface-100">{testimonial.name}</div>
                    <div className="text-xs text-surface-500">{testimonial.role}</div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
