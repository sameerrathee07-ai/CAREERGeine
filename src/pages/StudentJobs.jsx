import { useState } from 'react';
import { SearchInput } from '../components/ui/SearchInput';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import Button from '../components/ui/Button';

const dummyJobs = [
  { id: 1, title: 'Software Engineer', company: 'Google', location: 'Mountain View, CA', salary: '$150K - $200K', matchScore: 92, skills: ['React', 'Python', 'TypeScript', 'System Design'], type: 'Full-time' },
  { id: 2, title: 'Product Manager', company: 'Stripe', location: 'San Francisco, CA', salary: '$160K - $210K', matchScore: 85, skills: ['Product Strategy', 'Analytics', 'A/B Testing', 'Agile'], type: 'Full-time' },
  { id: 3, title: 'Data Scientist', company: 'Microsoft', location: 'Redmond, WA', salary: '$140K - $190K', matchScore: 78, skills: ['ML', 'Python', 'SQL', 'TensorFlow'], type: 'Full-time' },
  { id: 4, title: 'UX Designer', company: 'Apple', location: 'Cupertino, CA', salary: '$130K - $180K', matchScore: 71, skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'], type: 'Contract' },
  { id: 5, title: 'Frontend Engineer', company: 'Vercel', location: 'Remote', salary: '$140K - $190K', matchScore: 88, skills: ['React', 'Next.js', 'TypeScript', 'TailwindCSS'], type: 'Remote' },
];

export default function StudentJobs() {
  const [search, setSearch] = useState('');

  const filtered = dummyJobs.filter((j) =>
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">Job Matching</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Discover jobs tailored to your skills</p>
        </div>
        <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search jobs..." className="sm:w-72" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No jobs found"
          description="Try adjusting your search or upload your resume for better matches"
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((job) => (
            <Card key={job.id} hover>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">{job.title}</h3>
                      <p className="text-sm text-surface-500">{job.company} &middot; {job.location}</p>
                    </div>
                    <Badge variant={job.matchScore >= 80 ? 'success' : job.matchScore >= 70 ? 'primary' : 'warning'}>
                      {job.matchScore}% Match
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {job.skills.map((skill) => (
                      <span key={skill} className="px-2 py-0.5 text-xs rounded-md bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400">{skill}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-surface-900 dark:text-surface-100">{job.salary}</p>
                    <p className="text-xs text-surface-500">{job.type}</p>
                  </div>
                  <Button size="sm">Apply</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
