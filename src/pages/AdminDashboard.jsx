import { Card, CardHeader, CardTitle } from '../components/ui/Card';

const stats = [
  { title: 'Total Users', value: '2,847', change: '+182', positive: true },
  { title: 'Total Recruiters', value: '342', change: '+28', positive: true },
  { title: 'Active Jobs', value: '1,203', change: '+95', positive: true },
  { title: 'Resumes Analyzed', value: '14,892', change: '+1,234', positive: true },
  { title: 'Applications', value: '5,671', change: '+423', positive: true },
  { title: 'Platform Revenue', value: '$28,490', change: '+$3,240', positive: true },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">Admin Dashboard</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Platform overview and analytics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
          <CardHeader><CardTitle>Recent Registrations</CardTitle></CardHeader>
          <div className="space-y-3">
            {[
              { name: 'Sarah Chen', email: 'sarah@example.com', role: 'student', date: '2 hours ago' },
              { name: 'TechCorp Inc.', email: 'hr@techcorp.com', role: 'recruiter', date: '5 hours ago' },
              { name: 'Michael Torres', email: 'michael@example.com', role: 'student', date: '1 day ago' },
              { name: 'DataFlow Ltd.', email: 'jobs@dataflow.io', role: 'recruiter', date: '2 days ago' },
            ].map((user) => (
              <div key={user.email} className="flex items-center justify-between p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-medium">
                    {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-surface-900 dark:text-surface-100">{user.name}</p>
                    <p className="text-xs text-surface-500">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-surface-700 dark:text-surface-300 capitalize">{user.role}</p>
                  <p className="text-xs text-surface-400">{user.date}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Jobs</CardTitle></CardHeader>
          <div className="space-y-3">
            {[
              { title: 'Senior Software Engineer', company: 'Google', applicants: 45, status: 'active' },
              { title: 'Product Manager', company: 'Stripe', applicants: 32, status: 'active' },
              { title: 'Data Scientist', company: 'Microsoft', applicants: 28, status: 'active' },
              { title: 'UX Designer', company: 'Apple', applicants: 19, status: 'active' },
            ].map((job) => (
              <div key={job.title} className="flex items-center justify-between p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                <div>
                  <p className="text-sm font-medium text-surface-900 dark:text-surface-100">{job.title}</p>
                  <p className="text-xs text-surface-500">{job.company} &middot; {job.applicants} applicants</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-medium">
                  {job.status}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
