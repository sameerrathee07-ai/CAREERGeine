import { useState } from 'react';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { SearchInput } from '../components/ui/SearchInput';
import { ProgressBar } from '../components/ui/ProgressBar';
import { EmptyState } from '../components/ui/EmptyState';
import Button from '../components/ui/Button';

const candidates = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Software Engineer', matchScore: 92, skills: ['React', 'Python', 'TypeScript'], status: 'reviewing', experience: '5 years' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'Product Manager', matchScore: 85, skills: ['Product Strategy', 'Analytics', 'Agile'], status: 'pending', experience: '7 years' },
  { id: 3, name: 'Carol Williams', email: 'carol@example.com', role: 'Data Scientist', matchScore: 78, skills: ['ML', 'Python', 'SQL'], status: 'accepted', experience: '4 years' },
  { id: 4, name: 'David Brown', email: 'david@example.com', role: 'UX Designer', matchScore: 71, skills: ['Figma', 'User Research', 'Prototyping'], status: 'rejected', experience: '3 years' },
  { id: 5, name: 'Eve Davis', email: 'eve@example.com', role: 'Software Engineer', matchScore: 88, skills: ['React', 'Node.js', 'AWS'], status: 'reviewing', experience: '6 years' },
];

export default function RecruiterCandidates() {
  const [search, setSearch] = useState('');

  const filtered = candidates.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">Candidates</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Review and manage applicants</p>
        </div>
        <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search candidates..." className="w-72" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No candidates found" description="Try adjusting your search" />
      ) : (
        <div className="space-y-3">
          {filtered.map((candidate) => (
            <Card key={candidate.id} hover>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium text-lg flex-shrink-0">
                  {candidate.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100">{candidate.name}</h3>
                      <p className="text-xs text-surface-500">{candidate.role} &middot; {candidate.experience}</p>
                    </div>
                    <Badge variant={candidate.status === 'accepted' ? 'success' : candidate.status === 'rejected' ? 'danger' : candidate.status === 'reviewing' ? 'primary' : 'warning'} size="sm">
                      {candidate.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 max-w-[120px]">
                      <ProgressBar value={candidate.matchScore} size="sm" />
                    </div>
                    <span className="text-xs font-medium text-primary-600">{candidate.matchScore}% match</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {candidate.skills.map((s) => (
                      <span key={s} className="px-2 py-0.5 text-xs rounded-md bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:flex-shrink-0">
                  <Button variant="secondary" size="sm">View</Button>
                  <Button size="sm">Contact</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
