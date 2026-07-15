import { useForm } from 'react-hook-form';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function RecruiterCompany() {
  const { register, handleSubmit } = useForm({
    defaultValues: { name: 'TechCorp Inc.', website: 'https://techcorp.com', size: '50-200', industry: 'Technology' },
  });

  const onSubmit = (data) => console.log('Update company:', data);

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">Company Profile</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Manage your company information</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Company Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Company Name</label>
              <input type="text" {...register('name')} className="input-field" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Website</label>
                <input type="url" {...register('website')} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Company Size</label>
                <select {...register('size')} className="input-field">
                  <option>1-50</option>
                  <option>50-200</option>
                  <option>200-1000</option>
                  <option>1000+</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Industry</label>
              <input type="text" {...register('industry')} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">About</label>
              <textarea rows={4} className="input-field" placeholder="Tell candidates about your company..." />
            </div>
            <Button type="submit">Save Changes</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Team Members</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: 'John Doe', email: 'john@techcorp.com', role: 'Admin' },
              { name: 'Jane Smith', email: 'jane@techcorp.com', role: 'Recruiter' },
            ].map((member) => (
              <div key={member.email} className="flex items-center justify-between p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-medium">
                    {member.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-surface-900 dark:text-surface-100">{member.name}</p>
                    <p className="text-xs text-surface-500">{member.email}</p>
                  </div>
                </div>
                <span className="text-xs text-surface-500">{member.role}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
