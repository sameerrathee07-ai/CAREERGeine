import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function RecruiterSettings() {
  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">Settings</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Manage your account preferences</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: 'New Applications', desc: 'Get notified when someone applies' },
            { label: 'Candidate Reviews', desc: 'Updates on reviewed candidates' },
            { label: 'Weekly Reports', desc: 'Weekly hiring statistics' },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-surface-900 dark:text-surface-100">{item.label}</p>
                <p className="text-xs text-surface-500">{item.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-9 h-5 bg-surface-300 dark:bg-surface-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600" />
              </label>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Danger Zone</CardTitle></CardHeader>
        <CardContent>
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
            <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">Delete Account</p>
            <p className="text-xs text-red-500 mb-3">Permanently delete your account and all associated data</p>
            <Button variant="danger">Delete Account</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
