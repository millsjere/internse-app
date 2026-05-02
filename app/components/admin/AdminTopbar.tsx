'use client';

import { usePathname } from 'next/navigation';
import { useAdminStore } from '@/lib/adminStore';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

const PAGE_TITLES: Record<string, string> = {
  '/admin/overview':  'Overview',
  '/admin/users':     'Users',
  '/admin/companies': 'Companies',
  '/admin/jobs':      'Jobs',
  '/admin/pricing':   'Pricing',
  '/admin/settings':  'Settings',
};

function getPageTitle(pathname: string): string {
  // Exact match first
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  // Prefix match for detail pages (e.g. /admin/users/[id])
  const prefix = Object.keys(PAGE_TITLES).find((k) => pathname.startsWith(k + '/'));
  return prefix ? PAGE_TITLES[prefix] : 'Admin';
}

export function AdminTopbar() {
  const pathname = usePathname();
  const { admin } = useAdminStore();
  const { theme, setTheme } = useTheme();

  const title = getPageTitle(pathname);

  return (
    <header className="dash-topbar justify-between">
      {/* Page title */}
      <div>
        <h1 className="text-base font-bold text-gray-900 dark:text-white leading-none">{title}</h1>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Toggle theme"
        >
          {theme === 'dark'
            ? <Sun className="w-4 h-4" />
            : <Moon className="w-4 h-4" />
          }
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-gray-200 dark:bg-gray-700" />

        {/* Admin identity */}
        <div className="flex items-center gap-2.5 pl-1">
          <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-500/20 border border-red-200 dark:border-red-500/30 flex items-center justify-center text-red-600 dark:text-red-400 text-xs font-bold flex-shrink-0">
            {admin?.name?.[0]?.toUpperCase() ?? 'A'}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none">{admin?.name ?? 'Admin'}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{admin?.email ?? ''}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
