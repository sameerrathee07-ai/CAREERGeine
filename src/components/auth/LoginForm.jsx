import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../../store/slices/authSlice';
import Button from '../ui/Button';
import { GoogleSignInButton } from './GoogleSignInButton';

export function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((state) => state.auth);

  useEffect(() => { dispatch(clearError()); }, [dispatch]);

  useEffect(() => {
    if (user?.token && user?.role) {
      if (user.role === 'admin') navigate('/admin', { replace: true });
      else if (user.role === 'recruiter') navigate('/recruiter', { replace: true });
      else navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const onSubmit = (data) => {
    dispatch(loginUser({ email: data.email, password: data.password }));
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
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">Welcome back</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Sign in to your account</p>
      </div>

      <GoogleSignInButton />

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-surface-200 dark:border-surface-700" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-3 bg-white dark:bg-surface-900 text-surface-500 dark:text-surface-400">or continue with email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Email</label>
          <input type="email" {...register('email', { required: 'Email is required' })} className="input-field" placeholder="you@example.com" />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Password</label>
          <input type="password" {...register('password', { required: 'Password is required' })} className="input-field" placeholder="Enter your password" />
          {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded border-surface-300 dark:border-surface-600" />
            <span className="text-sm text-surface-600 dark:text-surface-400">Remember me</span>
          </label>
          <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700 font-medium">Forgot password?</Link>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800">
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <Button type="submit" loading={loading} className="w-full">Sign In</Button>
      </form>

      <p className="text-center text-sm text-surface-500 dark:text-surface-400 mt-6">
        Don&apos;t have an account?{' '}
        <Link to="/signup" className="text-primary-600 hover:text-primary-700 font-medium">Sign up</Link>
      </p>
    </div>
  );
}
