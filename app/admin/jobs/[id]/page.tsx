'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, MapPin, Calendar, Eye, Users, DollarSign,
  Star, StarOff, XCircle, Trash2, AlertTriangle, Briefcase, Building2,
} from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import toast from 'react-hot-toast';

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  published: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
  draft:     { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-500 dark:text-gray-400', dot: 'bg-gray-400' },
  closed:    { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-500 dark:text-red-400', dot: 'bg-red-500' },
  expired:   { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-500 dark:text-orange-400', dot: 'bg-orange-500' },
  archived:  { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-500 dark:text-gray-400', dot: 'bg-gray-400' },
  drafted:   { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-500 dark:text-gray-400', dot: 'bg-gray-400' },
};

const JOB_TYPE_COLORS: Record<string, string> = {
  'full-time':  'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
  'part-time':  'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
  'contract':   'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
  'internship': 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400',
};

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    adminApi.getJobDetail(id)
      .then((res) => setJob(res.data ?? res))
      .catch(() => toast.error('Failed to load job'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleToggleFeatured() {
    try {
      await adminApi.toggleFeatured(id);
      setJob({ ...job, featured: !job.featured });
      toast.success(job.featured ? 'Removed from featured' : 'Job featured for 30 days');
    } catch { toast.error('Action failed'); }
  }

  async function handleClose() {
    try {
      await adminApi.forceCloseJob(id);
      setJob({ ...job, status: 'closed' });
      toast.success('Job closed');
    } catch { toast.error('Action failed'); }
  }

  async function handleDelete() {
    try {
      await adminApi.deleteJob(id);
      toast.success('Job deleted');
      router.push('/admin/jobs');
    } catch { toast.error('Delete failed'); }
  }

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!job) return <p className="text-gray-400">Job not found.</p>;

  const statusStyle = STATUS_STYLES[job.status] || STATUS_STYLES.draft;
  const salary = job.salary?.min || job.salary?.max
    ? `${job.salary.currency || 'USD'} ${job.salary.min?.toLocaleString() ?? '?'} – ${job.salary.max?.toLocaleString() ?? '?'}`
    : 'Not specified';

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Back nav */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Jobs
      </button>

      {/* Hero card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
        <div className="bg-gradient-to-r from-amber-500/15 via-orange-400/8 to-transparent dark:from-amber-500/10 dark:via-orange-400/5 rounded-t-2xl px-6 py-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            {/* Icon + info */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-md flex-shrink-0">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{job.title}</h1>
                <div className="flex flex-wrap items-center gap-3 mt-1">
                  {job.company && (
                    <Link
                      href={`/admin/companies/${job.company._id}`}
                      className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                    >
                      <Building2 className="w-3 h-3" />{job.company.companyName}
                    </Link>
                  )}
                  {job.location && (
                    <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <MapPin className="w-3 h-3" />{job.location}
                    </span>
                  )}
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
                  {job.featured && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400">
                      <Star className="w-3 h-3" />Featured
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleToggleFeatured}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                  job.featured
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800 hover:bg-yellow-100'
                    : 'bg-white/70 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700'
                }`}
              >
                {job.featured ? <StarOff className="w-3.5 h-3.5" /> : <Star className="w-3.5 h-3.5" />}
                {job.featured ? 'Unfeature' : 'Feature'}
              </button>
              {job.status === 'published' && (
                <button
                  onClick={handleClose}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 border border-amber-200 dark:border-amber-800 transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />Force Close
                </button>
              )}
              {confirmDelete ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Sure?</span>
                  <button
                    onClick={handleDelete}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />Yes, delete
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/70 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={<Eye className="w-4 h-4" />} color="amber" label="Views" value={job.views ?? 0} />
        <StatCard icon={<Users className="w-4 h-4" />} color="blue" label="Applications" value={job.applicationCount ?? 0} />
        <StatCard icon={<DollarSign className="w-4 h-4" />} color="emerald" label="Salary" value={salary} small />
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
        <ContentSection title="Description">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">{job.description}</p>
        </ContentSection>
      )}

      {/* Requirements + Responsibilities */}
      {(job.requirements?.length > 0 || job.responsibilities?.length > 0) && (
        <div className="grid sm:grid-cols-2 gap-5">
          {job.requirements?.length > 0 && (
            <ContentSection title="Requirements">
              <ul className="space-y-1.5">
                {job.requirements.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </ContentSection>
          )}
          {job.responsibilities?.length > 0 && (
            <ContentSection title="Responsibilities">
              <ul className="space-y-1.5">
                {job.responsibilities.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </ContentSection>
          )}
        </div>
      )}

      {/* Benefits */}
      {job.benefits?.length > 0 && (
        <ContentSection title="Benefits">
          <div className="flex flex-wrap gap-2">
            {job.benefits.map((b: string, i: number) => (
              <span key={i} className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-medium">
                {b}
              </span>
            ))}
          </div>
        </ContentSection>
      )}

      {/* Delete warning */}
      {confirmDelete && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-200 dark:border-red-800">
          <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-400">
            Deleting <strong>{job.title}</strong> will permanently remove all applications for this job. This cannot be undone.
          </p>
        </div>
      )}
    </div>
  );
}

const STAT_COLORS: Record<string, string> = {
  amber:   'bg-amber-50 dark:bg-amber-900/20 text-amber-500 dark:text-amber-400',
  blue:    'bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400',
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
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${STAT_COLORS[color]}`}>
        {icon}
      </div>
      <p className={`font-bold text-gray-900 dark:text-white truncate ${small ? 'text-sm' : 'text-2xl'}`}>{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}

function ContentSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{title}</h3>
      {children}
    </div>
  );
}
