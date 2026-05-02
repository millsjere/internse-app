'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, MapPin, Calendar, Eye, Users, DollarSign,
  Edit2, Globe, EyeOff, Archive, Briefcase, Tag, HelpCircle,
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Spinner } from '@/app/components/ui/Spinner';
import toast from 'react-hot-toast';

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  published: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
  drafted:   { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-500 dark:text-gray-400', dot: 'bg-gray-400' },
  closed:    { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-500 dark:text-red-400', dot: 'bg-red-500' },
  expired:   { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-500 dark:text-orange-400', dot: 'bg-orange-500' },
  archived:  { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-500 dark:text-gray-400', dot: 'bg-gray-400' },
};

const JOB_TYPE_COLORS: Record<string, string> = {
  'full-time':  'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
  'part-time':  'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
  'contract':   'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
  'internship': 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400',
};

function formatSalary(salary?: any) {
  if (!salary || (!salary.min && !salary.max)) return 'Not specified';
  const sym = salary.currency === 'NGN' ? '₦' : salary.currency === 'EUR' ? '€' : salary.currency === 'GBP' ? '£' : '$';
  const fmt = (n: number) => n >= 1000 ? `${sym}${(n / 1000).toFixed(0)}k` : `${sym}${n}`;
  if (salary.min && salary.max) return `${fmt(salary.min)} – ${fmt(salary.max)}`;
  if (salary.min) return `From ${fmt(salary.min)}`;
  return `Up to ${fmt(salary.max)}`;
}

export default function EmployerJobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.getCompanyJobs();
        if (res.success && Array.isArray(res.data)) {
          const found = res.data.find((j: any) => j._id === id);
          if (found) setJob(found);
        }
      } catch {
        toast.error('Failed to load job');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function handlePublish() {
    setActionId('publish');
    try {
      const res = await apiClient.publishJob(id);
      if (res.success) {
        setJob((prev: any) => ({ ...prev, status: 'published' }));
        toast.success('Job published');
      } else {
        toast.error(res.message || 'Failed to publish');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Action failed');
    } finally {
      setActionId(null);
    }
  }

  async function handleClose() {
    setActionId('close');
    try {
      const res = await apiClient.closeJob(id);
      if (res.success) {
        setJob((prev: any) => ({ ...prev, status: 'closed' }));
        toast.success('Job closed');
      } else {
        toast.error(res.message || 'Failed to close');
      }
    } catch {
      toast.error('Action failed');
    } finally {
      setActionId(null);
    }
  }

  async function handleArchive() {
    setActionId('archive');
    try {
      const res = await apiClient.archiveJob(id);
      if (res.success) {
        setJob((prev: any) => ({ ...prev, status: 'archived' }));
        toast.success('Job archived');
      } else {
        toast.error(res.message || 'Failed to archive');
      }
    } catch {
      toast.error('Action failed');
    } finally {
      setActionId(null);
    }
  }

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Spinner size="lg" className="text-blue-500" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Briefcase className="w-12 h-12 text-gray-300 dark:text-gray-600" />
        <p className="text-gray-500 dark:text-gray-400">Job not found.</p>
        <Link href="/employer/jobs" className="text-sm text-blue-600 hover:underline">Back to Jobs</Link>
      </div>
    );
  }

  const statusStyle = STATUS_STYLES[job.status] || STATUS_STYLES.drafted;

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Back nav */}
      <button
        onClick={() => router.push('/employer/jobs')}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Jobs
      </button>

      {/* Hero card */}
      <div className="card">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          {/* Icon + info */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md flex-shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{job.title}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-1">
                {job.location && (
                  <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <MapPin className="w-3 h-3" />{job.location}
                  </span>
                )}
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  Posted {new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusStyle.bg} ${statusStyle.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                  {job.status}
                </span>
                {job.jobType && (
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${JOB_TYPE_COLORS[job.jobType] || JOB_TYPE_COLORS['full-time']}`}>
                    {job.jobType}
                  </span>
                )}
                {job.level && (
                  <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 capitalize">
                    {job.level}-level
                  </span>
                )}
                {job.remote && (
                  <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400">
                    Remote
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/employer/jobs/post?edit=${job._id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-800 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />Edit
            </Link>
            <Link
              href={`/employer/jobs/${job._id}/applicants`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-colors"
            >
              <Users className="w-3.5 h-3.5" />Applicants
            </Link>
            {job.status === 'drafted' && (
              <button
                onClick={handlePublish}
                disabled={!!actionId}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 transition-colors disabled:opacity-50"
              >
                {actionId === 'publish' ? <Spinner size="sm" /> : <Globe className="w-3.5 h-3.5" />}
                Publish
              </button>
            )}
            {job.status === 'published' && (
              <>
                <button
                  onClick={handleClose}
                  disabled={!!actionId}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 border border-amber-200 dark:border-amber-800 transition-colors disabled:opacity-50"
                >
                  {actionId === 'close' ? <Spinner size="sm" /> : <EyeOff className="w-3.5 h-3.5" />}
                  Close
                </button>
                <button
                  onClick={handleArchive}
                  disabled={!!actionId}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-colors disabled:opacity-50"
                >
                  {actionId === 'archive' ? <Spinner size="sm" /> : <Archive className="w-3.5 h-3.5" />}
                  Archive
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={<Eye className="w-4 h-4" />} color="blue" label="Views" value={job.views ?? 0} />
        <StatCard icon={<Users className="w-4 h-4" />} color="indigo" label="Applications" value={job.applicationCount ?? 0} />
        <StatCard icon={<DollarSign className="w-4 h-4" />} color="emerald" label="Salary" value={formatSalary(job.salary)} small />
        <StatCard
          icon={<Calendar className="w-4 h-4" />}
          color="gray"
          label="Posted"
          value={new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          small
        />
      </div>

      {/* Description */}
      {job.description && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Description</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">{job.description}</p>
        </div>
      )}

      {/* Requirements + Responsibilities */}
      {(job.requirements?.length > 0 || job.responsibilities?.length > 0) && (
        <div className="grid sm:grid-cols-2 gap-5">
          {job.requirements?.length > 0 && (
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Requirements</h3>
              <ul className="space-y-1.5">
                {job.requirements.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {job.responsibilities?.length > 0 && (
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Responsibilities</h3>
              <ul className="space-y-1.5">
                {job.responsibilities.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Benefits */}
      {job.benefits?.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Benefits</h3>
          <div className="flex flex-wrap gap-2">
            {job.benefits.map((b: string, i: number) => (
              <span key={i} className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-medium">
                {b}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {job.tags?.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-gray-400" />Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {job.tags.map((t: string, i: number) => (
              <span key={i} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Screening questions */}
      {job.questions?.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <HelpCircle className="w-3.5 h-3.5 text-gray-400" />Screening Questions
          </h3>
          <ol className="space-y-2">
            {job.questions.map((q: any, i: number) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-300">
                <span className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span>
                  {q.question}
                  {q.required && <span className="ml-1.5 text-xs text-red-500">*required</span>}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

const STAT_COLORS: Record<string, string> = {
  blue:    'bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400',
  indigo:  'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 dark:text-indigo-400',
  emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 dark:text-emerald-400',
  gray:    'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
};

function StatCard({
  icon, color, label, value, small,
}: {
  icon: React.ReactNode;
  color: keyof typeof STAT_COLORS;
  label: string;
  value: string | number;
  small?: boolean;
}) {
  return (
    <div className="card p-4">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${STAT_COLORS[color]}`}>
        {icon}
      </div>
      <p className={`font-bold text-gray-900 dark:text-white truncate ${small ? 'text-sm' : 'text-2xl'}`}>{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}
