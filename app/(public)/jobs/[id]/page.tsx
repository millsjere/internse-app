'use client';

import { use, useEffect, useRef, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  MapPin, Clock, Briefcase, Building2,
  Heart, HeartOff, ChevronLeft, Check, ExternalLink, Users, Tag, Eye, X, FileText,
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Spinner } from '@/app/components/ui/Spinner';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

interface JobQuestion {
  _id: string;
  question: string;
  required: boolean;
  type?: 'text' | 'paragraph' | 'single_choice' | 'multi_choice' | 'dropdown' | 'date';
  options?: string[];
  maxLength?: number;
  maxLengthUnit?: 'words' | 'characters';
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

interface Job {
  _id: string;
  slug: string;
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  tags: string[];
  industry: string;
  jobType: string;
  level: string;
  location?: string;
  remote: boolean;
  salary?: { min?: number; max?: number; currency?: string };
  views: number;
  applicationCount: number;
  questions: JobQuestion[];
  createdAt: string;
  company: {
    _id: string;
    companyName: string;
    logo?: string;
    coverPhoto?: string;
    industry?: string;
  };
}

function formatSalary(salary?: Job['salary']): string {
  if (!salary || (!salary.min && !salary.max)) return 'Not specified';
  const sym = salary.currency === 'NGN' ? '₦' : salary.currency === 'EUR' ? '€' : salary.currency === 'GBP' ? '£' : '$';
  const fmt = (n: number) => n >= 1000 ? `${sym}${(n / 1000).toFixed(0)}k` : `${sym}${n}`;
  if (salary.min && salary.max) return `${fmt(salary.min)} – ${fmt(salary.max)}`;
  if (salary.min) return `From ${fmt(salary.min)}`;
  return `Up to ${fmt(salary.max!)}`;
}

function daysAgo(date: string) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return '1 day ago';
  return `${diff} days ago`;
}

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense>
      <JobDetailPageInner params={params} />
    </Suspense>
  );
}

