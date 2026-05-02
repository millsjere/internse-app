import { AdminSidebar } from './AdminSidebar';
import { AdminTopbar } from './AdminTopbar';

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <AdminSidebar />
      <AdminTopbar />
      <main className="pl-60 pt-16">
        <div className="dash-page animate-fadeIn">
          {children}
        </div>
      </main>
    </div>
  );
}
