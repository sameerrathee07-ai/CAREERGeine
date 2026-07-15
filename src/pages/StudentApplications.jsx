import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';

const dummyApps = [
  { id: 1, company: 'Google', role: 'Software Engineer', status: 'reviewing', date: '2024-03-15' },
  { id: 2, company: 'Stripe', role: 'Product Manager', status: 'pending', date: '2024-03-10' },
  { id: 3, company: 'Microsoft', role: 'Data Scientist', status: 'rejected', date: '2024-02-28' },
  { id: 4, company: 'Apple', role: 'UX Designer', status: 'accepted', date: '2024-02-20' },
];

const statusVariant = {
  pending: 'warning',
  reviewing: 'primary',
  accepted: 'success',
  rejected: 'danger',
};

export default function StudentApplications() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">Applications</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Track your job applications</p>
      </div>

      {dummyApps.length === 0 ? (
        <EmptyState title="No applications yet" description="Start applying to jobs to track them here" />
      ) : (
        <Card>
          <CardHeader><CardTitle>All Applications</CardTitle></CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-700">
                  <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider pb-3 pr-4">Company</th>
                  <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider pb-3 pr-4">Role</th>
                  <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider pb-3 pr-4">Date</th>
                  <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {dummyApps.map((app) => (
                  <tr key={app.id} className="border-b border-surface-100 dark:border-surface-800 last:border-0">
                    <td className="py-4 pr-4">
                      <span className="text-sm font-medium text-surface-900 dark:text-surface-100">{app.company}</span>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="text-sm text-surface-600 dark:text-surface-400">{app.role}</span>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="text-sm text-surface-500">{new Date(app.date).toLocaleDateString()}</span>
                    </td>
                    <td className="py-4">
                      <Badge variant={statusVariant[app.status]} size="sm">
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
