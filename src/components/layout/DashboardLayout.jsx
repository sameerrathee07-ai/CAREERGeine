import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Sidebar } from './Sidebar';
import { toggleSidebar } from '../../store/slices/uiSlice';

export function DashboardLayout() {
  const dispatch = useDispatch();
  const { sidebarOpen } = useSelector((state) => state.ui);

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50 dark:bg-surface-950">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-950">
          <button
            className="md:hidden p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800"
            onClick={() => dispatch(toggleSidebar())}
          >
            <svg className="w-5 h-5 text-surface-600 dark:text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1" />
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
