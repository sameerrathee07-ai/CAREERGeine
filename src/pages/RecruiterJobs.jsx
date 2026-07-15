import { useState } from 'react';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { SearchInput } from '../components/ui/SearchInput';
import { EmptyState } from '../components/ui/EmptyState';
import Button from '../components/ui/Button';

const dummyJobs = [
  { id: 1, title: 'Software Engineer', location: 'Remote', applicants: 24, status: 'active', created: '2024-03-01' },
  { id: 2, title: 'Product Manager', location: 'San Francisco, CA', applicants: 18, status: 'active', created: '2024-02-15' },
  { id: 3, title: 'Data Scientist', location: 'New York, NY', applicants: 31, status: 'active', created: '2024-02-10' },
  { id: 4, title: 'UX Designer', location: 'Remote', applicants: 12, status: 'closed', created: '2024-01-20' },
];

export default function RecruiterJobs() {
  const [search, setSearch] = useState('');

  const filtered = dummyJobs.filter((j) =>
    j.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">Jobs</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Manage your job postings</p>
        </div>
        <div className="flex items-center gap-3">
          <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search jobs..." className="w-64" />
          <Button>+ Post Job</Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No jobs found" description="Create your first job posting" action={<Button>+ Post Job</Button>} />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-700">
                  <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider pb-3 pr-4">Job Title</th>
                  <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider pb-3 pr-4">Location</th>
                  <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider pb-3 pr-4">Applicants</th>
                  <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider pb-3 pr-4">Status</th>
                  <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((job) => (
                  <tr key={job.id} className="border-b border-surface-100 dark:border-surface-800 last:border-0">
                    <td className="py-4 pr-4">
                      <p className="text-sm font-medium text-surface-900 dark:text-surface-100">{job.title}</p>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="text-sm text-surface-500">{job.location}</span>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="text-sm font-medium text-surface-900 dark:text-surface-100">{job.applicants}</span>
                    </td>
                    <td className="py-4 pr-4">
                      <Badge variant={job.status === 'active' ? 'success' : 'default'} size="sm">
                        {job.status}
                      </Badge>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">Edit</Button>
                        <Button variant="ghost" size="sm" className="text-red-500">Close</Button>
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
