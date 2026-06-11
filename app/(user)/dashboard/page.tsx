'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api';
import { PageHeader } from '@/app/components/ui/PageHeader';
import { Spinner } from '@/app/components/ui/Spinner';
import { applicationStatusBadge } from '@/app/components/ui/Badge';
import { formatRelativeDate } from '@/lib/utils';
import { IApplication, IUser } from '@/types';
import { FileText, Heart, CheckCircle, Clock, ArrowRight, Briefcase, User } from 'lucide-react';

export default function UserDashboardPage() {
  const { user } = useAuthStore();
  const userData = user as IUser | null;
  const [applications, setApplications] = useState<IApplication[]>([]);
  const [favCount, setFavCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const firstName = userData?.firstname ?? 'there';
  const completion = userData?.profileCompletion ?? 0;

  const load = useCallback(async () => {
    try {
      const [appRes, favRes] = await Promise.allSettled([
        apiClient.getUserApplications(),
        apiClient.getUserFavourites(),
      ]);
      if (appRes.status === 'fulfilled' && appRes.value.success) {
        setApplications(Array.isArray(appRes.value.data) ? appRes.value.data : []);
      }
      if (favRes.status === 'fulfilled' && favRes.value.success) {
        setFavCount(Array.isArray(favRes.value.data) ? favRes.value.data.length : 0);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const accepted = applications.filter((a) => a.status === 'accepted').length;
  const pending  = applications.filter((a) => a.status === 'pending').length;

  const statCards = [
    { label: 'Applications', value: applications.length, icon: FileText, color: 'bg-blue-50 dark:bg-blue-950', iconColor: 'text-blue-600 dark:text-blue-400', href: '/applications' },
    { label: 'Accepted',     value: accepted,             icon: CheckCircle, color: 'bg-emerald-50 dark:bg-emerald-950', iconColor: 'text-emerald-600 dark:text-emerald-400', href: '/applications' },
    { label: 'Pending',      value: pending,              icon: Clock,  color: 'bg-amber-50 dark:bg-amber-950', iconColor: 'text-amber-600 dark:text-amber-400', href: '/applications' },
    { label: 'Saved Opportunities',   value: favCount,             icon: Heart,  color: 'bg-pink-50 dark:bg-pink-950', iconColor: 'text-pink-600 dark:text-pink-400', href: '/favorites' },
  ];

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Here's an overview of your job search activity."
        action={
          <Link href="/browse" className="btn btn-primary">
            <Briefcase className="w-4 h-4" /> Browse Opportunities
          </Link>
        }
      />

      {/* Profile completion banner */}
      {completion < 80 && (
        <div className="card mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 border-0 text-white">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="font-semibold mb-1">Complete your profile to stand out</p>
              <p className="text-sm text-blue-100 mb-3">A complete profile is 4× more likely to get noticed by employers.</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${completion}%` }} />
                </div>
                <span className="text-sm font-bold text-white flex-shrink-0">{completion}%</span>
              </div>
            </div>
            <Link href="/profile" className="btn bg-white text-blue-700 hover:bg-blue-50 flex-shrink-0">
              <User className="w-4 h-4" /> Edit Profile
            </Link>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <Link key={s.label} href={s.href} className="card hover:shadow-md transition-shadow cursor-pointer">
            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 ${s.iconColor}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {loading ? <Spinner size="sm" className="text-gray-400" /> : s.value}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* Recent applications */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-gray-900 dark:text-white">Recent Applications</h2>
          <Link href="/applications" className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><Spinner className="text-gray-400" /></div>
        ) : applications.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
              <FileText className="w-6 h-6 text-gray-400" />
            </div>
            <p className="font-medium text-gray-900 dark:text-white mb-1">No applications yet</p>
            <p className="text-sm text-gray-500 mb-4">Start applying to opportunities that match your skills.</p>
            <Link href="/browse" className="btn btn-primary btn-sm">Browse Opportunities</Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {applications.slice(0, 5).map((app) => (
              <div key={app._id} className="flex items-center justify-between py-3.5 gap-4">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 dark:text-white truncate">{app.job?.title ?? 'Unknown Job'}</p>
                  <p className="text-sm text-gray-500 truncate">{(app.job?.company as any)?.companyName ?? ''}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {applicationStatusBadge(app.status)}
                  <span className="text-xs text-gray-400">{formatRelativeDate(app.appliedAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
