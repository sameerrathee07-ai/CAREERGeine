import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ToastContainer } from './components/ui';
import { RoleSelectionModal } from './components/auth';
import { LandingLayout, AuthLayout, DashboardLayout } from './components/layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import StudentDashboard from './pages/StudentDashboard';
import StudentResume from './pages/StudentResume';
import StudentJobs from './pages/StudentJobs';
import StudentApplications from './pages/StudentApplications';
import StudentNotifications from './pages/StudentNotifications';
import StudentSettings from './pages/StudentSettings';
import RecruiterDashboard from './pages/RecruiterDashboard';
import RecruiterJobs from './pages/RecruiterJobs';
import RecruiterCandidates from './pages/RecruiterCandidates';
import RecruiterApplications from './pages/RecruiterApplications';
import RecruiterCompany from './pages/RecruiterCompany';
import RecruiterSettings from './pages/RecruiterSettings';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminRecruiters from './pages/AdminRecruiters';
import AdminJobsModeration from './pages/AdminJobsModeration';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminReports from './pages/AdminReports';
import AdminSettings from './pages/AdminSettings';
import NotFoundPage from './pages/NotFoundPage';

function ProtectedRoute({ children, roles }) {
  const user = useSelector((state) => state.auth.user);
  if (!user?.token) return <Navigate to="/login" replace />;
  if (user.role && roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  if (!user.role) {
    return <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950">
      <div className="text-center">
        <svg className="animate-spin h-8 w-8 text-primary-600 mx-auto" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="mt-4 text-sm text-surface-500">Setting up your account...</p>
      </div>
    </div>;
  }
  return children;
}

function PublicRoute({ children }) {
  const user = useSelector((state) => state.auth.user);
  if (user?.token) {
    if (user.role) {
      if (user.role === 'admin') return <Navigate to="/admin" replace />;
      if (user.role === 'recruiter') return <Navigate to="/recruiter" replace />;
      return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <RoleSelectionModal />
      <ToastContainer />
      <Routes>
        {/* Landing */}
        <Route element={<LandingLayout />}>
          <Route path="/" element={<LandingPage />} />
        </Route>

        {/* Auth */}
        <Route element={<PublicRoute><AuthLayout /></PublicRoute>}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
        </Route>

        {/* Student Dashboard */}
        <Route
          path="/dashboard"
          element={<ProtectedRoute roles={['student', 'admin']}><DashboardLayout /></ProtectedRoute>}
        >
          <Route index element={<StudentDashboard />} />
          <Route path="resume" element={<StudentResume />} />
          <Route path="jobs" element={<StudentJobs />} />
          <Route path="applications" element={<StudentApplications />} />
          <Route path="notifications" element={<StudentNotifications />} />
          <Route path="settings" element={<StudentSettings />} />
        </Route>

        {/* Recruiter Dashboard */}
        <Route
          path="/recruiter"
          element={<ProtectedRoute roles={['recruiter', 'admin']}><DashboardLayout /></ProtectedRoute>}
        >
          <Route index element={<RecruiterDashboard />} />
          <Route path="jobs" element={<RecruiterJobs />} />
          <Route path="candidates" element={<RecruiterCandidates />} />
          <Route path="applications" element={<RecruiterApplications />} />
          <Route path="company" element={<RecruiterCompany />} />
          <Route path="settings" element={<RecruiterSettings />} />
        </Route>

        {/* Admin Dashboard */}
        <Route
          path="/admin"
          element={<ProtectedRoute roles={['admin']}><DashboardLayout /></ProtectedRoute>}
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="recruiters" element={<AdminRecruiters />} />
          <Route path="jobs" element={<AdminJobsModeration />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
