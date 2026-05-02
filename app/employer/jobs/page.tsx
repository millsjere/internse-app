'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { PageHeader } from '@/app/components/ui/PageHeader';
import { EmptyState } from '@/app/components/ui/EmptyState';
import { Spinner } from '@/app/components/ui/Spinner';
import { ConfirmModal } from '@/app/components/ui/ConfirmModal';
import { jobStatusBadge } from '@/app/components/ui/Badge';
import { formatRelativeDate, formatSalary } from '@/lib/utils';
import { IJob, ICompany } from '@/types';
import toast from 'react-hot-toast';
import {
  Plus, Eye, Users, Edit2, Trash2, Globe, EyeOff, Briefcase, MapPin,
  Archive, CreditCard, AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PLAN_LIMITS } from '@/lib/planLimits';

type Tab = 'all' | 'published' | 'drafted' | 'closed' | 'archived';

export default function EmployerJobsPage() {
  const { user, setUser, userType } = useAuthStore();
  const company = user as ICompany | null;

  const [jobs, setJobs] = useState<IJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [closingId, setClosingId] = useState<string | null>(null);
  const [archivingId, setArchivingId] = useState<string | null>(null);

  // Confirmation modals
  const [deleteTarget, setDeleteTarget] = useState<IJob | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<IJob | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.getCompanyJobs();
      if (res.success && Array.isArray(res.data)) setJobs(res.data);
    } catch {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = tab === 'all' ? jobs : jobs.filter((j) => j.status === tab);

  const counts = {
    all: jobs.length,
    published: jobs.filter((j) => j.status === 'published').length,
    drafted: jobs.filter((j) => j.status === 'drafted').length,
    closed: jobs.filter((j) => j.status === 'closed').length,
    archived: jobs.filter((j) => j.status === 'archived').length,
  };

  // Credit usage derived from company plan
  const plan = company?.paymentPlan;
  const planLimits = plan ? PLAN_LIMITS[plan.planType] : null;
  const isUnlimited = planLimits?.credits === -1;
  const creditsUsed = plan?.used ?? 0;
  const creditsTotal = plan?.credits ?? 0;
  const creditsRemaining = isUnlimited ? Infinity : Math.max(0, creditsTotal - creditsUsed);
  const usagePct = isUnlimited ? 0 : creditsTotal > 0 ? Math.min(100, (creditsUsed / creditsTotal) * 100) : 0;
  const isLow = !isUnlimited && creditsRemaining <= 1;
  const isExhausted = !isUnlimited && creditsRemaining === 0;

  async function handlePublish(id: string) {
    setPublishingId(id);
    try {
      const res = await apiClient.publishJob(id);
      if (res.success) {
        toast.success('Job published');
        setJobs((prev) => prev.map((j) => j._id === id ? { ...j, status: 'published' } : j));
        // Refresh company profile so the credit banner reflects the deducted credit
        const meRes = await apiClient.getCurrentUser();
        if (meRes.success && meRes.data) {
          setUser(meRes.data, userType);
        }
      } else {
        toast.error(res.message || 'Failed to publish');
      }
    } catch {
      toast.error('Failed to publish job');
    } finally {
      setPublishingId(null);
    }
  }

  async function handleClose(id: string) {
    setClosingId(id);
    try {
      const res = await apiClient.closeJob(id);
      if (res.success) {
        toast.success('Job closed');
        setJobs((prev) => prev.map((j) => j._id === id ? { ...j, status: 'closed' } : j));
      } else {
        toast.error(res.message || 'Failed to close job');
      }
    } catch {
      toast.error('Failed to close job');
    } finally {
      setClosingId(null);
    }
  }

  async function handleArchiveConfirm() {
    if (!archiveTarget) return;
    setArchivingId(archiveTarget._id);
    try {
      const res = await apiClient.archiveJob(archiveTarget._id);
      if (res.success) {
        toast.success('Job archived');
        setJobs((prev) => prev.map((j) => j._id === archiveTarget._id ? { ...j, status: 'archived' } : j));
      } else {
        toast.error(res.message || 'Failed to archive job');
      }
    } catch {
      toast.error('Failed to archive job');
    } finally {
      setArchivingId(null);
      setArchiveTarget(null);
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget._id);
    try {
      const res = await apiClient.deleteJob(deleteTarget._id);
      if (res.success) {
        toast.success('Job deleted');
        setJobs((prev) => prev.filter((j) => j._id !== deleteTarget._id));
      } else {
        toast.error(res.message || 'Failed to delete');
      }
    } catch {
      toast.error('Failed to delete job');
    } finally {
      setDeletingId(null);
      setDeleteTarget(null);
    }
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'all',      label: 'All' },
    { key: 'published', label: 'Published' },
    { key: 'drafted',  label: 'Drafts' },
    { key: 'closed',   label: 'Closed' },
    { key: 'archived', label: 'Archived' },
  ];

  return (
    <div>
      <PageHeader
        title="Jobs"
        description="Manage your job postings"
        action={
          <Link
            href="/employer/jobs/post"
            className={cn('btn btn-primary', isExhausted && 'opacity-50 pointer-events-none')}
            aria-disabled={isExhausted}
          >
            <Plus className="w-4 h-4" /> Post a Job
          </Link>
        }
      />

      {/* Credit usage banner */}
      {plan && (
        <div className={cn(
          'rounded-xl border p-4 mb-6 flex items-center gap-4',
          isExhausted
            ? 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800'
            : isLow
            ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800'
            : 'bg-gray-50 border-gray-200 dark:bg-gray-800/50 dark:border-gray-700'
        )}>
          <div className={cn(
            'w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center',
            isExhausted ? 'bg-red-100 dark:bg-red-900' : isLow ? 'bg-amber-100 dark:bg-amber-900' : 'bg-blue-100 dark:bg-blue-900'
          )}>
            {isExhausted || isLow
              ? <AlertCircle className={cn('w-5 h-5', isExhausted ? 'text-red-600' : 'text-amber-600')} />
              : <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            }
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {isUnlimited
                  ? 'Unlimited job posts'
                  : isExhausted
                  ? 'No job post credits remaining'
                  : `${creditsRemaining} job post credit${creditsRemaining !== 1 ? 's' : ''} remaining`
                }
              </p>
              {!isUnlimited && (
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex-shrink-0">
                  {creditsUsed} / {creditsTotal} used
                </span>
              )}
            </div>
            {!isUnlimited && (
              <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    isExhausted ? 'bg-red-500' : isLow ? 'bg-amber-500' : 'bg-blue-500'
                  )}
                  style={{ width: `${usagePct}%` }}
                />
              </div>
            )}
            {isExhausted && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                <Link href="/employer/settings?tab=subscription" className="underline font-medium">Upgrade your plan</Link> to post more jobs.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit mb-6 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
              tab === t.key
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            )}
          >
            {t.label}
            <span className={cn(
              'ml-2 text-xs px-1.5 py-0.5 rounded-full font-semibold',
              tab === t.key ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            )}>
              {counts[t.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Job list */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" className="text-blue-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Briefcase}
            title={tab === 'all' ? 'No jobs posted yet' : `No ${tab} jobs`}
            description={tab === 'all' ? 'Post your first job to start receiving applications.' : undefined}
            action={tab === 'all' ? (
              <Link href="/employer/jobs/post" className="btn btn-primary btn-sm">
                <Plus className="w-3.5 h-3.5" /> Post a Job
              </Link>
            ) : undefined}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((job) => (
            <div key={job._id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                    <Link href={`/employer/jobs/${job._id}`} className="font-semibold text-gray-900 dark:text-white text-lg leading-snug hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        {job.title}
                      </Link>
                    {jobStatusBadge(job.status)}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                    {job.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />{job.location}
                      </span>
                    )}
                    <span className="capitalize">{job.jobType?.replace('-', ' ')}</span>
                    <span className="capitalize">{job.level}-level</span>
                    {(job.salary?.min || job.salary?.max) && (
                      <span>{formatSalary(job.salary?.min, job.salary?.max, job.salary?.currency)}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2.5 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {job.views} views</span>
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {job.applicationCount} applicants</span>
                    <span>Posted {formatRelativeDate(job.createdAt)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                  {job.status === 'drafted' && (
                    <button
                      onClick={() => handlePublish(job._id)}
                      disabled={publishingId === job._id}
                      className="btn btn-primary btn-sm"
                    >
                      {publishingId === job._id ? <Spinner size="sm" /> : <Globe className="w-3.5 h-3.5" />}
                      Publish
                    </button>
                  )}
                  {job.status === 'published' && (
                    <>
                      <Link href={`/employer/jobs/${job._id}/applicants`} className="btn btn-outline btn-sm">
                        <Users className="w-3.5 h-3.5" /> Applicants
                      </Link>
                      <button
                        onClick={() => handleClose(job._id)}
                        disabled={closingId === job._id}
                        className="btn btn-outline btn-sm"
                      >
                        {closingId === job._id ? <Spinner size="sm" /> : <EyeOff className="w-3.5 h-3.5" />}
                        Close
                      </button>
                      <button
                        onClick={() => setArchiveTarget(job)}
                        disabled={archivingId === job._id}
                        className="btn btn-ghost btn-icon"
                        title="Archive job"
                      >
                        {archivingId === job._id ? <Spinner size="sm" /> : <Archive className="w-4 h-4" />}
                      </button>
                    </>
                  )}
                  {(job.status === 'closed' || job.status === 'archived') && (
                    <Link href={`/employer/jobs/${job._id}/applicants`} className="btn btn-outline btn-sm">
                      <Users className="w-3.5 h-3.5" /> Applicants
                    </Link>
                  )}
                  <Link href={`/employer/jobs/post?edit=${job._id}`} className="btn btn-ghost btn-icon" title="Edit job">
                    <Edit2 className="w-4 h-4" />
                  </Link>
                  {job.status !== 'published' && (
                    <button
                      onClick={() => setDeleteTarget(job)}
                      disabled={deletingId === job._id}
                      className="btn btn-danger btn-icon"
                    >
                      {deletingId === job._id ? <Spinner size="sm" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Archive confirmation */}
      <ConfirmModal
        open={!!archiveTarget}
        title="Archive this job?"
        description={`"${archiveTarget?.title}" will be hidden from candidates but your data and applicants will be preserved.`}
        confirmLabel="Archive"
        cancelLabel="Cancel"
        variant="warning"
        loading={archivingId === archiveTarget?._id}
        onConfirm={handleArchiveConfirm}
        onCancel={() => setArchiveTarget(null)}
      />

      {/* Delete confirmation */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete this job?"
        description={`"${deleteTarget?.title}" will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        loading={deletingId === deleteTarget?._id}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
