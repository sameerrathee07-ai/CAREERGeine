import { Link } from 'react-router-dom';

const footerLinks = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Contact', href: '#' },
  ],
  Legal: [
    { label: 'Privacy', href: '#' },
    { label: 'Terms', href: '#' },
    { label: 'Security', href: '#' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-white dark:bg-surface-950 border-t border-surface-200 dark:border-surface-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <span className="text-white font-bold text-sm">CG</span>
              </div>
              <span className="text-lg font-bold text-surface-900 dark:text-surface-100">
                Career<span className="text-primary-600">Genie</span>
              </span>
            </Link>
            <p className="text-sm text-surface-500 dark:text-surface-400 max-w-xs">
              AI-powered resume analysis and intelligent job matching platform.
            </p>
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-3">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-300 transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 pt-8 border-t border-surface-200 dark:border-surface-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-surface-400 dark:text-surface-500">
            &copy; {new Date().getFullYear()} CareerGenie. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {['Twitter', 'GitHub', 'LinkedIn'].map((social) => (
              <a key={social} href="#" className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors">
                <span className="text-sm">{social}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
