'use client';

import { useEffect, useState } from 'react';
import { Users, Building2, Briefcase, FileText, DollarSign, CheckCircle, ShieldOff } from 'lucide-react';
import { StatsCard } from '@/app/components/admin/StatsCard';
import { adminApi } from '@/lib/adminApi';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Counts {
  users: number;
  suspendedUsers: number;
  companies: number;
  verifiedCompanies: number;
  suspendedCompanies: number;
  publishedJobs: number;
  totalJobs: number;
  applications: number;
}

interface StatsData {
  counts: Counts;
  estimatedRevenue: number;
  recentUsers: any[];
  recentCompanies: any[];
  recentJobs: any[];
}

const PLAN_PRICES: Record<string, number> = { starter: 0, growth: 49, enterprise: 149 };

const JOB_STATUS_STYLES: Record<string, string> = {
  published: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
  drafted:   'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
  closed:    'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400',
  archived:  'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
};

function formatCurrency(val: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
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
        const revenue = (d.planRevenue ?? []).reduce((sum: number, p: any) => {
          return sum + (PLAN_PRICES[p._id] ?? 0) * (p.count ?? 0);
        }, 0);
        setStats({
          counts: d.counts,
          estimatedRevenue: revenue,
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

  const { counts } = stats;

  return (
    <div className="space-y-8">
      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatsCard
          label="Total Users"
          value={counts.users.toLocaleString()}
          icon={Users}
          color="text-blue-600 dark:text-blue-400"
          bg="bg-blue-50 dark:bg-blue-500/10"
          sub={counts.suspendedUsers > 0 ? `${counts.suspendedUsers} suspended` : 'None suspended'}
        />
        <StatsCard
          label="Companies"
          value={counts.companies.toLocaleString()}
          icon={Building2}
          color="text-violet-600 dark:text-violet-400"
          bg="bg-violet-50 dark:bg-violet-500/10"
          sub={`${counts.verifiedCompanies} verified · ${counts.suspendedCompanies} suspended`}
        />
        <StatsCard
          label="Active Jobs"
          value={counts.publishedJobs.toLocaleString()}
          icon={Briefcase}
          color="text-emerald-600 dark:text-emerald-400"
          bg="bg-emerald-50 dark:bg-emerald-500/10"
          sub={`${counts.totalJobs} total across all statuses`}
        />
        <StatsCard
          label="Applications"
          value={counts.applications.toLocaleString()}
          icon={FileText}
          color="text-orange-600 dark:text-orange-400"
          bg="bg-orange-50 dark:bg-orange-500/10"
        />
        <StatsCard
          label="Est. Monthly Revenue"
          value={formatCurrency(stats.estimatedRevenue)}
          icon={DollarSign}
          color="text-teal-600 dark:text-teal-400"
          bg="bg-teal-50 dark:bg-teal-500/10"
          sub="based on active plan subscriptions"
        />
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Users */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Users</h3>
            <Link href="/admin/users" className="text-xs text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 font-medium">View all</Link>
          </div>
          {stats.recentUsers.length === 0 ? (
            <p className="text-xs text-gray-400 py-4 text-center">No users yet</p>
          ) : (
            <div className="space-y-0">
              {stats.recentUsers.map((u) => (
                <Link key={u._id} href={`/admin/users/${u._id}`} className="flex items-center gap-3 py-2.5 border-b border-gray-50 dark:border-gray-800/60 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/40 -mx-2 px-2 rounded-xl transition-colors">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-bold flex-shrink-0">
                    {u.firstname?.[0]}{u.lastname?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {u.firstname} {u.lastname}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-xs text-gray-400">{timeAgo(u.createdAt)}</span>
                    {u.suspended && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-red-500 dark:text-red-400">
                        <ShieldOff className="w-2.5 h-2.5" />suspended
                      </span>
                    )}
                    {!u.verified && !u.suspended && (
                      <span className="text-[10px] text-gray-400">unverified</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Companies */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Companies</h3>
            <Link href="/admin/companies" className="text-xs text-violet-500 hover:text-violet-600 dark:hover:text-violet-400 font-medium">View all</Link>
          </div>
          {stats.recentCompanies.length === 0 ? (
            <p className="text-xs text-gray-400 py-4 text-center">No companies yet</p>
          ) : (
            <div className="space-y-0">
              {stats.recentCompanies.map((c) => (
                <Link key={c._id} href={`/admin/companies/${c._id}`} className="flex items-center gap-3 py-2.5 border-b border-gray-50 dark:border-gray-800/60 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/40 -mx-2 px-2 rounded-xl transition-colors">
                  <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400 text-xs font-bold flex-shrink-0">
                    {c.companyName?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{c.companyName}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                        {c.paymentPlan?.planType ?? 'starter'}
                      </span>
                      {c.verified && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-500">
                          <CheckCircle className="w-2.5 h-2.5" />verified
                        </span>
                      )}
                      {c.suspended && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-red-500">
                          <ShieldOff className="w-2.5 h-2.5" />suspended
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(c.createdAt)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Jobs */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Jobs</h3>
            <Link href="/admin/jobs" className="text-xs text-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium">View all</Link>
          </div>
          {stats.recentJobs.length === 0 ? (
            <p className="text-xs text-gray-400 py-4 text-center">No jobs yet</p>
          ) : (
            <div className="space-y-0">
              {stats.recentJobs.map((j) => (
                <Link key={j._id} href={`/admin/jobs/${j._id}`} className="flex items-center gap-3 py-2.5 border-b border-gray-50 dark:border-gray-800/60 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/40 -mx-2 px-2 rounded-xl transition-colors">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{j.title}</p>
                    <p className="text-xs text-gray-400 truncate">{j.company?.companyName ?? '—'}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-xs text-gray-400">{timeAgo(j.createdAt)}</span>
                    <span className={`text-[10px] font-semibold capitalize px-1.5 py-0.5 rounded-full ${JOB_STATUS_STYLES[j.status] ?? JOB_STATUS_STYLES.drafted}`}>
                      {j.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
