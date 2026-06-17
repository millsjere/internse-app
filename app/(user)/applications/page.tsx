'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { PageHeader } from '@/app/components/ui/PageHeader';
import { EmptyState } from '@/app/components/ui/EmptyState';
import { Spinner } from '@/app/components/ui/Spinner';
import { applicationStatusBadge } from '@/app/components/ui/Badge';
import { formatDate, formatRelativeDate } from '@/lib/utils';
import { IApplication } from '@/types';
import { FileText, MapPin, Calendar, Briefcase, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

type Filter = 'all' | 'pending' | 'reviewing' | 'accepted' | 'rejected';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<IApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.getUserApplications();
      if (res.success && Array.isArray(res.data)) setApplications(res.data);
    } catch {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === 'all' ? applications : applications.filter((a) => a.status === filter);
  const counts = {
    all: applications.length,
    pending: applications.filter((a) => a.status === 'pending').length,
    reviewing: applications.filter((a) => a.status === 'reviewing').length,
    accepted: applications.filter((a) => a.status === 'accepted').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  };

  const tabs: { key: Filter; label: string }[] = [
    { key: 'all',       label: 'All' },
    { key: 'pending',   label: 'Pending' },
    { key: 'reviewing', label: 'Reviewing' },
    { key: 'accepted',  label: 'Accepted' },
    { key: 'rejected',  label: 'Rejected' },
  ];

  return (
    <div>
      <PageHeader
        title="My Applications"
        description={applications.length > 0 ? `${applications.length} total application${applications.length !== 1 ? 's' : ''}` : 'Track your job applications'}
        action={
          <Link href="/jobs" className="btn btn-primary">
            <Briefcase className="w-4 h-4" /> Browse Opportunities
          </Link>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit mb-6 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
              filter === t.key
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            )}
          >
            {t.label}
            {counts[t.key] > 0 && (
              <span className={cn(
                'ml-1.5 text-xs px-1.5 py-0.5 rounded-full font-semibold',
                filter === t.key ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
              )}>
                {counts[t.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" className="text-blue-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={FileText}
            title={filter === 'all' ? "No applications yet" : `No ${filter} applications`}
            description={filter === 'all' ? "Start applying to jobs that match your skills and interests." : undefined}
            action={filter === 'all' ? (
              <Link href="/jobs" className="btn btn-primary btn-sm whitespace-nowrap">
                <span className="hidden sm:inline">Browse Jobs</span>
                <span className="sm:hidden">Jobs</span>
              </Link>
            ) : undefined}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => (
            <div key={app._id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{app.job?.title ?? 'Unknown Job'}</h3>
                    {applicationStatusBadge(app.status)}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {(app.job?.company as any)?.companyName ?? ''}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                    {app.job?.location && (
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{app.job.location}</span>
                    )}
                    {app.job?.jobType && (
                      <span className="flex items-center gap-1 capitalize"><Briefcase className="w-3 h-3" />{app.job.jobType.replace('-', ' ')}</span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Applied {formatDate(app.appliedAt)}
                    </span>
                  </div>
                </div>
                {app.job?.slug && (
                  <Link
                    href={`/jobs/${app.job.slug}`}
                    target="_blank"
                    className="btn btn-ghost btn-icon flex-shrink-0 text-gray-400 hover:text-gray-700"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                )}
              </div>

              {/* Status timeline */}
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  {(['pending', 'reviewing', 'accepted'] as const).map((step, i, arr) => {
                    const stepMap: Record<string, number> = { pending: 0, reviewing: 1, accepted: 2, rejected: -1 };
                    const currentStep = stepMap[app.status] ?? 0;
                    const isRejected = app.status === 'rejected';
                    const isDone = !isRejected && stepMap[step] <= currentStep;
                    const isActive = !isRejected && stepMap[step] === currentStep;
                    return (
                      <>
                        <div key={step} className={cn(
                          'flex items-center gap-1.5 text-xs font-medium',
                          isRejected ? 'text-gray-300 dark:text-gray-600' : isDone ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'
                        )}>
                          <div className={cn(
                            'w-2 h-2 rounded-full',
                            isRejected ? 'bg-gray-200 dark:bg-gray-700' : isDone ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'
                          )} />
                          <span className="capitalize">{step}</span>
                        </div>
                        {i < arr.length - 1 && (
                          <div className={cn('flex-1 h-px max-w-[40px]', isDone && !isActive && !isRejected ? 'bg-emerald-200 dark:bg-emerald-800' : 'bg-gray-200 dark:bg-gray-700')} />
                        )}
                      </>
                    );
                  })}
                  {app.status === 'rejected' && (
                    <span className="text-xs font-medium text-red-500 dark:text-red-400 ml-auto">Not selected</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
