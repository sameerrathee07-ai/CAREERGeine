import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';

const reports = [
  { title: 'Monthly Platform Report', desc: 'Complete overview of platform metrics for March 2024', date: 'Mar 31, 2024', type: 'PDF' },
  { title: 'User Growth Analysis', desc: 'Detailed analysis of user acquisition and retention', date: 'Mar 28, 2024', type: 'PDF' },
  { title: 'Job Market Insights', desc: 'Trending skills, salaries, and job categories', date: 'Mar 25, 2024', type: 'CSV' },
  { title: 'Recruiter Activity Report', desc: 'Recruiter engagement and hiring metrics', date: 'Mar 20, 2024', type: 'PDF' },
  { title: 'Revenue & Subscription', desc: 'Monthly recurring revenue and subscription stats', date: 'Mar 15, 2024', type: 'PDF' },
];

export default function AdminReports() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">Reports</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Download platform reports</p>
        </div>
        <Button variant="secondary">Generate Report</Button>
      </div>

      <div className="space-y-3">
        {reports.map((report) => (
          <Card key={report.title} hover>
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100">{report.title}</h3>
                  <p className="text-xs text-surface-500 mt-0.5">{report.desc}</p>
                  <p className="text-xs text-surface-400 mt-1">{report.date} &middot; {report.type}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
