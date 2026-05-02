'use client';

import { useEffect, useState } from 'react';
import { Users, Building2, Briefcase, FileText, DollarSign } from 'lucide-react';
import { StatsCard } from '@/app/components/admin/StatsCard';
import { adminApi } from '@/lib/adminApi';
import toast from 'react-hot-toast';

interface StatsData {
  users: number;
  companies: number;
  jobs: number;
  applications: number;

  estimatedRevenue: number;
  recentUsers: any[];
  recentCompanies: any[];
  recentJobs: any[];
}

function formatCurrency(val: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function OverviewPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getStats()
      .then((res) => {
        const d = res.data ?? res;
        setStats({
          users: d.counts?.users ?? 0,
          companies: d.counts?.companies ?? 0,
          jobs: d.counts?.jobs ?? 0,
          applications: d.counts?.applications ?? 0,

          estimatedRevenue: (d.planRevenue ?? []).reduce((sum: number, p: any) => {
            const prices: Record<string, number> = { starter: 0, growth: 49, enterprise: 149 };
            return sum + (prices[p._id] ?? 0) * (p.count ?? 0);
          }, 0),
          recentUsers: d.recentUsers ?? [],
          recentCompanies: d.recentCompanies ?? [],
          recentJobs: d.recentJobs ?? [],
        });
      })
      .catch(() => toast.error('Failed to load stats'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 h-28 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Overview</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Platform health at a glance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatsCard label="Total Users" value={stats.users.toLocaleString()} icon={Users} color="text-blue-600 dark:text-blue-400" bg="bg-blue-50 dark:bg-blue-500/10" />
        <StatsCard label="Companies" value={stats.companies.toLocaleString()} icon={Building2} color="text-purple-600 dark:text-purple-400" bg="bg-purple-50 dark:bg-purple-500/10" />
        <StatsCard label="Live Jobs" value={stats.jobs.toLocaleString()} icon={Briefcase} color="text-green-600 dark:text-green-400" bg="bg-green-50 dark:bg-green-500/10" />
        <StatsCard label="Applications" value={stats.applications.toLocaleString()} icon={FileText} color="text-orange-600 dark:text-orange-400" bg="bg-orange-50 dark:bg-orange-500/10" />

        <StatsCard label="Est. Revenue" value={formatCurrency(stats.estimatedRevenue)} icon={DollarSign} color="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-50 dark:bg-emerald-500/10" sub="from active plans" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentList title="Recent Users" items={stats.recentUsers} renderItem={(u) => (
          <div key={u._id} className="flex items-center gap-3 py-2.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-bold flex-shrink-0">
              {(u.firstname ?? u.firstName)?.[0]}{(u.lastname ?? u.lastName)?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{u.firstname ?? u.firstName} {u.lastname ?? u.lastName}</p>
              <p className="text-xs text-gray-400 truncate">{u.email}</p>
            </div>
            <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(u.createdAt)}</span>
          </div>
        )} />

        <RecentList title="Recent Companies" items={stats.recentCompanies} renderItem={(c) => (
          <div key={c._id} className="flex items-center gap-3 py-2.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 text-xs font-bold flex-shrink-0">
              {c.companyName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{c.companyName}</p>
              <p className="text-xs text-gray-400 capitalize">{c.paymentPlan?.planType ?? c.paymentPlan ?? 'free'}</p>
            </div>
            <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(c.createdAt)}</span>
          </div>
        )} />

        <RecentList title="Recent Jobs" items={stats.recentJobs} renderItem={(j) => (
          <div key={j._id} className="flex items-center gap-3 py-2.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{j.title}</p>
              <p className="text-xs text-gray-400 truncate">{j.company?.companyName || '—'}</p>
            </div>
            <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(j.createdAt)}</span>
          </div>
        )} />
      </div>
    </div>
  );
}

function RecentList({ title, items, renderItem }: { title: string; items: any[]; renderItem: (item: any) => React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{title}</h3>
      {items.length === 0 ? (
        <p className="text-xs text-gray-400 py-4 text-center">No data</p>
      ) : (
        items.map(renderItem)
      )}
    </div>
  );
}
