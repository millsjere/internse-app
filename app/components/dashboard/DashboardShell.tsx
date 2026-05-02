import { DashboardSidebar } from './DashboardSidebar';
import { DashboardTopbar } from './DashboardTopbar';

interface DashboardShellProps {
  children: React.ReactNode;
  variant: 'employer' | 'user';
}

export function DashboardShell({ children, variant }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <DashboardSidebar variant={variant} />
      <DashboardTopbar />

      {/* Main content area — offset for sidebar (w-60=240px) and topbar (h-14=56px) */}
      <main className="pl-60 pt-14">
        <div className="dash-page animate-fadeIn">
          {children}
        </div>
      </main>
    </div>
  );
}
