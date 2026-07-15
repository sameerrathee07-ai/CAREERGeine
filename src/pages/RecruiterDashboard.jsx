import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

const stats = [
  { title: 'Active Jobs', value: '12', change: '+3', positive: true },
  { title: 'Total Applicants', value: '156', change: '+28', positive: true },
  { title: 'Interviews Scheduled', value: '18', change: '+5', positive: true },
  { title: 'Hires', value: '4', change: '+2', positive: true },
];

const recentApplicants = [
  { name: 'Alice Johnson', role: 'Software Engineer', score: 92, status: 'reviewing' },
  { name: 'Bob Smith', role: 'Product Manager', score: 85, status: 'pending' },
  { name: 'Carol Williams', role: 'Data Scientist', score: 78, status: 'accepted' },
  { name: 'David Brown', role: 'UX Designer', score: 71, status: 'rejected' },
];

export default function RecruiterDashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">Recruiter Dashboard</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Manage your job postings and candidates</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <p className="text-sm text-surface-500 dark:text-surface-400 mb-1">{stat.title}</p>
            <div className="text-2xl font-bold text-surface-900 dark:text-surface-100">{stat.value}</div>
            <div className={`flex items-center gap-1 mt-1 text-sm ${stat.positive ? 'text-green-500' : 'text-red-500'}`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.positive ? 'M5 10l7-7m0 0l7 7m-7-7v18' : 'M19 14l-7 7m0 0l-7-7m7 7V3'} />
              </svg>
              {stat.change} this month
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Recent Applicants</CardTitle></CardHeader>
          <div className="space-y-3">
            {recentApplicants.map((app) => (
              <div key={app.name} className="flex items-center justify-between p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-medium">
                    {app.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-surface-900 dark:text-surface-100">{app.name}</p>
                    <p className="text-xs text-surface-500">{app.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-primary-600">{app.score}%</span>
                  <Badge variant={app.status === 'accepted' ? 'success' : app.status === 'rejected' ? 'danger' : 'primary'} size="sm">
                    {app.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
          <div className="space-y-4">
            {[
              { text: 'New application received for Software Engineer', time: '10 min ago' },
              { text: 'Interview scheduled with Alice Johnson', time: '1 hour ago' },
              { text: 'Job posting "Product Manager" expired', time: '2 days ago' },
              { text: '3 new candidates matched for Data Scientist role', time: '3 days ago' },
            ].map((activity, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                <div>
                  <p className="text-sm text-surface-600 dark:text-surface-400">{activity.text}</p>
                  <p className="text-xs text-surface-400 mt-0.5">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
