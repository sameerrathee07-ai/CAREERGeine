import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function StudentSettings() {
  const { user } = useSelector((state) => state.auth);
  const { register, handleSubmit } = useForm({
    defaultValues: { name: user?.name || '', email: user?.email || '' },
  });

  const onSubmit = (data) => {
    console.log('Update profile:', data);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">Settings</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Manage your profile and preferences</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Full Name</label>
              <input type="text" {...register('name')} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Email</label>
              <input type="email" {...register('email')} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Bio</label>
              <textarea rows={3} className="input-field" placeholder="Tell us about yourself..." />
            </div>
            <Button type="submit">Save Changes</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Preferences</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-surface-900 dark:text-surface-100">Email Notifications</p>
              <p className="text-xs text-surface-500">Receive job match alerts</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-9 h-5 bg-surface-300 dark:bg-surface-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600" />
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-surface-900 dark:text-surface-100">Weekly Digest</p>
              <p className="text-xs text-surface-500">Weekly career tips and insights</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-9 h-5 bg-surface-300 dark:bg-surface-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600" />
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
