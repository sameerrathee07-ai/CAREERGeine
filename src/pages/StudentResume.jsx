import { ResumeUploadWidget, ResumeHistory } from '../components/student';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Tabs } from '../components/ui/Tabs';
import { useState } from 'react';

const dummyAnalysis = {
  resumeScore: 78,
  atsScore: 72,
  keywordScore: 85,
  suggestions: [
    'Add more action verbs to your experience section',
    'Include relevant keywords from the job description',
    'Quantify your achievements with numbers',
    'Add a professional summary section',
    'Optimize your skills section with industry-standard terms',
  ],
};

export default function StudentResume() {
  const [tab, setTab] = useState('analysis');

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">My Resume</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Upload, analyze, and optimize your resume</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ResumeUploadWidget />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <Tabs
            tabs={[
              { label: 'Analysis', value: 'analysis' },
              { label: 'History', value: 'history' },
            ]}
            activeTab={tab}
            onChange={setTab}
          />

          {tab === 'analysis' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Resume Score', value: dummyAnalysis.resumeScore, color: dummyAnalysis.resumeScore >= 70 ? 'bg-green-500' : 'bg-amber-500' },
                  { label: 'ATS Score', value: dummyAnalysis.atsScore, color: dummyAnalysis.atsScore >= 70 ? 'bg-green-500' : 'bg-amber-500' },
                  { label: 'Keyword Score', value: dummyAnalysis.keywordScore, color: dummyAnalysis.keywordScore >= 70 ? 'bg-green-500' : 'bg-amber-500' },
                ].map((item) => (
                  <Card key={item.label}>
                    <p className="text-sm text-surface-500 dark:text-surface-400 mb-2">{item.label}</p>
                    <div className="text-3xl font-bold text-surface-900 dark:text-surface-100 mb-3">{item.value}%</div>
                    <ProgressBar value={item.value} color={item.color} />
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader><CardTitle>AI Suggestions</CardTitle></CardHeader>
                <div className="space-y-2">
                  {dummyAnalysis.suggestions.map((s, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                      <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-medium text-primary-600 dark:text-primary-400">{i + 1}</span>
                      </div>
                      <p className="text-sm text-surface-600 dark:text-surface-400">{s}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          ) : (
            <ResumeHistory />
          )}
        </div>
      </div>
    </div>
  );
}
