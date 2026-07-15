import { useState } from 'react';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { SearchInput } from '../components/ui/SearchInput';
import { EmptyState } from '../components/ui/EmptyState';
import Button from '../components/ui/Button';

const users = [
  { id: 1, name: 'Sarah Chen', email: 'sarah@example.com', role: 'student', status: 'active', joined: '2024-01-15' },
  { id: 2, name: 'Michael Torres', email: 'michael@example.com', role: 'student', status: 'active', joined: '2024-02-20' },
  { id: 3, name: 'Priya Patel', email: 'priya@example.com', role: 'recruiter', status: 'active', joined: '2024-01-10' },
  { id: 4, name: 'James Wilson', email: 'james@example.com', role: 'student', status: 'suspended', joined: '2024-03-01' },
  { id: 5, name: 'Alice Johnson', email: 'alice@example.com', role: 'recruiter', status: 'active', joined: '2024-02-15' },
  { id: 6, name: 'Bob Smith', email: 'bob@example.com', role: 'student', status: 'active', joined: '2024-03-10' },
];

export default function AdminUsers() {
  const [search, setSearch] = useState('');

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">Users</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Manage all platform users</p>
        </div>
        <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." className="w-72" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No users found" description="Try adjusting your search" />
      ) : (
        <Card>
          <CardHeader><CardTitle>All Users ({filtered.length})</CardTitle></CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-700">
                  <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider pb-3 pr-4">User</th>
                  <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider pb-3 pr-4">Email</th>
                  <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider pb-3 pr-4">Role</th>
                  <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider pb-3 pr-4">Status</th>
                  <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider pb-3 pr-4">Joined</th>
                  <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id} className="border-b border-surface-100 dark:border-surface-800 last:border-0">
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-medium">
                          {user.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <span className="text-sm font-medium text-surface-900 dark:text-surface-100">{user.name}</span>
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="text-sm text-surface-500">{user.email}</span>
                    </td>
                    <td className="py-4 pr-4">
                      <Badge variant={user.role === 'recruiter' ? 'primary' : 'default'} size="sm">
                        {user.role}
                      </Badge>
                    </td>
                    <td className="py-4 pr-4">
                      <Badge variant={user.status === 'active' ? 'success' : 'danger'} size="sm">
                        {user.status}
                      </Badge>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="text-sm text-surface-500">{new Date(user.joined).toLocaleDateString()}</span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">Edit</Button>
                        <Button variant="ghost" size="sm" className="text-red-500">Suspend</Button>
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
