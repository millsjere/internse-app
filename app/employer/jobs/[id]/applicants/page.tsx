'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { PageHeader } from '@/app/components/ui/PageHeader';
import { EmptyState } from '@/app/components/ui/EmptyState';
import { Spinner } from '@/app/components/ui/Spinner';
import { Avatar } from '@/app/components/ui/Avatar';
import { applicationStatusBadge, Badge } from '@/app/components/ui/Badge';
import { formatDate, formatRelativeDate } from '@/lib/utils';
import { IApplication, IUser } from '@/types';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Users, X, ExternalLink, CheckCircle, XCircle,
  Briefcase, GraduationCap, FileText, Mail, Phone, MapPin,
  Calendar, Clock, Download, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type StatusFilter = 'all' | 'pending' | 'reviewing' | 'accepted' | 'rejected';

const PAGE_SIZE = 50;

export default function ApplicantsPage() {
  const { id: jobId } = useParams<{ id: string }>();
  const [applications, setApplications] = useState<IApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<IApplication | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [jobTitle, setJobTitle] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState({ all: 0, pending: 0, reviewing: 0, accepted: 0, rejected: 0 });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.getJobApplications(jobId, { page, limit: PAGE_SIZE, status: statusFilter });
      if (res.success) {
        const apps: IApplication[] = Array.isArray(res.data) ? res.data : res.data?.applications ?? [];
        setApplications(apps);
        if (apps[0]?.job?.title) setJobTitle(apps[0].job.title);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages);
          setTotal(res.pagination.total);
        }
        if (res.counts) {
          setCounts({ all: 0, pending: 0, reviewing: 0, accepted: 0, rejected: 0, ...res.counts });
        }
      }
    } catch {
      toast.error('Failed to load applicants');
    } finally {
      setLoading(false);
    }
  }, [jobId, page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const filtered = applications;

  function selectStatusFilter(status: StatusFilter) {
    setStatusFilter(status);
    setPage(1);
  }

  function handleExport() {
    const url = apiClient.getJobApplicationsExportUrl(jobId, statusFilter);
    window.open(url, '_blank');
  }

  async function updateStatus(appId: string, status: 'accepted' | 'rejected') {
    setActionLoading(appId + status);
    try {
      const res = await apiClient.updateApplicationStatus(appId, status);
      if (res.success) {
        toast.success(status === 'accepted' ? 'Applicant accepted — email sent!' : 'Applicant declined');
        setApplications((prev) => prev.map((a) => a._id === appId ? { ...a, status } : a));
        if (selected?._id === appId) setSelected((prev) => prev ? { ...prev, status } : null);
      } else {
        toast.error(res.message || 'Failed to update status');
      }
    } catch {
      toast.error('Failed to update status');
    } finally {
      setActionLoading(null);
    }
  }

  const tabs: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'reviewing', label: 'Reviewing' },
    { key: 'accepted', label: 'Accepted' },
    { key: 'rejected', label: 'Rejected' },
  ];

  const applicant = selected?.applicant as IUser | undefined;
  const fullName = applicant ? `${applicant.firstname} ${applicant.lastname}` : '';

  return (
    <div>
      <Link href="/employer/jobs" className="btn btn-ghost btn-sm -ml-2 mb-4 inline-flex">
        <ArrowLeft className="w-4 h-4" /> Back to Jobs
      </Link>

      <PageHeader
        title="Applicants"
        description={jobTitle ? `Applications for "${jobTitle}"` : 'Review and manage applicants'}
        action={
          <button onClick={handleExport} className="btn btn-outline btn-sm">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit mb-6 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => selectStatusFilter(t.key)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
              statusFilter === t.key
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            )}
          >
            {t.label}
            {counts[t.key] > 0 && (
              <span className={cn(
                'ml-1.5 text-xs px-1.5 py-0.5 rounded-full font-semibold',
                statusFilter === t.key ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
              )}>
                {counts[t.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" className="text-blue-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Users}
            title="No applicants yet"
            description="Applications will appear here once candidates apply."
          />
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((app) => {
            const a = app.applicant as IUser;
            const name = a ? `${a.firstname} ${a.lastname}` : 'Unknown';
            return (
              <button
                key={app._id}
                onClick={() => setSelected(app)}
                className="card w-full text-left hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4">
                  <Avatar src={a?.profilePhoto} name={name} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 mb-0.5">
                      <span className="font-semibold text-gray-900 dark:text-white">{name}</span>
                      {applicationStatusBadge(app.status)}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{a?.email}</p>
                    {a?.skills && a.skills.length > 0 && (
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {a.skills.slice(0, 4).map((skill) => (
                          <Badge key={skill} variant="gray">{skill}</Badge>
                        ))}
                        {a.skills.length > 4 && <Badge variant="gray">+{a.skills.length - 4}</Badge>}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatRelativeDate(app.appliedAt)}</span>
                    {app.resume && (
                      <span className="flex items-center gap-1 text-blue-500"><FileText className="w-3.5 h-3.5" />Resume</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && total > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-xs text-gray-400">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="btn btn-outline btn-sm"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </button>
            <span className="text-sm text-gray-500 px-2">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="btn btn-outline btn-sm"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Slide-over drawer */}
      {selected && (
        <>
          <div className="drawer-overlay animate-fadeIn" onClick={() => setSelected(null)} />
          <div className="drawer animate-slideInRight">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
              <div className="flex items-center gap-3">
                <Avatar src={applicant?.profilePhoto} name={fullName || 'A'} size="md" />
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-white">{fullName}</h2>
                  <p className="text-sm text-gray-500">{applicant?.email}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="btn btn-ghost btn-icon">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Application status</p>
                  {applicationStatusBadge(selected.status)}
                </div>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Applied {formatDate(selected.appliedAt)}
                </p>
              </div>

              {/* Contact */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Contact</h3>
                <div className="space-y-2">
                  <a href={`mailto:${applicant?.email}`} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                    <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    {applicant?.email}
                  </a>
                  {applicant?.phone && (
                    <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                      <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      {applicant.phone}
                    </div>
                  )}
                </div>
              </div>

              {/* Bio */}
              {applicant?.bio && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">About</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{applicant.bio}</p>
                </div>
              )}

              {/* Skills */}
              {applicant?.skills && applicant.skills.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {applicant.skills.map((skill) => (
                      <Badge key={skill} variant="blue">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              {applicant?.experience && applicant.experience.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" /> Experience
                  </h3>
                  <div className="space-y-3">
                    {applicant.experience.map((exp, i) => (
                      <div key={exp._id ?? i} className="pl-3 border-l-2 border-gray-200 dark:border-gray-700">
                        <p className="font-medium text-sm text-gray-900 dark:text-white">{exp.position}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{exp.company}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatDate(exp.startDate)} – {exp.currentlyWorking ? 'Present' : (exp.endDate ? formatDate(exp.endDate) : '')}
                        </p>
                        {exp.description && <p className="text-xs text-gray-500 mt-1">{exp.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {applicant?.education && applicant.education.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5" /> Education
                  </h3>
                  <div className="space-y-3">
                    {applicant.education.map((edu, i) => (
                      <div key={edu._id ?? i} className="pl-3 border-l-2 border-gray-200 dark:border-gray-700">
                        <p className="font-medium text-sm text-gray-900 dark:text-white">{edu.degree} in {edu.field}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{edu.school}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatDate(edu.startDate)} – {edu.endDate ? formatDate(edu.endDate) : 'Present'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Screening questions */}
              {selected.answers && selected.answers.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Screening Questions</h3>
                  <div className="space-y-3">
                    {selected.answers.map((a) => (
                      <div key={a.questionId} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1.5">{a.question}</p>
                        {Array.isArray(a.answer) ? (
                          a.answer.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {a.answer.map((opt) => (
                                <span key={opt} className="badge-blue">{opt}</span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-400 italic">No answer</p>
                          )
                        ) : (
                          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                            {a.answer || <span className="text-gray-400 italic">No answer</span>}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cover letter */}
              {selected.coverLetter && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Cover Letter</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    {selected.coverLetter}
                  </p>
                </div>
              )}

              {/* Resume */}
              {selected.resume && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Resume</h3>
                  <a
                    href={selected.resume}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors group"
                  >
                    <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <span className="flex-1 text-sm font-medium text-gray-900 dark:text-white">View Resume</span>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                  </a>
                </div>
              )}
            </div>

            {/* Action footer */}
            {selected.status !== 'accepted' && selected.status !== 'rejected' && (
              <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => updateStatus(selected._id, 'rejected')}
                    disabled={!!actionLoading}
                    className="btn btn-danger"
                  >
                    {actionLoading === selected._id + 'rejected' ? <Spinner size="sm" /> : <XCircle className="w-4 h-4" />}
                    Decline
                  </button>
                  <button
                    onClick={() => updateStatus(selected._id, 'accepted')}
                    disabled={!!actionLoading}
                    className="btn btn-secondary"
                  >
                    {actionLoading === selected._id + 'accepted' ? <Spinner size="sm" /> : <CheckCircle className="w-4 h-4" />}
                    Accept
                  </button>
                </div>
                <p className="text-xs text-gray-400 text-center mt-2">
                  Accepting will send an email notification to the applicant.
                </p>
              </div>
            )}

            {(selected.status === 'accepted' || selected.status === 'rejected') && (
              <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900">
                <div className={cn(
                  'flex items-center gap-2 p-3 rounded-xl text-sm font-medium',
                  selected.status === 'accepted'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
                )}>
                  {selected.status === 'accepted' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  {selected.status === 'accepted' ? 'Applicant accepted — notification sent' : 'Applicant declined'}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
