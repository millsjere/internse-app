'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { DashboardShell } from '@/app/components/dashboard/DashboardShell';
import { Spinner } from '@/app/components/ui/Spinner';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, userType, isInitialized, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isInitialized || isLoading) return;
    if (!isAuthenticated || userType !== 'user') router.push('/login');
  }, [isInitialized, isLoading, isAuthenticated, userType, router]);

  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Spinner size="lg" className="text-blue-500" />
      </div>
    );
  }

  if (!isAuthenticated || userType !== 'user') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Spinner size="lg" className="text-blue-500" />
      </div>
    );
  }

  return <DashboardShell variant="user">{children}</DashboardShell>;
}
