'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AdminShell } from '@/app/components/admin/AdminShell';
import { useAdminStore } from '@/lib/adminStore';
import { adminApi } from '@/lib/adminApi';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, isInitialized, setAdmin, clearAdmin, setInitialized } = useAdminStore();

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isInitialized) return;
    adminApi.getMe()
      .then((data) => {
        setAdmin(data.data);
        setInitialized(true);
      })
      .catch(() => {
        clearAdmin();
        setInitialized(true);
      });
  }, [isInitialized, setAdmin, clearAdmin, setInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    if (!admin && !isLoginPage) {
      router.replace('/admin/login');
    }
    if (admin && isLoginPage) {
      router.replace('/admin/overview');
    }
  }, [isInitialized, admin, isLoginPage, router]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isLoginPage) return <>{children}</>;
  if (!admin) return null;

  return <AdminShell>{children}</AdminShell>;
}
