'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiClient, ApplicationFilterParams } from '@/lib/api';
import { PageHeader } from '@/app/components/ui/PageHeader';
import { EmptyState } from '@/app/components/ui/EmptyState';
import { Spinner } from '@/app/components/ui/Spinner';
import { ConfirmModal } from '@/app/components/ui/ConfirmModal';
import { Avatar } from '@/app/components/ui/Avatar';
import { applicationStatusBadge, Badge } from '@/app/components/ui/Badge';
import { formatDate, formatDateTime, formatRelativeDate } from '@/lib/utils';
import { IApplication, IJob, IUser } from '@/types';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Users, X, CheckCircle, XCircle,
  Briefcase, GraduationCap, FileText, Mail, Phone, MapPin,
  Calendar, Clock, Download, ChevronLeft, ChevronRight,
  Search, SlidersHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type StatusFilter = 'all' | 'pending' | 'reviewing' | 'accepted' | 'rejected';
type DatePreset = 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'custom';
type JobQuestion = IJob['questions'][number];

const DATE_PRESETS: { key: DatePreset; label: string }[] = [
  { key: 'thisWeek', label: 'This week' },
  { key: 'lastWeek', label: 'Last week' },
  { key: 'thisMonth', label: 'This month' },
  { key: 'lastMonth', label: 'Last month' },
  { key: 'custom', label: 'Custom' },
];

// Question types with discrete/structured answers, safe to filter by exact value.
// Free-text types (text/paragraph) are excluded — "contains" matching isn't offered.
const FILTERABLE_QUESTION_TYPES = new Set(['single_choice', 'multi_choice', 'dropdown', 'date']);

// The shared `.input` class bakes its own padding/font-size into a rule that's declared
// after Tailwind's utility layer in globals.css, so utility overrides (e.g. `pl-9`, `py-1.5`)
// lose the cascade. These controls sit next to a `btn-sm` and need to match its height exactly,
// so we bypass `.input` and write the utilities out directly (h-9 pinned on both).
const compactInputClass = 'h-9 px-3 text-sm border border-gray-300 dark:border-gray-700 rounded-lg ' +
  'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 ' +
  'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary dark:focus:ring-blue-500/30 dark:focus:border-blue-500 ' +
  'transition-colors duration-150';

function toDateInputLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getPresetRange(preset: DatePreset): { from: string; to: string } | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (preset === 'thisWeek') {
    const start = new Date(today);
    start.setDate(start.getDate() - start.getDay());
    return { from: toDateInputLocal(start), to: toDateInputLocal(today) };
  }
  if (preset === 'lastWeek') {
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
    const start = new Date(thisWeekStart);
    start.setDate(start.getDate() - 7);
    const end = new Date(thisWeekStart);
    end.setDate(end.getDate() - 1);
    return { from: toDateInputLocal(start), to: toDateInputLocal(end) };
  }
  if (preset === 'thisMonth') {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    return { from: toDateInputLocal(start), to: toDateInputLocal(today) };
  }
  if (preset === 'lastMonth') {
    const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const end = new Date(today.getFullYear(), today.getMonth(), 0);
    return { from: toDateInputLocal(start), to: toDateInputLocal(end) };
  }
  return null;
}

const PAGE_SIZE = 50;
const EXPORT_BATCH_SIZE = 1000;

