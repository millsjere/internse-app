'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuthStore, useUIStore } from '@/lib/store';
import { ICompany } from '@/types';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard, Briefcase, Users, Settings,
  User, Heart, FileText, HelpCircle,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
  roles?: Array<'admin' | 'recruiter' | 'viewer'>; // if set, only these roles can see the item
}

const employerNav: NavItem[] = [
  { label: 'Overview',    href: '/employer',            icon: LayoutDashboard, exact: true, roles: ['admin'] },
  { label: 'Jobs',        href: '/employer/jobs',       icon: Briefcase },
  { label: 'Applicants',  href: '/employer/applicants', icon: Users },
  { label: 'Settings',    href: '/employer/settings',   icon: Settings, roles: ['admin'] },
];

const userNav: NavItem[] = [
  { label: 'Overview',     href: '/dashboard',    icon: LayoutDashboard, exact: true },
  { label: 'Profile',      href: '/profile',      icon: User },
  { label: 'Applications', href: '/applications', icon: FileText },
  { label: 'Saved Opportunities',   href: '/favorites',    icon: Heart },
  { label: 'Settings',     href: '/settings',     icon: Settings },
];

interface DashboardSidebarProps {
  variant: 'employer' | 'user';
}

export function DashboardSidebar({ variant }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { isSidebarOpen, closeSidebar } = useUIStore();
  const teamRole = variant === 'employer' ? (user as ICompany | null)?.teamRole : undefined;

  const rawNav = variant === 'employer' ? employerNav : userNav;

  // Filter nav items: if item has `roles` restriction and user has a teamRole, enforce it
  // Owner accounts (no teamRole) see everything
  const navItems = rawNav.filter((item) => {
    if (!item.roles || !teamRole) return true;
    return item.roles.includes(teamRole as any);
  });

  function isActive(item: NavItem) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  return (
    <aside className={cn('dash-sidebar', isSidebarOpen && 'translate-x-0')}>
      {/* Brand */}
      <div className="flex items-center px-5 h-16 border-b border-white/10 flex-shrink-0">
        <Link href="/">
          <Image src="/images/internse-logo.png" alt="Internse" width={150} height={45} className="h-11 w-auto object-contain" />
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={closeSidebar}
            className={cn('sidebar-item', isActive(item) && 'sidebar-item-active')}
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Bottom: Help */}
      <div className="flex-shrink-0 border-t border-white/10 px-3 py-3">
        <Link
          href="mailto:support@internse.com"
          onClick={closeSidebar}
          className="sidebar-item"
        >
          <HelpCircle className="w-4 h-4 flex-shrink-0" />
          Help & Support
        </Link>
      </div>
    </aside>
  );
}
