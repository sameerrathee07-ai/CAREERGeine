import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchRecommendedJobs } from '../../store/slices/jobSlice';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { CardSkeleton } from '../ui/Skeleton';
import Button from '../ui/Button';

export function JobRecommendations() {
  const dispatch = useDispatch();
  const { recommended, loading } = useSelector((state) => state.jobs);

  useEffect(() => {
    dispatch(fetchRecommendedJobs());
  }, [dispatch]);

  if (loading) {
    return (
      <Card>
        <CardHeader><CardTitle>Recommended Jobs</CardTitle></CardHeader>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended Jobs</CardTitle>
        <Badge variant="primary">{recommended.length} matches</Badge>
      </CardHeader>
      {recommended.length === 0 ? (
        <EmptyState
          title="No matches yet"
          description="Upload your resume to get personalized job recommendations"
        />
      ) : (
        <div className="space-y-3">
          {recommended.slice(0, 5).map((job, index) => (
            <motion.div
              key={job._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-sm font-semibold text-surface-900 dark:text-surface-100">{job.title}</h4>
                  <p className="text-xs text-surface-500">{job.company} &middot; {job.location}</p>
                </div>
                <Badge variant={job.matchScore >= 80 ? 'success' : job.matchScore >= 60 ? 'primary' : 'warning'} size="sm">
                  {job.matchScore || 0}% match
                </Badge>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {job.skills?.slice(0, 4).map((skill) => (
                  <span key={skill} className="px-2 py-0.5 text-xs rounded-md bg-surface-200 dark:bg-surface-700 text-surface-600 dark:text-surface-400">
                    {skill}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-primary-600 dark:text-primary-400">{job.salary || 'Competitive'}</span>
                <Button variant="ghost" size="sm">Apply</Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </Card>
  );
}
