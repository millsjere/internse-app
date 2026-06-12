'use client';

import { DashboardSidebar } from './DashboardSidebar';
import { DashboardTopbar } from './DashboardTopbar';
import { useUIStore } from '@/lib/store';

interface DashboardShellProps {
  children: React.ReactNode;
  variant: 'employer' | 'user';
}

export function DashboardShell({ children, variant }: DashboardShellProps) {
  const { isSidebarOpen, closeSidebar, toggleSidebar } = useUIStore();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Mobile overlay — only show on mobile when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden"
          style={{ zIndex: 25 }}
          onClick={closeSidebar}
        />
      )}

      <DashboardSidebar variant={variant} />
      <DashboardTopbar onMenuClick={toggleSidebar} />

      {/* Main content area — responsive padding for sidebar and topbar */}
      <main className="pt-14 md:pl-60">
        <div className="dash-page animate-fadeIn">
          {children}
        </div>
      </main>
    </div>
  );
}
