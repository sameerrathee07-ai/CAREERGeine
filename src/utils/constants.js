export const ROLES = {
  STUDENT: 'student',
  RECRUITER: 'recruiter',
  ADMIN: 'admin',
};

export const APPLICATION_STATUS = {
  PENDING: 'pending',
  REVIEWING: 'reviewing',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
};

export const JOB_TYPE = {
  FULL_TIME: 'full-time',
  PART_TIME: 'part-time',
  CONTRACT: 'contract',
  INTERNSHIP: 'internship',
  REMOTE: 'remote',
};

export const EXPERIENCE_LEVEL = {
  ENTRY: 'entry',
  MID: 'mid',
  SENIOR: 'senior',
  LEAD: 'lead',
};

export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
};

export const NAV_ITEMS = {
  student: [
    { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
    { label: 'My Resume', path: '/dashboard/resume', icon: 'FileText' },
    { label: 'Job Matching', path: '/dashboard/jobs', icon: 'Briefcase' },
    { label: 'Applications', path: '/dashboard/applications', icon: 'Send' },
    { label: 'Notifications', path: '/dashboard/notifications', icon: 'Bell' },
    { label: 'Settings', path: '/dashboard/settings', icon: 'Settings' },
  ],
  recruiter: [
    { label: 'Overview', path: '/recruiter', icon: 'LayoutDashboard' },
    { label: 'Jobs', path: '/recruiter/jobs', icon: 'Briefcase' },
    { label: 'Candidates', path: '/recruiter/candidates', icon: 'Users' },
    { label: 'Applications', path: '/recruiter/applications', icon: 'Send' },
    { label: 'Company Profile', path: '/recruiter/company', icon: 'Building2' },
    { label: 'Settings', path: '/recruiter/settings', icon: 'Settings' },
  ],
  admin: [
    { label: 'Overview', path: '/admin', icon: 'LayoutDashboard' },
    { label: 'Users', path: '/admin/users', icon: 'Users' },
    { label: 'Recruiters', path: '/admin/recruiters', icon: 'Building2' },
    { label: 'Jobs', path: '/admin/jobs', icon: 'Briefcase' },
    { label: 'Analytics', path: '/admin/analytics', icon: 'BarChart3' },
    { label: 'Reports', path: '/admin/reports', icon: 'FileText' },
    { label: 'Settings', path: '/admin/settings', icon: 'Settings' },
  ],
};
