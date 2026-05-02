'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard, Users, Building2, Briefcase,
  CreditCard, Mail, LogOut,
} from 'lucide-react';
import { useAdminStore } from '@/lib/adminStore';
import { adminApi } from '@/lib/adminApi';
import toast from 'react-hot-toast';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const adminNav: NavGroup[] = [
  {
    label: 'General',
    items: [
      { label: 'Overview', href: '/admin/overview', icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: 'Manage',
    items: [
      { label: 'Users',     href: '/admin/users',     icon: Users },
      { label: 'Companies', href: '/admin/companies', icon: Building2 },
      { label: 'Jobs',      href: '/admin/jobs',      icon: Briefcase },
    ],
  },
  {
    label: 'Platform',
    items: [
      { label: 'Pricing', href: '/admin/pricing', icon: CreditCard },
      { label: 'Email',   href: '/admin/email',   icon: Mail },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, clearAdmin } = useAdminStore();

  function isActive(item: NavItem) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  async function handleLogout() {
    try { await adminApi.logout(); } catch {}
    clearAdmin();
    router.push('/admin/login');
    toast.success('Logged out');
  }

  return (
    <aside className="dash-sidebar">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-white/8 flex-shrink-0">
        <Link href="/admin/overview" className="flex items-center gap-2.5">
          <Image
            src="/images/internse-logo.png"
            alt="Internse"
            width={120}
            height={36}
            className="h-9 w-auto object-contain"
          />
        </Link>
        <span className="text-[10px] font-bold tracking-widest uppercase text-red-400 bg-red-500/15 border border-red-500/20 px-1.5 py-0.5 rounded-md ml-auto flex-shrink-0">
          Admin
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
        {adminNav.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-1.5 text-[10px] font-bold tracking-widest uppercase text-gray-600">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                      active
                        ? 'text-white bg-white/10'
                        : 'text-gray-400 hover:text-white hover:bg-white/6',
                    )}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-red-400 rounded-full" />
                    )}
                    <item.icon className={cn('w-4 h-4 flex-shrink-0', active ? 'text-red-400' : '')} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Admin profile + logout */}
      <div className="flex-shrink-0 border-t border-white/8 p-3">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 text-xs font-bold flex-shrink-0">
            {admin?.name?.[0]?.toUpperCase() ?? 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{admin?.name ?? 'Admin'}</p>
            <p className="text-xs text-gray-500 truncate capitalize">
              {admin?.role === 'super_admin' ? 'Super Admin' : (admin?.role ?? 'Admin')}
            </p>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
