import { StatsCards, ResumeUploadWidget, ResumeHistory, JobRecommendations, ActivityTimeline } from '../components/student';
import { Card } from '../components/ui/Card';

export default function StudentDashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">Dashboard</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Welcome back! Here&apos;s your career overview.</p>
      </div>

      <StatsCards />

      <div className="grid lg:grid-cols-2 gap-6">
        <ResumeUploadWidget />
        <JobRecommendations />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <ResumeHistory />
        <Card>
          <ActivityTimeline />
        </Card>
      </div>
    </div>
  );
}
