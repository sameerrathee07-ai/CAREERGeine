import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function AdminSettings() {
  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">System Settings</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Configure platform settings</p>
      </div>

      <Card>
        <CardHeader><CardTitle>General</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Platform Name</label>
            <input type="text" defaultValue="CareerGenie" className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Support Email</label>
            <input type="email" defaultValue="support@careergenie.ai" className="input-field" />
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Features</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: 'AI Resume Analysis', desc: 'Enable AI-powered resume analysis' },
            { label: 'Job Matching', desc: 'Enable intelligent job recommendations' },
            { label: 'Recruiter Portal', desc: 'Enable recruiter dashboard and job posting' },
            { label: 'Public Registration', desc: 'Allow new user signups' },
          ].map((feature) => (
            <div key={feature.label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-surface-900 dark:text-surface-100">{feature.label}</p>
                <p className="text-xs text-surface-500">{feature.desc}</p>
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
        <CardHeader><CardTitle>AI Configuration</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">API Key</label>
            <input type="password" value="sk-...****" className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Model</label>
            <select className="input-field">
              <option>Gemini Pro</option>
              <option>GPT-4</option>
              <option>Claude 3</option>
            </select>
          </div>
          <Button variant="secondary">Test Connection</Button>
        </CardContent>
      </Card>
    </div>
  );
}
