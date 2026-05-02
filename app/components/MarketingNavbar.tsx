'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore, useNotificationStore } from '@/lib/store';
import { apiClient } from '@/lib/api';
import { disconnectSocket } from '@/lib/socket';
import { cn } from '@/lib/utils';
import { Avatar } from '@/app/components/ui/Avatar';
import { ThemeToggler } from '@/app/components/ThemeToggler';
import Image from 'next/image';
import { NotificationDrawer } from '@/app/components/dashboard/NotificationDrawer';
import { Menu, X, LayoutDashboard, FileText, ClipboardList, Settings, LogOut, ChevronDown, Bell } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { IUser, ICompany } from '@/types';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/jobs', label: 'Jobs' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export function MarketingNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userType, isAuthenticated, logout } = useAuthStore();
  const { unreadCount, setNotifications } = useNotificationStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isCompany = userType === 'company';
  const displayName = user
    ? isCompany
      ? (user as ICompany).companyName ?? 'Company'
      : `${(user as IUser).firstname ?? ''} ${(user as IUser).lastname ?? ''}`.trim()
    : '';
  const photoSrc = isCompany
    ? (user as ICompany)?.logo ?? null
    : (user as IUser)?.profilePhoto ?? null;

  const userMenuItems = isCompany
    ? [
        { href: '/employer', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/employer/jobs', label: 'All Posts', icon: FileText },
        { href: '/employer/settings', label: 'Settings', icon: Settings },
      ]
    : [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/applications', label: 'Applications', icon: ClipboardList },
        { href: '/settings', label: 'Settings', icon: Settings },
      ];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications when logged in
  useEffect(() => {
    if (!user) return;
    const fetch = isCompany
      ? apiClient.getCompanyNotifications()
      : apiClient.getUserNotifications();
    fetch
      .then((res) => { if (res.success && Array.isArray(res.data)) setNotifications(res.data); })
      .catch(() => {});
  }, [user, isCompany, setNotifications]);

  async function handleLogout() {
    try {
      await apiClient.logout();
      
      // Clear auth state and storage
      logout();
      localStorage.removeItem('cid_jwt');
      localStorage.removeItem('uid_jwt');
      localStorage.removeItem('tokenExpiry');
      
      // Disconnect websocket
      disconnectSocket();
      
      // Redirect
      router.push('/');
    } catch {
      toast.error('Failed to logout');
    }
  }

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="container flex items-center h-16 gap-8">
        {/* Logo */}
        <Link href="/" className="flex items-center flex-shrink-0">
          <Image src="/images/internse-logo-blue.png" alt="Internse" width={120} height={36} className="h-9 w-auto object-contain" priority />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150',
                isActive(link.href)
                  ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3 ml-auto">
          <ThemeToggler />
          {isAuthenticated && user ? (
            <>
            <button onClick={() => setNotifOpen(true)} className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="Notifications">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Avatar src={photoSrc} name={displayName || 'U'} size="sm" />
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 max-w-[140px] truncate">
                  {displayName}
                </span>
                <ChevronDown className={cn('w-4 h-4 text-gray-400 transition-transform', dropdownOpen && 'rotate-180')} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 py-1.5 animate-scaleIn origin-top-right">
                  <div className="px-3 py-2 mb-1">
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                      {isCompany ? 'Employer' : 'Job Seeker'}
                    </p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{displayName}</p>
                  </div>
                  <div className="h-px bg-gray-100 dark:bg-gray-800 mx-2 mb-1" />

                  {userMenuItems.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 mx-1 rounded-lg"
                    >
                      <Icon className="w-4 h-4 text-gray-400" />
                      {label}
                    </Link>
                  ))}

                  <div className="h-px bg-gray-100 dark:bg-gray-800 mx-2 my-1" />
                  <button
                    onClick={() => { setDropdownOpen(false); handleLogout(); }}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 w-full text-left mx-1 rounded-lg"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl shadow-md hover:shadow-blue-300 transition-all duration-200 active:scale-95"
              >
                Post a Job
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="md:hidden ml-auto p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 pb-5 animate-slideInUp">
          <nav className="pt-3 space-y-1 mb-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'block px-4 py-2.5 rounded-lg text-sm font-semibold',
                  isActive(link.href)
                    ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
            {isAuthenticated && user ? (
              <div className="space-y-1">
                {/* User info */}
                <div className="flex items-center gap-3 px-4 py-3 mb-2">
                  <Avatar src={photoSrc} name={displayName || 'U'} size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{displayName}</p>
                    <p className="text-xs text-gray-400">{isCompany ? 'Employer' : 'Job Seeker'}</p>
                  </div>
                </div>
                {userMenuItems.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <Icon className="w-4 h-4 text-gray-400" />
                    {label}
                  </Link>
                ))}
                <button
                  onClick={() => { setMobileOpen(false); handleLogout(); }}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 w-full text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-2.5 text-sm font-semibold text-center text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-2.5 text-sm font-bold text-center text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-md transition-all"
                >
                  Post a Job
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>

    <NotificationDrawer open={notifOpen} onClose={() => setNotifOpen(false)} />
    </>
  );
}
