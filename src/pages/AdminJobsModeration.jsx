import { useState } from 'react';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { SearchInput } from '../components/ui/SearchInput';
import Button from '../components/ui/Button';

const jobs = [
  { id: 1, title: 'Software Engineer', company: 'Google', status: 'active', applications: 45, posted: '2024-03-01' },
  { id: 2, title: 'Product Manager', company: 'Stripe', status: 'active', applications: 32, posted: '2024-02-15' },
  { id: 3, title: 'Data Scientist', company: 'StartupXYZ', status: 'pending', applications: 0, posted: '2024-03-10' },
  { id: 4, title: 'UX Designer', company: 'DesignHub', status: 'flagged', applications: 12, posted: '2024-02-20' },
  { id: 5, title: 'Senior Engineer', company: 'DataFlow Ltd.', status: 'closed', applications: 28, posted: '2024-01-10' },
];

export default function AdminJobsModeration() {
  const [search, setSearch] = useState('');

  const filtered = jobs.filter((j) =>
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">Job Moderation</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Review and manage job postings</p>
        </div>
        <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search jobs..." className="w-72" />
      </div>

      <Card>
        <CardHeader><CardTitle>All Jobs ({filtered.length})</CardTitle></CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-200 dark:border-surface-700">
                <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider pb-3 pr-4">Job Title</th>
                <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider pb-3 pr-4">Company</th>
                <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider pb-3 pr-4">Applications</th>
                <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider pb-3 pr-4">Status</th>
                <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider pb-3 pr-4">Posted</th>
                <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((job) => (
                <tr key={job.id} className="border-b border-surface-100 dark:border-surface-800 last:border-0">
                  <td className="py-4 pr-4">
                    <span className="text-sm font-medium text-surface-900 dark:text-surface-100">{job.title}</span>
                  </td>
                  <td className="py-4 pr-4">
                    <span className="text-sm text-surface-500">{job.company}</span>
                  </td>
                  <td className="py-4 pr-4">
                    <span className="text-sm font-medium text-surface-900 dark:text-surface-100">{job.applications}</span>
                  </td>
                  <td className="py-4 pr-4">
                    <Badge variant={job.status === 'active' ? 'success' : job.status === 'pending' ? 'warning' : job.status === 'flagged' ? 'danger' : 'default'} size="sm">
                      {job.status}
                    </Badge>
                  </td>
                  <td className="py-4 pr-4">
                    <span className="text-sm text-surface-500">{new Date(job.posted).toLocaleDateString()}</span>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm">Approve</Button>
                      <Button variant="ghost" size="sm" className="text-red-500">Flag</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
