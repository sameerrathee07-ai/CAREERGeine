import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Tabs } from '../components/ui/Tabs';
import { useState } from 'react';

const chartBars = {
  users: [1200, 1900, 1700, 2200, 2800, 2600, 3100, 3400, 3700, 3900, 4200, 4500],
  jobs: [200, 350, 400, 380, 500, 520, 600, 650, 700, 720, 800, 850],
  applications: [400, 600, 800, 750, 900, 1100, 1200, 1350, 1400, 1500, 1600, 1800],
};

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function BarChart({ data, color = 'primary' }) {
  const max = Math.max(...data);
  return (
    <div className="flex items-end justify-between gap-1 h-40">
      {data.map((value, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className={`w-full rounded-t-lg transition-all duration-500 ${
              color === 'primary' ? 'bg-primary-500 hover:bg-primary-600' :
              color === 'green' ? 'bg-green-500 hover:bg-green-600' :
              'bg-amber-500 hover:bg-amber-600'
            }`}
            style={{ height: `${(value / max) * 100}%` }}
          />
          <span className="text-xs text-surface-400">{months[i]}</span>
        </div>
      ))}
    </div>
  );
}

export default function AdminAnalytics() {
  const [tab, setTab] = useState('users');

  const dataMap = {
    users: { data: chartBars.users, color: 'primary', label: 'Total Users' },
    jobs: { data: chartBars.jobs, color: 'green', label: 'Active Jobs' },
    applications: { data: chartBars.applications, color: 'amber', label: 'Applications' },
  };

  const current = dataMap[tab];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">Analytics</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Platform growth and engagement metrics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Object.entries(dataMap).map(([key, val]) => (
          <Card key={key}>
            <p className="text-sm text-surface-500 dark:text-surface-400 mb-1">{val.label}</p>
            <p className="text-2xl font-bold text-surface-900 dark:text-surface-100">
              {val.data[val.data.length - 1].toLocaleString()}
            </p>
            <p className="text-xs text-green-500 mt-1">+{Math.round((val.data[val.data.length - 1] - val.data[0]) / val.data[0] * 100)}% growth</p>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Growth Trends</CardTitle>
          <Tabs
            tabs={[
              { label: 'Users', value: 'users' },
              { label: 'Jobs', value: 'jobs' },
              { label: 'Applications', value: 'applications' },
            ]}
            activeTab={tab}
            onChange={setTab}
          />
        </CardHeader>
        <div className="pt-4">
          <BarChart data={current.data} color={current.color} />
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Top Skills</CardTitle></CardHeader>
          <div className="space-y-2">
            {[
              { skill: 'React', count: 1240, pct: 85 },
              { skill: 'Python', count: 980, pct: 72 },
              { skill: 'TypeScript', count: 890, pct: 65 },
              { skill: 'Node.js', count: 760, pct: 55 },
              { skill: 'AWS', count: 620, pct: 45 },
            ].map((s) => (
              <div key={s.skill} className="flex items-center justify-between">
                <span className="text-sm text-surface-700 dark:text-surface-300">{s.skill}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 rounded-full" style={{ width: `${s.pct}%` }} />
                  </div>
                  <span className="text-xs text-surface-500 w-10 text-right">{s.count}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>User Distribution</CardTitle></CardHeader>
          <div className="space-y-4">
            {[
              { label: 'Students', value: 2505, pct: 88, color: 'bg-primary-500' },
              { label: 'Recruiters', value: 342, pct: 12, color: 'bg-green-500' },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-surface-700 dark:text-surface-300">{item.label}</span>
                  <span className="font-medium text-surface-900 dark:text-surface-100">{item.value.toLocaleString()}</span>
                </div>
                <div className="w-full h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
