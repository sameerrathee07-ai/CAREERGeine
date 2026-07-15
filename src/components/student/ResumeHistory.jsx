import { useSelector } from 'react-redux';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { CardSkeleton } from '../ui/Skeleton';

export function ResumeHistory() {
  const { list, loading } = useSelector((state) => state.resumes);

  if (loading) {
    return (
      <Card>
        <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">Resume History</h3>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">Resume History</h3>
      {list.length === 0 ? (
        <EmptyState
          title="No resumes yet"
          description="Upload your first resume to get started"
        />
      ) : (
        <div className="space-y-3">
          {list.map((resume) => (
            <div key={resume._id} className="flex items-center justify-between p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-surface-900 dark:text-surface-100">{resume.filename}</p>
                  <p className="text-xs text-surface-500">{new Date(resume.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <Badge variant={resume.analysis ? 'success' : 'warning'} size="sm">
                {resume.analysis ? `${resume.analysis.resumeScore || 0}%` : 'Pending'}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