export default function ApplicantsPage() {
  const { id: jobId } = useParams<{ id: string }>();
  const [applications, setApplications] = useState<IApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<IApplication | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [jobTitle, setJobTitle] = useState('');
  const [questions, setQuestions] = useState<JobQuestion[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState({ all: 0, pending: 0, reviewing: 0, accepted: 0, rejected: 0 });

  // Search
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  // Advanced filters
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const [datePreset, setDatePreset] = useState<DatePreset | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [customFromDraft, setCustomFromDraft] = useState('');
  const [customToDraft, setCustomToDraft] = useState('');
  const [questionId, setQuestionId] = useState('');
  const [answerValue, setAnswerValue] = useState('');

  const hasAdvancedFilters = Boolean(dateFrom || dateTo || (questionId && answerValue));
  const selectedQuestion = questions.find((q) => q._id === questionId);
  const filterableQuestions = questions.filter((q) => q.type && FILTERABLE_QUESTION_TYPES.has(q.type));

  // Export
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportCount, setExportCount] = useState<number | null>(null);
  const [exportCountLoading, setExportCountLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportBatch, setExportBatch] = useState<{ current: number; total: number } | null>(null);

  // Debounce search input before it drives the API call
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Close the filter popover on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter params shared by the list fetch, the export count check, and each export batch
  const currentFilterParams = useCallback((): Omit<ApplicationFilterParams, 'page' | 'limit'> => ({
    status: statusFilter,
    search: search || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    questionId: questionId && answerValue ? questionId : undefined,
    answer: questionId && answerValue ? answerValue : undefined,
  }), [statusFilter, search, dateFrom, dateTo, questionId, answerValue]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.getJobApplications(jobId, { page, limit: PAGE_SIZE, ...currentFilterParams() });
      if (res.success) {
        const apps: IApplication[] = Array.isArray(res.data) ? res.data : res.data?.applications ?? [];
        setApplications(apps);
        if (res.job) {
          setJobTitle(res.job.title ?? '');
          setQuestions(res.job.questions ?? []);
        }
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
  }, [jobId, page, currentFilterParams]);

  useEffect(() => { load(); }, [load]);

  const filtered = applications;

  function selectDatePreset(preset: DatePreset) {
    if (preset === 'custom') {
      setCustomFromDraft(dateFrom);
      setCustomToDraft(dateTo);
      setDatePreset('custom');
      return;
    }
    const range = getPresetRange(preset);
    if (range) {
      setDatePreset(preset);
      setDateFrom(range.from);
      setDateTo(range.to);
      setPage(1);
    }
  }

  function applyCustomRange() {
    setDateFrom(customFromDraft);
    setDateTo(customToDraft);
    setPage(1);
  }

  function clearDateFilter() {
    setDatePreset(null);
    setDateFrom('');
    setDateTo('');
    setCustomFromDraft('');
    setCustomToDraft('');
    setPage(1);
  }

  function selectQuestionFilter(id: string) {
    setQuestionId(id);
    setAnswerValue('');
  }

  function clearQuestionFilter() {
    setQuestionId('');
    setAnswerValue('');
    setPage(1);
  }

  function clearAllFilters() {
    setSearchInput('');
    setSearch('');
    clearDateFilter();
    clearQuestionFilter();
  }

  function selectStatusFilter(status: StatusFilter) {
    setStatusFilter(status);
    setPage(1);
  }

  async function openExportModal() {
    setExportModalOpen(true);
    setExportCount(null);
    setExportCountLoading(true);
    try {
      const res = await apiClient.getJobApplications(jobId, { page: 1, limit: 1, ...currentFilterParams() });
      setExportCount(res.success ? res.pagination?.total ?? 0 : 0);
    } catch {
      toast.error('Failed to check applicant count');
      setExportModalOpen(false);
    } finally {
      setExportCountLoading(false);
    }
  }

  function closeExportModal() {
    if (exporting) return;
    setExportModalOpen(false);
    setExportBatch(null);
  }

  async function confirmExport() {
    if (!exportCount) {
      toast.error('No applicants match the current filters');
      return;
    }
    setExporting(true);
    const totalBatches = Math.ceil(exportCount / EXPORT_BATCH_SIZE);
    setExportBatch({ current: 0, total: totalBatches });
    try {
      let combined = '';
      for (let i = 1; i <= totalBatches; i++) {
        setExportBatch({ current: i, total: totalBatches });
        const csv = await apiClient.getJobApplicationsExportBatch(jobId, {
          page: i,
          limit: EXPORT_BATCH_SIZE,
          ...currentFilterParams(),
        });
        if (i === 1) {
          combined = csv;
        } else {
          // Drop the repeated header row (and BOM) from every batch after the first
          const lines = csv.replace(/^﻿/, '').split('\n');
          combined += '\n' + lines.slice(1).join('\n');
        }
      }

      const blob = new Blob([combined], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const slug = (jobTitle || 'job').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      a.href = url;
      a.download = `applicants-${slug}-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`Exported ${exportCount} applicant${exportCount !== 1 ? 's' : ''}`);
      setExportModalOpen(false);
    } catch {
      toast.error('Export failed — please try again');
    } finally {
      setExporting(false);
      setExportBatch(null);
    }
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

  const exportFilterDescriptions: string[] = [];
  if (statusFilter !== 'all') exportFilterDescriptions.push(`Status: ${tabs.find((t) => t.key === statusFilter)?.label}`);
  if (search) exportFilterDescriptions.push(`Search: "${search}"`);
  if (dateFrom || dateTo) exportFilterDescriptions.push(`Applied: ${dateFrom} – ${dateTo}`);
  if (questionId && answerValue) exportFilterDescriptions.push(`${selectedQuestion?.question}: ${answerValue}`);

  return (
    <div>
      <Link href="/employer/jobs" className="btn btn-ghost btn-sm -ml-2 mb-4 inline-flex">
        <ArrowLeft className="w-4 h-4" /> Back to Jobs
      </Link>

      <PageHeader
        title="Applicants"
        description={jobTitle ? `Applications for "${jobTitle}"` : 'Review and manage applicants'}
        action={
          <button onClick={openExportModal} className="btn btn-outline btn-sm">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        }
      />

      {/* Tabs + search + filters */}
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit flex-wrap">
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

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search name or email…"
              className={cn(compactInputClass, 'pl-9 w-56')}
            />
          </div>

          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setFilterOpen((o) => !o)}
              className={cn('btn btn-outline btn-sm h-9', hasAdvancedFilters && 'border-blue-400 text-blue-600 dark:text-blue-400')}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
              {hasAdvancedFilters && (
                <span className="ml-1 w-1.5 h-1.5 rounded-full bg-blue-500" />
              )}
            </button>

            {filterOpen && (
              <div className="absolute right-0 mt-2 w-80 card p-4 shadow-lg z-20 space-y-5">
                {/* Date applied */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Date applied</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {DATE_PRESETS.map((p) => (
                      <button
                        key={p.key}
                        onClick={() => selectDatePreset(p.key)}
                        className={cn(
                          'px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors',
                          datePreset === p.key
                            ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-950 dark:border-blue-700 dark:text-blue-300'
                            : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300'
                        )}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  {datePreset === 'custom' && (
                    <div className="flex items-center gap-2 mt-3">
                      <input
                        type="date"
                        className={cn(compactInputClass, 'min-w-0 flex-1')}
                        value={customFromDraft}
                        onChange={(e) => setCustomFromDraft(e.target.value)}
                      />
                      <span className="text-gray-400 text-sm">–</span>
                      <input
                        type="date"
                        className={cn(compactInputClass, 'min-w-0 flex-1')}
                        value={customToDraft}
                        onChange={(e) => setCustomToDraft(e.target.value)}
                      />
                      <button
                        onClick={applyCustomRange}
                        disabled={!customFromDraft || !customToDraft}
                        className="btn btn-secondary btn-sm h-9 flex-shrink-0"
                      >
                        Apply
                      </button>
                    </div>
                  )}

                  {(dateFrom || dateTo) && (
                    <button onClick={clearDateFilter} className="text-xs text-gray-400 hover:text-gray-600 mt-2">
                      Clear date filter
                    </button>
                  )}
                </div>

                {/* Screening question */}
                {filterableQuestions.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Screening question</h4>
                    <select
                      className={cn(compactInputClass, 'w-full')}
                      value={questionId}
                      onChange={(e) => selectQuestionFilter(e.target.value)}
                    >
                      <option value="">Any question</option>
                      {filterableQuestions.map((q) => (
                        <option key={q._id} value={q._id}>{q.question}</option>
                      ))}
                    </select>

                    {selectedQuestion && (
                      <div className="mt-2">
                        {selectedQuestion.type === 'date' ? (
                          <input
                            type="date"
                            className={cn(compactInputClass, 'w-full')}
                            value={answerValue}
                            onChange={(e) => { setAnswerValue(e.target.value); setPage(1); }}
                          />
                        ) : (
                          <select
                            className={cn(compactInputClass, 'w-full')}
                            value={answerValue}
                            onChange={(e) => { setAnswerValue(e.target.value); setPage(1); }}
                          >
                            <option value="">Select an answer…</option>
                            {(selectedQuestion.options ?? []).map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    )}

                    {questionId && (
                      <button onClick={clearQuestionFilter} className="text-xs text-gray-400 hover:text-gray-600 mt-2">
                        Clear question filter
                      </button>
                    )}
                  </div>
                )}

                {hasAdvancedFilters && (
                  <button onClick={() => { clearDateFilter(); clearQuestionFilter(); }} className="btn btn-ghost btn-sm w-full">
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active filter chips */}
      {(hasAdvancedFilters || search) && (
        <div className="flex items-center gap-1.5 flex-wrap mb-4 -mt-2">
          {search && (
            <span className="inline-flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
              &ldquo;{search}&rdquo;
              <button onClick={() => { setSearchInput(''); setSearch(''); setPage(1); }}><X className="w-3 h-3" /></button>
            </span>
          )}
          {(dateFrom || dateTo) && (
            <span className="inline-flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
              {dateFrom} – {dateTo}
              <button onClick={clearDateFilter}><X className="w-3 h-3" /></button>
            </span>
          )}
          {questionId && answerValue && (
            <span className="inline-flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
              {selectedQuestion?.question}: {answerValue}
              <button onClick={clearQuestionFilter}><X className="w-3 h-3" /></button>
            </span>
          )}
          <button onClick={clearAllFilters} className="text-xs text-blue-600 dark:text-blue-400 hover:underline ml-1">
            Clear all
          </button>
        </div>
      )}

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

      {/* Export confirmation */}
      <ConfirmModal
        open={exportModalOpen}
        title="Export applicants"
        variant="info"
        confirmLabel={exportCount ? `Export ${exportCount}` : 'Export'}
        cancelLabel="Cancel"
        loading={exportCountLoading || exporting}
        onConfirm={confirmExport}
        onCancel={closeExportModal}
      >
        <div className="space-y-3 text-sm">
          {exportCountLoading ? (
            <div className="flex items-center justify-center gap-2 text-gray-500 py-2">
              <Spinner size="sm" /> Calculating…
            </div>
          ) : (
            <>
              {exportFilterDescriptions.length > 0 ? (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Active filters</p>
                  {exportFilterDescriptions.map((d, i) => (
                    <p key={i} className="text-gray-600 dark:text-gray-300">{d}</p>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center">No filters applied — exporting all applicants.</p>
              )}

              {exportCount === 0 ? (
                <p className="text-amber-600 dark:text-amber-400 text-center font-medium">
                  No applicants match these filters.
                </p>
              ) : (
                <p className="text-center text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">{exportCount}</span> applicant{exportCount !== 1 ? 's' : ''} will be exported.
                </p>
              )}

              {!!exportCount && exportCount > EXPORT_BATCH_SIZE && (
                <p className="text-xs text-gray-400 text-center">
                  Downloaded in {Math.ceil(exportCount / EXPORT_BATCH_SIZE)} batches of up to {EXPORT_BATCH_SIZE.toLocaleString()} and combined into a single CSV.
                </p>
              )}

              {exporting && exportBatch && exportBatch.total > 1 && (
                <div className="flex items-center justify-center gap-2 text-gray-500">
                  <Spinner size="sm" /> Downloading batch {exportBatch.current} of {exportBatch.total}…
                </div>
              )}
            </>
          )}
        </div>
      </ConfirmModal>

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
                  Applied {formatDateTime(selected.appliedAt)}
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
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors group"
                  >
                    <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <span className="flex-1 text-sm font-medium text-gray-900 dark:text-white">Download Resume</span>
                    <Download className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
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
