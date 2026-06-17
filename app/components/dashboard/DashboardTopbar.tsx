'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore, useNotificationStore } from '@/lib/store';
import { apiClient } from '@/lib/api';
import { disconnectSocket } from '@/lib/socket';
import { ThemeToggler } from '@/app/components/ThemeToggler';
import { Avatar } from '@/app/components/ui/Avatar';
import { ConfirmModal } from '@/app/components/ui/ConfirmModal';
import { NotificationDrawer } from '@/app/components/dashboard/NotificationDrawer';
import { ICompany } from '@/types';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import {
  Bell, Menu, ChevronDown, User, LogOut,
} from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  recruiter: 'Recruiter',
  viewer: 'Viewer',
};

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  recruiter: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  viewer: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

export function DashboardTopbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const router = useRouter();
  const { user, userType, logout } = useAuthStore();
  const { unreadCount, setNotifications } = useNotificationStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isCompany = userType === 'company';

  const teamRole = isCompany ? (user as ICompany | null)?.teamRole : undefined;

  const displayName = user
    ? isCompany
      ? (user as any).companyName ?? 'Company'
      : `${(user as any).firstname ?? ''} ${(user as any).lastname ?? ''}`.trim()
    : '';

  const photoSrc = (user as any)?.logo || (user as any)?.profilePhoto || null;

  const profileHref  = isCompany ? '/employer/settings' : '/profile';

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications on mount
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
    setLoggingOut(true);
    try {
      await apiClient.logout();
      
      // Clear auth state and storage
      logout();
      localStorage.removeItem('cid_jwt');
      localStorage.removeItem('uid_jwt');
      localStorage.removeItem('tokenExpiry');
      
      // Disconnect websocket
      disconnectSocket();
      
      // Close modal and redirect
      setConfirmLogout(false);
      setDropdownOpen(false);
      router.push('/');
    } catch {
      toast.error('Failed to logout');
      setLoggingOut(false);
      setConfirmLogout(false);
    }
  }

  return (
    <>
    <header className="dash-topbar">
      {/* Left: mobile menu toggle */}
      <div className="flex items-center gap-3 flex-1">
        <button
          onClick={onMenuClick}
          className="lg:hidden btn btn-ghost btn-icon -ml-1"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Right: notifications + theme + profile */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Notifications */}
        <button
          onClick={() => setNotifOpen(true)}
          className="btn btn-ghost btn-icon relative group"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className={cn(
              'absolute top-1 right-1 min-w-[18px] h-5 px-1',
              'bg-red-500 text-white text-[11px] font-bold rounded-full',
              'flex items-center justify-center leading-none'
            )}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <ThemeToggler />

        {/* Divider — hidden on mobile */}
        <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1 hidden sm:block" />

        {/* Profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
          >
            <Avatar src={photoSrc} name={displayName || 'U'} size="sm" />
            <span className="hidden lg:block text-sm font-medium text-gray-800 dark:text-gray-200 max-w-[120px] truncate">
              {displayName}
            </span>
            <ChevronDown className={cn(
              'w-4 h-4 text-gray-400 transition-transform duration-200 hidden sm:block',
              dropdownOpen && 'rotate-180'
            )} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 sm:w-56 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 py-1.5 animate-scaleIn origin-top-right z-50">
              {/* User info header */}
              <div className="px-3 py-2 mb-1 border-b border-gray-100 dark:border-gray-800">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{displayName}</p>
                {teamRole ? (
                  <span className={cn(
                    'inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold rounded-full uppercase tracking-wide',
                    ROLE_COLORS[teamRole] ?? ROLE_COLORS.viewer
                  )}>
                    {ROLE_LABELS[teamRole] ?? teamRole}
                  </span>
                ) : (
                  <p className="text-xs text-gray-400 truncate">{(user as any)?.email}</p>
                )}
              </div>

              <Link
                href={profileHref}
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 mx-1 rounded-lg transition-colors"
              >
                <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>Profile</span>
              </Link>

              <div className="h-px bg-gray-100 dark:bg-gray-800 mx-2 my-1" />

              <button
                onClick={() => { setDropdownOpen(false); setConfirmLogout(true); }}
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 w-full text-left mx-1 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4 flex-shrink-0" />
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>

    <ConfirmModal
      open={confirmLogout}
      title="Sign out?"
      description="You'll need to log back in to access your account."
      confirmLabel="Sign out"
      variant="danger"
      loading={loggingOut}
      onConfirm={handleLogout}
      onCancel={() => setConfirmLogout(false)}
    />

    <NotificationDrawer open={notifOpen} onClose={() => setNotifOpen(false)} />
  </>);
}
