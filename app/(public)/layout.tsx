'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Rethink_Sans } from 'next/font/google';
import { MarketingShell } from '@/app/components/MarketingShell';
import { Spinner } from '@/app/components/ui/Spinner';

const rethinkSans = Rethink_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-rethink',
  display: 'swap',
});

// Auth-only pages that should redirect authenticated users
const AUTH_PAGES = ['/login', '/register', '/verify-email', '/reset-password', '/forgot-password', '/pending-verification'];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, userType, isInitialized, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isInitialized || isLoading) return;

    // If user is logged in and trying to access auth pages, redirect to dashboard
    const isAuthPage = AUTH_PAGES.some(page => pathname.startsWith(page));
    if (isAuthenticated && isAuthPage) {
      if (userType === 'company') {
        router.push('/employer');
      } else {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, userType, isInitialized, isLoading, pathname, router]);

  // Show loading while auth is initializing
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Spinner size="lg" className="text-blue-500" />
      </div>
    );
  }

  return (
    <div className={`${rethinkSans.variable} font-rethink`}>
      <MarketingShell>{children}</MarketingShell>
    </div>
  );
}
