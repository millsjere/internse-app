'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { DashboardShell } from '@/app/components/dashboard/DashboardShell';
import { Spinner } from '@/app/components/ui/Spinner';
import { ICompany } from '@/types';

export default function EmployerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, userType, isInitialized, isLoading, user } = useAuthStore();

  const isOnboardingRoute = pathname.startsWith('/employer/onboarding');
  const isJoinTeamRoute = pathname.startsWith('/employer/join-team');
  const isSetPasswordRoute = pathname.includes('/employer/settings/set-password');

  useEffect(() => {
    if (!isInitialized || isLoading) return;

    // Allow unauthenticated access to join-team route (processes invite token)
    if (isJoinTeamRoute) return;

    if (!isAuthenticated || userType !== 'company') {
      router.push('/login');
      return;
    }

    const company = user as ICompany | null;
    const step = company?.onboardingStep;

    // Invited team members must set their password first — bypass onboarding check
    if (company?.mustSetPassword) {
      if (!isSetPasswordRoute) {
        router.push('/employer/settings/set-password');
      }
      return;
    }

    // Set-password route is safe to access once authenticated
    if (isSetPasswordRoute) return;

    if (!isOnboardingRoute && step !== 'complete') {
      router.push('/employer/onboarding');
    }
  }, [isInitialized, isLoading, isAuthenticated, userType, user, isOnboardingRoute, isJoinTeamRoute, isSetPasswordRoute, router]);

  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Spinner size="lg" className="text-blue-500" />
      </div>
    );
  }

  // Allow join-team route without auth (processes invite token)
  if (isJoinTeamRoute) {
    return <>{children}</>;
  }

  if (!isAuthenticated || userType !== 'company') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Spinner size="lg" className="text-blue-500" />
      </div>
    );
  }

  // Onboarding and set-password pages render without the dashboard shell
  if (isOnboardingRoute || isSetPasswordRoute) {
    return <>{children}</>;
  }

  return <DashboardShell variant="employer">{children}</DashboardShell>;
}
