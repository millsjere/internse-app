'use client';

import { usePathname } from 'next/navigation';
import { MarketingNavbar } from './MarketingNavbar';
import { MarketingFooter } from './MarketingFooter';

const AUTH_PATHS = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/pending-verification',
];

export function MarketingShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_PATHS.some((p) => pathname.startsWith(p));

  if (isAuthPage) return <>{children}</>;

  return (
    <>
      <MarketingNavbar />
      <main>{children}</main>
      <MarketingFooter />
    </>
  );
}
