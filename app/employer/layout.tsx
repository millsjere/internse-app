'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { DashboardShell } from '@/app/components/dashboard/DashboardShell';
import { Spinner } from '@/app/components/ui/Spinner';
import { ICompany } from '@/types';

export default function EmployerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, userType, isInitialized, isLoading, user } = useAuthStore();
  const redirectRef = useRef(false);

  const isOnboardingRoute = pathname.startsWith('/employer/onboarding');
  const isJoinTeamRoute = pathname.startsWith('/employer/join-team');
  const isSetPasswordRoute = pathname.includes('/employer/settings/set-password');

  useEffect(() => {
    if (!isInitialized || isLoading) return;

    // Allow unauthenticated access to join-team route (processes invite token)
    if (isJoinTeamRoute) return;

    if ((!isAuthenticated || userType !== 'company') && !redirectRef.current) {
      redirectRef.current = true;
      router.push('/login');
      return;
    }

    const company = user as ICompany | null;
    const step = company?.onboardingStep;
    const teamRole = company?.teamRole;

    // Invited team members must set their password first — bypass onboarding check
    if (company?.mustSetPassword) {
      if (!isSetPasswordRoute) {
        router.push('/employer/settings/set-password');
      }
      return;
    }

    // Set-password route is safe to access once authenticated
    if (isSetPasswordRoute) return;

    // Team members (with teamRole) are added to an existing company and never need onboarding
    if (!teamRole && !isOnboardingRoute && step !== 'complete') {
      router.push('/employer/onboarding');
      return;
    }

    // Restrict recruiter/viewer from overview and settings pages
    if (teamRole && teamRole !== 'admin') {
      const isOverview = pathname === '/employer';
      const isSettings = pathname.startsWith('/employer/settings');
      if (isOverview || isSettings) {
        router.push('/employer/jobs');
      }
    }
  }, [isInitialized, isLoading, isAuthenticated, userType, user, pathname, isOnboardingRoute, isJoinTeamRoute, isSetPasswordRoute, router]);

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

  // Onboarding and set-password pages render without the dashboard shell
  if (isOnboardingRoute || isSetPasswordRoute) {
    return <>{children}</>;
  }

  // If not authenticated, return nothing (redirect is happening in useEffect)
  if (!isAuthenticated || userType !== 'company') {
    return null;
  }

  return <DashboardShell variant="employer">{children}</DashboardShell>;
}
