import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import Button from '../components/ui/Button';

const applications = [
  { id: 1, candidate: 'Alice Johnson', job: 'Software Engineer', applied: '2024-03-10', score: 92, status: 'reviewing' },
  { id: 2, candidate: 'Bob Smith', job: 'Product Manager', applied: '2024-03-08', score: 85, status: 'pending' },
  { id: 3, candidate: 'Carol Williams', job: 'Data Scientist', applied: '2024-03-05', score: 78, status: 'accepted' },
  { id: 4, candidate: 'David Brown', job: 'UX Designer', applied: '2024-03-01', score: 71, status: 'rejected' },
];

export default function RecruiterApplications() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">Applications</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Manage incoming applications</p>
      </div>

      {applications.length === 0 ? (
        <EmptyState title="No applications yet" description="Applications will appear here when candidates apply" />
      ) : (
        <Card>
          <CardHeader><CardTitle>All Applications</CardTitle></CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-700">
                  <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider pb-3 pr-4">Candidate</th>
                  <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider pb-3 pr-4">Job</th>
                  <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider pb-3 pr-4">Date</th>
                  <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider pb-3 pr-4">Score</th>
                  <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider pb-3 pr-4">Status</th>
                  <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id} className="border-b border-surface-100 dark:border-surface-800 last:border-0">
                    <td className="py-4 pr-4">
                      <span className="text-sm font-medium text-surface-900 dark:text-surface-100">{app.candidate}</span>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="text-sm text-surface-600 dark:text-surface-400">{app.job}</span>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="text-sm text-surface-500">{new Date(app.applied).toLocaleDateString()}</span>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="text-sm font-medium text-primary-600">{app.score}%</span>
                    </td>
                    <td className="py-4 pr-4">
                      <Badge variant={app.status === 'accepted' ? 'success' : app.status === 'rejected' ? 'danger' : app.status === 'reviewing' ? 'primary' : 'warning'} size="sm">
                        {app.status}
                      </Badge>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">Review</Button>
                        <Button variant="ghost" size="sm" className="text-green-500">Accept</Button>
                        <Button variant="ghost" size="sm" className="text-red-500">Reject</Button>
                      </div>
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
