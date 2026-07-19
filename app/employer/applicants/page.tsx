'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { PageHeader } from '@/app/components/ui/PageHeader';
import { EmptyState } from '@/app/components/ui/EmptyState';
import { Spinner } from '@/app/components/ui/Spinner';
import { Avatar } from '@/app/components/ui/Avatar';
import { applicationStatusBadge, Badge } from '@/app/components/ui/Badge';
import { formatRelativeDate } from '@/lib/utils';
import { IApplication, IUser, IJob } from '@/types';
import { Users, ArrowRight, FileText, Search } from 'lucide-react';

interface JobGroup {
  job: IJob;
  applications: IApplication[];
}

export default function AllApplicantsPage() {
  const [groups, setGroups] = useState<JobGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const jobsRes = await apiClient.getCompanyJobs();
      if (!jobsRes.success || !Array.isArray(jobsRes.data)) return;

      const jobs: IJob[] = jobsRes.data.filter((j: IJob) => j.applicationCount > 0 || j.status === 'published');
      const results = await Promise.allSettled(
        jobs.map((job) => apiClient.getJobApplications(job._id).then((r) => ({ job, apps: r.data ?? [] })))
      );
      const grouped: JobGroup[] = results
        .filter((r): r is PromiseFulfilledResult<{ job: IJob; apps: IApplication[] }> => r.status === 'fulfilled')
        .filter((r) => r.value.apps.length > 0)
        .map((r) => ({ job: r.value.job, applications: Array.isArray(r.value.apps) ? r.value.apps : (r.value.apps as any)?.applications ?? [] }));
      setGroups(grouped);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const totalApps = groups.reduce((acc, g) => acc + g.applications.length, 0);

  const query = search.trim().toLowerCase();
  const filteredGroups = query
    ? groups
        .map((g) => ({
          job: g.job,
          applications: g.applications.filter((app) => {
            const a = app.applicant as IUser;
            const name = a ? `${a.firstname} ${a.lastname}` : '';
            return name.toLowerCase().includes(query) || a?.email?.toLowerCase().includes(query);
          }),
        }))
        .filter((g) => g.applications.length > 0)
    : groups;

  return (
    <div>
      <PageHeader
        title="Applicants"
        description={totalApps > 0 ? `${totalApps} total application${totalApps !== 1 ? 's' : ''} across all jobs` : 'Manage applicants across all your job postings'}
      />

      {!loading && groups.length > 0 && (
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search applicants by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" className="text-blue-500" />
        </div>
      ) : groups.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Users}
            title="No applications yet"
            description="Applications will appear here once candidates apply to your published jobs."
            action={
              <Link href="/employer/jobs" className="btn btn-primary btn-sm">
                View my jobs <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          />
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Search}
            title="No matching applicants"
            description={`No applicants match "${search.trim()}". Try a different name or email.`}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {filteredGroups.map(({ job, applications }) => (
            <div key={job._id} className="card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-white">{job.title}</h2>
                  <p className="text-sm text-gray-500">{applications.length} applicant{applications.length !== 1 ? 's' : ''}</p>
                </div>
                <Link href={`/employer/jobs/${job._id}/applicants`} className="btn btn-outline btn-sm">
                  View all <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {applications.slice(0, 4).map((app) => {
                  const a = app.applicant as IUser;
                  const name = a ? `${a.firstname} ${a.lastname}` : 'Unknown';
                  return (
                    <div key={app._id} className="flex items-center gap-3 py-3">
                      <Avatar src={a?.profilePhoto} name={name} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{name}</p>
                        <p className="text-xs text-gray-400 truncate">{a?.email}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {applicationStatusBadge(app.status)}
                        {app.resume && <FileText className="w-3.5 h-3.5 text-blue-400" />}
                        <span className="text-xs text-gray-400">{formatRelativeDate(app.appliedAt)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {applications.length > 4 && (
                <Link href={`/employer/jobs/${job._id}/applicants`} className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-3 block">
                  +{applications.length - 4} more applicants
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
