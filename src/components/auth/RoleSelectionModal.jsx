import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { saveUserRole } from '../../store/slices/authSlice.js';

export function RoleSelectionModal() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const show = user && user.token && !user.role;

  const handleSelect = async (role) => {
    setLoading(true);
    setError(null);

    const result = await dispatch(saveUserRole({ role, user }));

    if (saveUserRole.fulfilled.match(result)) {
      if (role === 'recruiter') navigate('/recruiter', { replace: true });
      else navigate('/dashboard', { replace: true });
    } else {
      setError(result.payload || 'Failed to save role');
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md bg-white dark:bg-surface-900 rounded-2xl shadow-2xl p-8"
          >
            <div className="text-center mb-8">
              {user?.profilePhoto && (
                <img
                  src={user.profilePhoto}
                  alt=""
                  className="w-16 h-16 rounded-full mx-auto mb-4 ring-4 ring-primary-100 dark:ring-primary-900"
                />
              )}
              <h2 className="text-xl font-bold text-surface-900 dark:text-surface-100">
                Welcome, {user?.name || 'there'}!
              </h2>
              <p className="text-sm text-surface-500 dark:text-surface-400 mt-2">
                Tell us about yourself to get started.
              </p>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleSelect('student')}
                disabled={loading}
                className="w-full p-4 rounded-xl border-2 border-surface-200 dark:border-surface-700 hover:border-primary-500 dark:hover:border-primary-500 bg-white dark:bg-surface-800 text-left transition-all duration-200 group disabled:opacity-50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-surface-900 dark:text-surface-100">Student / Job Seeker</div>
                    <div className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">Upload your resume, get AI analysis, and find your dream job</div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelect('recruiter')}
                disabled={loading}
                className="w-full p-4 rounded-xl border-2 border-surface-200 dark:border-surface-700 hover:border-primary-500 dark:hover:border-primary-500 bg-white dark:bg-surface-800 text-left transition-all duration-200 group disabled:opacity-50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-surface-900 dark:text-surface-100">Recruiter / Employer</div>
                    <div className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">Post jobs, find top talent, and build your dream team</div>
                  </div>
                </div>
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800">
                <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {loading && (
              <div className="mt-4 flex justify-center">
                <svg className="animate-spin h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
