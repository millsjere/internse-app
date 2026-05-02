'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
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
}

const employerNav: NavItem[] = [
  { label: 'Overview',    href: '/employer',           icon: LayoutDashboard, exact: true },
  { label: 'Jobs',        href: '/employer/jobs',      icon: Briefcase },
  { label: 'Applicants',  href: '/employer/applicants', icon: Users },
  { label: 'Settings',    href: '/employer/settings',  icon: Settings },
];

const userNav: NavItem[] = [
  { label: 'Overview',     href: '/dashboard',    icon: LayoutDashboard, exact: true },
  { label: 'Profile',      href: '/profile',      icon: User },
  { label: 'Applications', href: '/applications', icon: FileText },
  { label: 'Saved Jobs',   href: '/favorites',    icon: Heart },
  { label: 'Settings',     href: '/settings',     icon: Settings },
];

interface DashboardSidebarProps {
  variant: 'employer' | 'user';
}

export function DashboardSidebar({ variant }: DashboardSidebarProps) {
  const pathname = usePathname();
  const navItems = variant === 'employer' ? employerNav : userNav;

  function isActive(item: NavItem) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  return (
    <aside className="dash-sidebar">
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
          className="sidebar-item"
        >
          <HelpCircle className="w-4 h-4 flex-shrink-0" />
          Help & Support
        </Link>
      </div>
    </aside>
  );
}
