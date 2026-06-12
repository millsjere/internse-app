'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { DashboardShell } from '@/app/components/dashboard/DashboardShell';
import { Spinner } from '@/app/components/ui/Spinner';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, userType, isInitialized, isLoading } = useAuthStore();
  const redirectRef = useRef(false);

  useEffect(() => {
    if (!isInitialized || isLoading) return;

    // If not authenticated or wrong user type, redirect to login (only once)
    if ((!isAuthenticated || userType !== 'user') && !redirectRef.current) {
      redirectRef.current = true;
      router.push('/login');
    }
  }, [isInitialized, isLoading, isAuthenticated, userType, router]);

  // Show loading while auth is initializing
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Spinner size="lg" className="text-blue-500" />
      </div>
    );
  }

  // If not authenticated, return nothing (redirect is happening in useEffect)
  if (!isAuthenticated || userType !== 'user') {
    return null;
  }

  return <DashboardShell variant="user">{children}</DashboardShell>;
}
