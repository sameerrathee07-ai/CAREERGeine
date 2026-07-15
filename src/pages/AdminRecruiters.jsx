import { useState } from 'react';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { SearchInput } from '../components/ui/SearchInput';
import { EmptyState } from '../components/ui/EmptyState';
import Button from '../components/ui/Button';

const recruiters = [
  { id: 1, company: 'TechCorp Inc.', email: 'hr@techcorp.com', jobs: 12, hires: 4, status: 'verified', joined: '2024-01-15' },
  { id: 2, company: 'DataFlow Ltd.', email: 'jobs@dataflow.io', jobs: 8, hires: 2, status: 'verified', joined: '2024-02-01' },
  { id: 3, company: 'StartupXYZ', email: 'team@startup.xyz', jobs: 3, hires: 1, status: 'pending', joined: '2024-03-10' },
  { id: 4, company: 'DesignHub', email: 'hello@designhub.io', jobs: 6, hires: 0, status: 'verified', joined: '2024-02-20' },
];

export default function AdminRecruiters() {
  const [search, setSearch] = useState('');

  const filtered = recruiters.filter((r) =>
    r.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">Recruiters</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Manage recruiter accounts</p>
        </div>
        <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search companies..." className="w-72" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No recruiters found" />
      ) : (
        <Card>
          <CardHeader><CardTitle>All Recruiters ({filtered.length})</CardTitle></CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-700">
                  <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider pb-3 pr-4">Company</th>
                  <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider pb-3 pr-4">Email</th>
                  <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider pb-3 pr-4">Jobs</th>
                  <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider pb-3 pr-4">Hires</th>
                  <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider pb-3 pr-4">Status</th>
                  <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((recruiter) => (
                  <tr key={recruiter.id} className="border-b border-surface-100 dark:border-surface-800 last:border-0">
                    <td className="py-4 pr-4">
                      <span className="text-sm font-medium text-surface-900 dark:text-surface-100">{recruiter.company}</span>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="text-sm text-surface-500">{recruiter.email}</span>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="text-sm font-medium text-surface-900 dark:text-surface-100">{recruiter.jobs}</span>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="text-sm text-surface-500">{recruiter.hires}</span>
                    </td>
                    <td className="py-4 pr-4">
                      <Badge variant={recruiter.status === 'verified' ? 'success' : 'warning'} size="sm">
                        {recruiter.status}
                      </Badge>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">View</Button>
                        <Button variant="ghost" size="sm" className="text-red-500">
                          {recruiter.status === 'verified' ? 'Suspend' : 'Verify'}
                        </Button>
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