function JobDetailPageInner({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const { user, userType, isAuthenticated, isInitialized } = useAuthStore();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Application / save state (job-seeker only)
  const [hasApplied, setHasApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savingFav, setSavingFav] = useState(false);

  // Apply modal
  const [showModal, setShowModal] = useState(false);
  const [applying, setApplying] = useState(false);
  const [existingResume, setExistingResume] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const autoOpened = useRef(false);
  const viewTracked = useRef(false);

  // Fetch job
  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.getJobById(id);
        if (res.success && res.data) {
          setJob(res.data);
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Track view exactly once per page load (ref guard prevents double-fire in StrictMode)
  useEffect(() => {
    if (viewTracked.current) return;
    viewTracked.current = true;
    apiClient.trackJobView(id).catch(() => {});
  }, [id]);

  // Fetch application/favourite status once auth is ready and user is a job seeker
  useEffect(() => {
    if (!isInitialized || !isAuthenticated || userType !== 'user' || !job) return;
    (async () => {
      try {
        const [appsRes, favsRes] = await Promise.all([
          apiClient.getUserApplications(),
          apiClient.getUserFavourites(),
        ]);
        if (appsRes.success && Array.isArray(appsRes.data)) {
          setHasApplied(appsRes.data.some((a: any) => (a.job?._id ?? a.job) === job._id));
        }
        if (favsRes.success && Array.isArray(favsRes.data)) {
          setIsSaved(favsRes.data.some((f: any) => (f.job?._id ?? f.job) === job._id));
        }
        // Pre-fill resume from profile
        if (user && (user as any).resume) {
          setExistingResume((user as any).resume);
        }
      } catch {
        // ignore — non-critical
      }
    })();
  }, [isInitialized, isAuthenticated, userType, job, user]);

  // Auto-open apply modal when ?apply=1 is in URL
  useEffect(() => {
    if (autoOpened.current) return;
    if (!isInitialized || !job) return;
    if (searchParams.get('apply') === '1' && isAuthenticated && userType === 'user' && !hasApplied) {
      autoOpened.current = true;
      setShowModal(true);
    }
  }, [isInitialized, isAuthenticated, userType, hasApplied, job, searchParams]);

  async function handleToggleFavourite() {
    if (!job) return;
    setSavingFav(true);
    try {
      const res = await apiClient.toggleFavourite(job._id);
      if (res.success) {
        setIsSaved((prev) => !prev);
      }
    } catch {
      toast.error('Failed to update favourites');
    } finally {
      setSavingFav(false);
    }
  }

  function handleResumeFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Only PDF files are allowed');
      } else {
        setResumeFile(file);
      }
    }
    e.target.value = '';
  }

  function handleCheckboxToggle(questionId: string, option: string) {
    setAnswers((prev) => {
      const current = Array.isArray(prev[questionId]) ? (prev[questionId] as string[]) : [];
      const next = current.includes(option) ? current.filter((o) => o !== option) : [...current, option];
      return { ...prev, [questionId]: next };
    });
  }

  async function handleApply() {
    if (!job) return;
    if (!resumeFile && !existingResume) {
      toast.error('Please upload your resume');
      return;
    }
    // Validate required questions and max-length limits
    for (const q of job.questions) {
      const a = answers[q._id];
      const empty = q.type === 'multi_choice' ? !Array.isArray(a) || a.length === 0 : !a || !String(a).trim();
      if (q.required && empty) {
        toast.error(`Please answer: "${q.question}"`);
        return;
      }
      if ((q.type === 'text' || q.type === 'paragraph') && q.maxLength && typeof a === 'string' && a.trim()) {
        const count = q.maxLengthUnit === 'characters' ? a.length : countWords(a);
        if (count > q.maxLength) {
          toast.error(`"${q.question}" exceeds the ${q.maxLength}-${q.maxLengthUnit === 'characters' ? 'character' : 'word'} limit`);
          return;
        }
      }
    }
    setApplying(true);
    try {
      const answersPayload = job.questions.map((q) => ({
        questionId: q._id,
        question: q.question,
        answer: answers[q._id] ?? (q.type === 'multi_choice' ? [] : ''),
      }));
      const formData = new FormData();
      if (resumeFile) {
        formData.append('resume', resumeFile);
      } else {
        formData.append('resumeUrl', existingResume);
      }
      formData.append('coverLetter', coverLetter);
      formData.append('answers', JSON.stringify(answersPayload));
      const res = await apiClient.applyToJob(job._id, formData);
      if (res.success) {
        toast.success('Application submitted!');
        setHasApplied(true);
        setShowModal(false);
        setJob((prev) => prev ? { ...prev, applicationCount: prev.applicationCount + 1 } : prev);
      } else {
        toast.error(res.message || 'Failed to submit application');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Something went wrong');
    } finally {
      setApplying(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <Spinner size="lg" className="text-blue-500" />
      </div>
    );
  }

  if (notFound || !job) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center gap-4">
        <Building2 className="w-16 h-16 text-gray-300 dark:text-gray-600" />
        <p className="text-2xl font-bold text-gray-400 dark:text-gray-500">Job not found</p>
        <Link href="/jobs" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" /> Back to Jobs
        </Link>
      </div>
    );
  }

  const companyName = job.company?.companyName ?? 'Company';
  const loginApplyRedirect = `/login?redirect=/jobs/${id}?apply=1`;
  const loginSaveRedirect = `/login?redirect=/jobs/${id}`;
  const salary = formatSalary(job.salary);
  const coverPhoto = job.company?.coverPhoto;
  const logo = job.company?.logo;

  const isEmployer = isAuthenticated && userType === 'company';
  const isJobSeeker = isAuthenticated && userType === 'user';
  const isGuest = !isAuthenticated;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Back link */}
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors font-medium"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Jobs
        </Link>

        {/* ── Cover + Logo header ── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm mb-6">
          {/* Cover image */}
          <div className="relative h-52 sm:h-64">
            {coverPhoto ? (
              <img src={coverPhoto} alt={companyName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700" />
            )}

            {/* Company logo overlaid bottom-left */}
            <div className="absolute -bottom-6 left-6 sm:left-8">
              {logo ? (
                <img
                  src={logo}
                  alt={companyName}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-4 border-white dark:border-gray-900 shadow-lg bg-white dark:bg-gray-900"
                />
              ) : (
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-4 border-white dark:border-gray-900 shadow-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-extrabold text-xl">
                  {companyName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* Job title & meta */}
          <div className="px-6 sm:px-8 pt-10 pb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-1 leading-tight">
              {job.title}
            </h1>
            <p className="text-base font-semibold text-gray-600 dark:text-gray-400 mb-3">{companyName}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-400 dark:text-gray-500">
              {job.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> {job.location}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> {daysAgo(job.createdAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> {job.applicationCount} applicant{job.applicationCount !== 1 ? 's' : ''}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" /> {job.views} view{job.views !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* ── Two-column body ── */}
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-5">

            {/* Tags row */}
            {(job.tags?.length > 0 || job.remote) && (
              <div className="flex flex-wrap gap-2">
                <span className="badge-blue capitalize">{job.jobType.replace('-', ' ')}</span>
                <span className="badge-gray capitalize">{job.level} Level</span>
                {job.remote && <span className="badge-green">Remote</span>}
                {job.industry && <span className="badge-gray">{job.industry}</span>}
                {job.tags?.map((tag) => (
                  <span key={tag} className="badge-gray">{tag}</span>
                ))}
              </div>
            )}

            {/* About the job */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">About the job</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line text-base">{job.description}</p>
            </div>

            {/* Responsibilities */}
            {job.responsibilities?.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Responsibilities:</h2>
                <ul className="space-y-3">
                  {job.responsibilities.map((r, i) => (
                    <li key={i} className="flex items-start gap-3 text-base text-gray-600 dark:text-gray-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 flex-shrink-0 mt-2" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements */}
            {job.requirements?.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Required qualifications:</h2>
                <ul className="space-y-3">
                  {job.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-3 text-base">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 dark:text-gray-400">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits */}
            {job.benefits?.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Benefits & Perks</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {job.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-center gap-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl px-4 py-2.5">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span className="text-base text-gray-700 dark:text-gray-300 font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Sticky sidebar */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="sticky top-24 space-y-4">

              {/* Location */}
              {job.location && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-5 py-4 flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{job.location}</span>
                </div>
              )}

              {/* Salary card */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                <p className="text-2xl font-extrabold text-gray-900 dark:text-white mb-0.5">{salary}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-5">Avg. salary</p>

                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Details</p>
                <div className="space-y-3">
                  {[
                    { icon: Building2, label: job.industry || 'Not specified', sub: 'Industry' },
                    { icon: Briefcase, label: job.jobType.replace('-', ' '), sub: 'Employment Type' },
                    { icon: Tag, label: job.level + ' Level', sub: 'Job Level' },
                  ].map(({ icon: Icon, label, sub }) => (
                    <div key={sub} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">{label}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons — role-aware */}
              {isEmployer ? (
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900 rounded-2xl p-4 text-center">
                  <p className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-2">You are viewing as an employer.</p>
                  <Link href="/employer/jobs" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline">
                    Manage your jobs →
                  </Link>
                </div>
              ) : isJobSeeker ? (
                <div className="space-y-2.5">
                  {hasApplied ? (
                    <button
                      disabled
                      className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 text-base font-bold text-white bg-emerald-500 rounded-2xl cursor-not-allowed opacity-90"
                    >
                      <Check className="w-5 h-5" /> Applied ✓
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowModal(true)}
                      className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 text-base font-bold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-2xl shadow-md hover:shadow-emerald-200 dark:hover:shadow-emerald-900/30 transition-all duration-200 active:scale-95"
                    >
                      Apply for this opportunity <ExternalLink className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={handleToggleFavourite}
                    disabled={savingFav}
                    className={`w-full inline-flex items-center justify-center gap-2 py-3 px-6 text-sm font-bold border rounded-2xl transition-all duration-200 active:scale-95 ${
                      isSaved
                        ? 'text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950 hover:bg-rose-100 dark:hover:bg-rose-900'
                        : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {savingFav ? (
                      <Spinner size="sm" />
                    ) : isSaved ? (
                      <><HeartOff className="w-4 h-4" /> Unsave</>
                    ) : (
                      <><Heart className="w-4 h-4" /> Save for later</>
                    )}
                  </button>
                </div>
              ) : (
                /* Guest */
                <div className="space-y-2.5">
                  <Link
                    href={loginApplyRedirect}
                    className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 text-base font-bold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-2xl shadow-md hover:shadow-emerald-200 dark:hover:shadow-emerald-900/30 transition-all duration-200 active:scale-95"
                  >
                    Apply for this opportunity <ExternalLink className="w-4 h-4" />
                  </Link>
                  <Link
                    href={loginSaveRedirect}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 text-sm font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl transition-all duration-200 active:scale-95"
                  >
                    <Heart className="w-4 h-4" /> Save for later
                  </Link>
                </div>
              )}

              {/* Company mini-card */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                <div className="flex items-center gap-3 mb-3">
                  {logo ? (
                    <img src={logo} alt={companyName} className="w-10 h-10 rounded-xl object-cover bg-gray-100 dark:bg-gray-800" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold">
                      {companyName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{companyName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{job.company?.industry ?? job.industry}</p>
                  </div>
                </div>
                <Link href="/jobs" className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                  View all jobs at {companyName} →
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ── Apply Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div>
                <h2 className="font-bold text-gray-900 dark:text-white text-lg">Apply for this opportunity</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{job.title} · {companyName}</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-5">
              {/* Resume */}
              <div>
                <label className="label">Resume <span className="text-red-500">*</span></label>
                <input
                  id="apply-resume-upload"
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={handleResumeFileChange}
                />
                {resumeFile ? (
                  <div className="flex items-center justify-between gap-2 p-3 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{resumeFile.name}</span>
                    </div>
                    <button type="button" onClick={() => setResumeFile(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex-shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : existingResume ? (
                  <div className="flex items-center justify-between gap-2 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                    <a
                      href={existingResume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 min-w-0 text-sm font-medium text-gray-900 dark:text-white hover:underline"
                    >
                      <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <span className="truncate">Use uploaded resume</span>
                    </a>
                    <label htmlFor="apply-resume-upload" className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer flex-shrink-0">
                      Replace
                    </label>
                  </div>
                ) : (
                  <label htmlFor="apply-resume-upload" className="cursor-pointer block">
                    <div className="flex items-center justify-center p-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 transition-colors bg-gray-50 dark:bg-gray-800/50">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Click to upload resume (PDF)</span>
                    </div>
                  </label>
                )}
                <p className="text-xs text-gray-400 mt-1">Max 5MB · PDF only</p>
              </div>

              {/* Cover letter */}
              <div>
                <label className="label">Cover Letter <span className="text-xs font-normal text-gray-400">(optional)</span></label>
                <textarea
                  className="input resize-none"
                  rows={4}
                  placeholder="Tell the employer why you're a great fit..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                />
              </div>

              {/* Screening questions */}
              {job.questions?.length > 0 && (
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 border-t border-gray-100 dark:border-gray-800 pt-4">
                    Screening Questions
                  </p>
                  {job.questions.map((q) => (
                    <div key={q._id}>
                      <label className="label">
                        {q.question}
                        {q.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {q.type === 'single_choice' ? (
                        <div className="space-y-2">
                          {q.options?.map((opt) => (
                            <label key={opt} className="flex items-center gap-2.5 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                              <input
                                type="radio"
                                name={`question-${q._id}`}
                                checked={answers[q._id] === opt}
                                onChange={() => setAnswers((prev) => ({ ...prev, [q._id]: opt }))}
                                className="w-4 h-4"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300">{opt}</span>
                            </label>
                          ))}
                        </div>
                      ) : q.type === 'multi_choice' ? (
                        <div className="space-y-2">
                          {q.options?.map((opt) => (
                            <label key={opt} className="flex items-center gap-2.5 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                              <input
                                type="checkbox"
                                checked={Array.isArray(answers[q._id]) && (answers[q._id] as string[]).includes(opt)}
                                onChange={() => handleCheckboxToggle(q._id, opt)}
                                className="w-4 h-4"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300">{opt}</span>
                            </label>
                          ))}
                        </div>
                      ) : q.type === 'dropdown' ? (
                        <select
                          className="input"
                          value={(answers[q._id] as string) ?? ''}
                          onChange={(e) => setAnswers((prev) => ({ ...prev, [q._id]: e.target.value }))}
                        >
                          <option value="">Select an option</option>
                          {q.options?.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : q.type === 'date' ? (
                        <input
                          type="date"
                          className="input"
                          value={(answers[q._id] as string) ?? ''}
                          onChange={(e) => setAnswers((prev) => ({ ...prev, [q._id]: e.target.value }))}
                        />
                      ) : q.type === 'paragraph' ? (
                        <>
                          <textarea
                            className="input resize-none"
                            style={{ minHeight: '120px', overflow: 'hidden' }}
                            rows={1}
                            placeholder="Your answer..."
                            value={(answers[q._id] as string) ?? ''}
                            onChange={(e) => {
                              setAnswers((prev) => ({ ...prev, [q._id]: e.target.value }));
                              e.currentTarget.style.height = 'auto';
                              e.currentTarget.style.height = Math.max(120, e.currentTarget.scrollHeight) + 'px';
                            }}
                            onInput={(e) => {
                              e.currentTarget.style.height = 'auto';
                              e.currentTarget.style.height = Math.max(120, e.currentTarget.scrollHeight) + 'px';
                            }}
                          />
                          {q.maxLength && (() => {
                            const text = (answers[q._id] as string) ?? '';
                            const count = q.maxLengthUnit === 'characters' ? text.length : countWords(text);
                            const over = count > q.maxLength!;
                            return (
                              <p className={`text-xs mt-1 text-right ${over ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                                {count} / {q.maxLength} {q.maxLengthUnit === 'characters' ? 'characters' : 'words'}
                              </p>
                            );
                          })()}
                        </>
                      ) : (
                        <>
                          <textarea
                            className="input resize-none"
                            style={{ minHeight: '80px', overflow: 'hidden' }}
                            rows={1}
                            placeholder="Your answer..."
                            value={(answers[q._id] as string) ?? ''}
                            onChange={(e) => {
                              setAnswers((prev) => ({ ...prev, [q._id]: e.target.value }));
                              e.currentTarget.style.height = 'auto';
                              e.currentTarget.style.height = Math.max(80, e.currentTarget.scrollHeight) + 'px';
                            }}
                            onInput={(e) => {
                              e.currentTarget.style.height = 'auto';
                              e.currentTarget.style.height = Math.max(80, e.currentTarget.scrollHeight) + 'px';
                            }}
                          />
                          {q.maxLength && (() => {
                            const text = (answers[q._id] as string) ?? '';
                            const count = q.maxLengthUnit === 'characters' ? text.length : countWords(text);
                            const over = count > q.maxLength!;
                            return (
                              <p className={`text-xs mt-1 text-right ${over ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                                {count} / {q.maxLength} {q.maxLengthUnit === 'characters' ? 'characters' : 'words'}
                              </p>
                            );
                          })()}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-6 py-4 flex gap-3 rounded-b-2xl">
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-outline flex-1"
                disabled={applying}
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={applying || (!resumeFile && !existingResume) || job.questions.some((q) => {
                  if ((q.type ?? 'text') !== 'text' || !q.maxLength) return false;
                  const text = (answers[q._id] as string) ?? '';
                  const count = q.maxLengthUnit === 'characters' ? text.length : countWords(text);
                  return count > q.maxLength;
                })}
                className="btn btn-primary flex-1"
              >
                {applying ? <Spinner size="sm" /> : 'Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
