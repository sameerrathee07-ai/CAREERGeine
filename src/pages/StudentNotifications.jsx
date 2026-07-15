import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';

const notifications = [
  { id: 1, message: 'Your resume analysis is complete', time: '2 hours ago', read: false },
  { id: 2, message: 'New job match: Software Engineer at Google', time: '1 day ago', read: false },
  { id: 3, message: 'Your application to Stripe is being reviewed', time: '3 days ago', read: true },
  { id: 4, message: 'Profile completion suggested: Add your skills', time: '1 week ago', read: true },
];

export default function StudentNotifications() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">Notifications</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Stay updated with your career journey</p>
      </div>

      {notifications.length === 0 ? (
        <EmptyState title="No notifications" description="You&apos;re all caught up!" />
      ) : (
        <Card>
          <CardHeader><CardTitle>Recent Notifications</CardTitle></CardHeader>
          <div className="space-y-1">
            {notifications.map((n) => (
              <div key={n.id} className={`flex items-start gap-3 p-4 rounded-xl ${!n.read ? 'bg-primary-50 dark:bg-primary-900/10' : ''}`}>
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${n.read ? 'bg-surface-300 dark:bg-surface-600' : 'bg-primary-500'}`} />
                <div className="flex-1">
                  <p className="text-sm text-surface-700 dark:text-surface-300">{n.message}</p>
                  <p className="text-xs text-surface-400 mt-0.5">{n.time}</p>
                </div>
                {!n.read && <Badge variant="primary" size="sm">New</Badge>}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
