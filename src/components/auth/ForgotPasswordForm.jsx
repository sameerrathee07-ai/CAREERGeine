import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { sendResetEmail } from '../../services/firebase.js';
import Button from '../ui/Button';

export function ForgotPasswordForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    try {
      await sendResetEmail(data.email);
      setSent(true);
    } catch (err) {
      setError('Failed to send reset email. Check the email address.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <Link to="/" className="inline-flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
            <span className="text-white font-bold text-sm">CG</span>
          </div>
          <span className="text-xl font-bold text-surface-900 dark:text-surface-100">CareerGenie</span>
        </Link>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">Reset password</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
          {sent ? 'Check your email for reset instructions' : "Enter your email and we'll send you reset instructions"}
        </p>
      </div>

      {sent ? (
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm text-surface-500 dark:text-surface-400 mb-4">
            If an account exists with that email, you&apos;ll receive reset instructions shortly.
          </p>
          <Link to="/login" className="text-primary-600 hover:text-primary-700 text-sm font-medium">Back to sign in</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Email</label>
            <input type="email" {...register('email', { required: 'Email is required' })} className="input-field" placeholder="you@example.com" />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800">
              <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
          <Button type="submit" loading={loading} className="w-full">Send Reset Link</Button>
        </form>
      )}

      <p className="text-center text-sm text-surface-500 dark:text-surface-400 mt-6">
        Remember your password?{' '}
        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">Sign in</Link>
      </p>
    </div>
  );
}
