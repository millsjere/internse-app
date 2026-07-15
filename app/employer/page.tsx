'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api';
import { PageHeader } from '@/app/components/ui/PageHeader';
import { Spinner } from '@/app/components/ui/Spinner';
import { Badge, jobStatusBadge } from '@/app/components/ui/Badge';
import { VerificationStatusCard } from '@/app/components/employer/VerificationStatusCard';
import { formatRelativeDate } from '@/lib/utils';
import { IJob } from '@/types';
import {
  Briefcase, Users, Eye, TrendingUp, Plus, ArrowRight,
  CheckCircle, Clock,
} from 'lucide-react';

interface Stats {
  totalJobs: number;
  publishedJobs: number;
  draftJobs: number;
  totalApplications: number;
  totalViews: number;
}

interface VerificationStatus {
  status: 'not_submitted' | 'pending' | 'approved' | 'rejected';
  canPostJobs: boolean;
  rejectionReason?: string;
}

export default function EmployerOverviewPage() {
  const { user } = useAuthStore();
  const [jobs, setJobs] = useState<IJob[]>([]);
  const [stats, setStats] = useState<Stats>({ totalJobs: 0, publishedJobs: 0, draftJobs: 0, totalApplications: 0, totalViews: 0 });
  const [verification, setVerification] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const companyName = (user as any)?.companyName ?? 'Company';

  const load = useCallback(async () => {
    try {
      const [jobsRes, verificationRes] = await Promise.all([
        apiClient.getCompanyJobs(),
        apiClient.getVerificationStatus(),
      ]);

      if (jobsRes.success && Array.isArray(jobsRes.data)) {
        const list: IJob[] = jobsRes.data;
        setJobs(list.slice(0, 5));
        setStats({
          totalJobs: list.length,
          publishedJobs: list.filter((j) => j.status === 'published').length,
          draftJobs: list.filter((j) => j.status === 'drafted').length,
          totalApplications: list.reduce((acc, j) => acc + (j.applicationCount ?? 0), 0),
          totalViews: list.reduce((acc, j) => acc + (j.views ?? 0), 0),
        });
      }

      if (verificationRes.success) {
        setVerification(verificationRes.data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const statCards = [
    { label: 'Total Jobs', value: stats.totalJobs, icon: Briefcase, color: 'bg-blue-50 dark:bg-blue-950', iconColor: 'text-blue-600 dark:text-blue-400' },
    { label: 'Published', value: stats.publishedJobs, icon: CheckCircle, color: 'bg-emerald-50 dark:bg-emerald-950', iconColor: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Applications', value: stats.totalApplications, icon: Users, color: 'bg-purple-50 dark:bg-purple-950', iconColor: 'text-purple-600 dark:text-purple-400' },
    { label: 'Total Views', value: stats.totalViews, icon: Eye, color: 'bg-amber-50 dark:bg-amber-950', iconColor: 'text-amber-600 dark:text-amber-400' },
  ];

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${companyName}`}
        description="Here's what's happening with your job postings."
        action={
          <Link href="/employer/jobs/post" className="btn btn-primary">
            <Plus className="w-4 h-4" />
            Post a Job
          </Link>
        }
      />

      {/* Verification Status */}
      {verification && <div className="mb-6"><VerificationStatusCard verification={verification} /></div>}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className="card">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 ${s.iconColor}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {loading ? <Spinner size="sm" className="text-gray-400" /> : s.value}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent jobs */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-gray-900 dark:text-white">Recent Job Postings</h2>
          <Link href="/employer/jobs" className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner size="md" className="text-gray-400" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
              <Briefcase className="w-7 h-7 text-gray-400" />
            </div>
            <p className="font-medium text-gray-900 dark:text-white mb-1">No jobs posted yet</p>
            <p className="text-sm text-gray-500 mb-4">Start attracting top talent by posting your first job.</p>
            <Link href="/employer/jobs/post" className="btn btn-primary btn-sm">
              <Plus className="w-3.5 h-3.5" /> Post your first job
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {jobs.map((job) => (
              <div key={job._id} className="flex items-center justify-between py-3.5 gap-4">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 dark:text-white truncate">{job.title}</p>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{job.views} views</span>
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{job.applicationCount} applicants</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatRelativeDate(job.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {jobStatusBadge(job.status)}
                  <Link href={`/employer/jobs/${job._id}/applicants`} className="btn btn-outline btn-sm whitespace-nowrap">
                    View applicants
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
