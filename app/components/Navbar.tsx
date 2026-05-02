'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api';
import { disconnectSocket } from '@/lib/socket';
import { cn } from '@/lib/utils';
import { Avatar } from '@/app/components/ui/Avatar';
import { ThemeToggler } from './ThemeToggler';
import toast from 'react-hot-toast';
import {
  Building2, Menu, X, LogOut, LayoutDashboard, ChevronDown,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const publicLinks = [
  { href: '/browse', label: 'Browse Jobs' },
  { href: '/companies', label: 'Companies' },
];

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, userType, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isCompany = userType === 'company';
  const displayName = user
    ? isCompany
      ? (user as any).companyName ?? 'Company'
      : `${(user as any).firstname ?? ''} ${(user as any).lastname ?? ''}`.trim()
    : '';
  const photoSrc = (user as any)?.logo || (user as any)?.profilePhoto || null;
  const dashboardHref = isCompany ? '/employer' : '/dashboard';

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleLogout() {
    try {
      await apiClient.logout();
      logout();
      disconnectSocket();
      router.push('/');
    } catch {
      toast.error('Failed to logout');
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="container flex items-center h-16 gap-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Building2 className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="font-bold text-lg text-gray-900 dark:text-white tracking-tight">internse</span>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                pathname === link.href
                  ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 ml-auto">
          <ThemeToggler />

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Avatar src={photoSrc} name={displayName || 'U'} size="sm" />
                <span className="hidden sm:block text-sm font-medium text-gray-800 dark:text-gray-200 max-w-[120px] truncate">
                  {displayName}
                </span>
                <ChevronDown className={cn('w-4 h-4 text-gray-400 transition-transform', dropdownOpen && 'rotate-180')} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 py-1 animate-scaleIn origin-top-right">
                  <Link
                    href={dashboardHref}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 mx-1 rounded-lg"
                  >
                    <LayoutDashboard className="w-4 h-4 text-gray-400" />
                    Dashboard
                  </Link>
                  <div className="h-px bg-gray-100 dark:bg-gray-800 mx-2 my-1" />
                  <button
                    onClick={() => { setDropdownOpen(false); handleLogout(); }}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 w-full text-left mx-1 rounded-lg"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="btn btn-ghost text-sm">
                Sign in
              </Link>
              <Link href="/register" className="btn btn-primary text-sm">
                Get started
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden btn btn-ghost btn-icon"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 pb-4 animate-slideInUp">
          <nav className="pt-3 space-y-1">
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'block px-3 py-2.5 rounded-lg text-sm font-medium',
                  pathname === link.href
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
