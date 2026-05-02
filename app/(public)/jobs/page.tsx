'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import {
  Search, MapPin, Clock, ChevronRight, SlidersHorizontal,
  X, Building2, Briefcase, Users, TrendingUp, Zap,
  LayoutList, LayoutGrid, Eye,
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { JOB_INDUSTRIES } from '@/lib/constants';

interface Job {
  _id: string;
  slug: string;
  title: string;
  description: string;
  jobType: string;
  level: string;
  location?: string;
  remote: boolean;
  salary?: { min?: number; max?: number; currency?: string };
  tags: string[];
  industry: string;
  views: number;
  createdAt: string;
  company: {
    _id: string;
    companyName: string;
    logo?: string;
    industry?: string;
  };
}

const JOB_TYPES = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Hybrid'];
const LEVELS = ['Entry', 'Mid', 'Senior'];

const TYPE_COLORS: Record<string, string> = {
  Internship: 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900',
  Hybrid:     'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900',
  'Full-time':'bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400 border-violet-100 dark:border-violet-900',
  'Part-time':'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900',
  Contract:   'bg-pink-50 dark:bg-pink-950 text-pink-600 dark:text-pink-400 border-pink-100 dark:border-pink-900',
  default:    'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700',
};

const AVATAR_COLORS = [
  'from-violet-500 to-purple-600',
  'from-pink-500 to-rose-600',
  'from-orange-500 to-amber-600',
  'from-emerald-500 to-green-600',
  'from-blue-500 to-indigo-600',
  'from-cyan-500 to-teal-600',
];

function formatSalary(salary?: Job['salary']): string | null {
  if (!salary || (!salary.min && !salary.max)) return null;
  const sym = salary.currency === 'NGN' ? '₦' : salary.currency === 'EUR' ? '€' : salary.currency === 'GBP' ? '£' : '$';
  const fmt = (n: number) => n >= 1000 ? `${sym}${(n / 1000).toFixed(0)}k` : `${sym}${n}`;
  if (salary.min && salary.max) return `${fmt(salary.min)} – ${fmt(salary.max)}/yr`;
  if (salary.min) return `From ${fmt(salary.min)}/yr`;
  return `Up to ${fmt(salary.max!)}/yr`;
}

function daysAgo(date: string) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return '1d ago';
  return `${diff}d ago`;
}

function CompanyAvatar({ logo, name, color }: { logo?: string; name: string; color: string }) {
  if (logo) {
    return <img src={logo} alt={name} className="w-14 h-14 rounded-2xl object-cover shadow-md flex-shrink-0 bg-gray-100 dark:bg-gray-800" />;
  }
  return (
    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0 shadow-md text-white font-bold text-xl`}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function JobCard({ job, colorIndex, view = 'grid' }: { job: Job; colorIndex: number; view?: 'list' | 'grid' }) {
  const salary = formatSalary(job.salary);
  const typeColor = TYPE_COLORS[job.jobType] ?? TYPE_COLORS.default;
  const color = AVATAR_COLORS[colorIndex % AVATAR_COLORS.length];

  if (view === 'grid') {
    return (
      <Link
        href={`/jobs/${job.slug}`}
        className="group flex flex-col bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-xl dark:hover:shadow-blue-900/20 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
      >
        <div className={`h-1 w-full bg-gradient-to-r ${color}`} />
        <div className="p-5 flex flex-col flex-1">
          {/* Header: avatar + chevron */}
          <div className="flex items-start justify-between mb-4">
            <CompanyAvatar logo={job.company?.logo} name={job.company?.companyName ?? 'C'} color={color} />
            <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-blue-400 transition-colors mt-1" />
          </div>

          {/* Title + company */}
          <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug text-base mb-0.5">
            {job.title}
          </h3>
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">{job.company?.companyName}</p>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${typeColor}`}>
              {job.jobType}
            </span>
            {job.remote && (
              <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900">
                Remote
              </span>
            )}
            <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-100 dark:border-gray-700">
              {job.level} Level
            </span>
          </div>

          {/* Footer: location + salary */}
          <div className="mt-auto pt-3 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between gap-2">
            <div className="flex flex-col gap-1 min-w-0">
              {job.location && (
                <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 truncate">
                  <MapPin className="w-3 h-3 flex-shrink-0" /> {job.location}
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                <Clock className="w-3 h-3" /> {daysAgo(job.createdAt)}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                <Eye className="w-3 h-3" /> {job.views ?? 0} views
              </span>
            </div>
            {salary && (
              <span className="text-xs font-bold text-gray-900 dark:text-white flex-shrink-0 bg-gray-50 dark:bg-gray-800 px-2.5 py-1 rounded-lg">
                {salary}
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/jobs/${job.slug}`}
      className="group block bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-xl dark:hover:shadow-blue-900/20 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
    >
      <div className={`h-1 w-full bg-gradient-to-r ${color}`} />
      <div className="p-6">
        <div className="flex items-start gap-4">
          <CompanyAvatar logo={job.company?.logo} name={job.company?.companyName ?? 'C'} color={color} />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-0.5">
              <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug text-lg">
                {job.title}
              </h3>
              <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-blue-400 flex-shrink-0 mt-1 transition-colors" />
            </div>
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">{job.company?.companyName}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${typeColor}`}>
                {job.jobType}
              </span>
              {job.remote && (
                <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900">
                  Remote
                </span>
              )}
              <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-100 dark:border-gray-700">
                {job.level} Level
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-3">
                {job.location && (
                  <span className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                    <MapPin className="w-3.5 h-3.5" /> {job.location}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-sm text-gray-400 dark:text-gray-500">
                  <Clock className="w-3.5 h-3.5" /> {daysAgo(job.createdAt)}
                </span>
                <span className="inline-flex items-center gap-1 text-sm text-gray-400 dark:text-gray-500">
                  <Eye className="w-3.5 h-3.5" /> {job.views ?? 0} views
                </span>
              </div>
              {salary && (
                <span className="text-sm font-bold text-gray-900 dark:text-white flex-shrink-0 bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-lg">
                  {salary}
                </span>
              )}
            </div>
          </div>
        </div>
        {job.tags && job.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-gray-50 dark:border-gray-800">
            {job.tags.slice(0, 5).map((tag) => (
              <span key={tag} className="text-xs bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-700 px-2 py-0.5 rounded-md font-medium">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

function FilterPanel({ selectedTypes, selectedLevels, selectedIndustry, remoteOnly, hasFilters, toggleType, toggleLevel, setSelectedIndustry, setRemoteOnly, clearFilters }: any) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <h3 className="font-bold text-gray-900 dark:text-white">Filters</h3>
        {hasFilters && (
          <button onClick={clearFilters} className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300">
            Clear all
          </button>
        )}
      </div>

      <div className="p-5 space-y-6">
        <div>
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Job Type</p>
          <div className="space-y-2.5">
            {JOB_TYPES.map((type) => (
              <label key={type} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(type)}
                  onChange={() => toggleType(type)}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-800"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">{type}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="h-px bg-gray-100 dark:bg-gray-800" />

        <div>
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Experience Level</p>
          <div className="space-y-2.5">
            {LEVELS.map((level) => (
              <label key={level} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedLevels.includes(level)}
                  onChange={() => toggleLevel(level)}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-800"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">{level} Level</span>
              </label>
            ))}
          </div>
        </div>

        <div className="h-px bg-gray-100 dark:bg-gray-800" />

        <div>
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Industry</p>
          <div className="space-y-2.5">
            {JOB_INDUSTRIES.map((ind) => (
              <label key={ind} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="industry"
                  checked={selectedIndustry === ind}
                  onChange={() => setSelectedIndustry((prev: string) => prev === ind ? '' : ind)}
                  onClick={() => { if (selectedIndustry === ind) setSelectedIndustry(''); }}
                  className="w-4 h-4 border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-800"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">{ind}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="h-px bg-gray-100 dark:bg-gray-800" />

        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={remoteOnly}
            onChange={(e) => setRemoteOnly(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-800"
          />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">Remote only</span>
        </label>
      </div>
    </div>
  );
}

function JobsContent() {
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('q') ?? '');
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState(searchParams.get('industry') ?? '');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search input — 350 ms
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search]);

  // Re-fetch from API whenever server-side filters change
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const filters: Record<string, string> = {};
      if (debouncedSearch) filters.search = debouncedSearch;
      if (selectedIndustry) filters.industry = selectedIndustry;
      // API accepts a single jobType; if multiple selected, filter client-side after
      if (selectedTypes.length === 1) filters.jobType = selectedTypes[0];
      if (selectedLevels.length === 1) filters.level = selectedLevels[0];

      const res = await apiClient.getJobs(1, 100, filters);
      if (res.success && res.data?.jobs) {
        setJobs(res.data.jobs);
        setTotal(res.data.total ?? res.data.jobs.length);
      }
    } catch {
      // empty state handles it
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedTypes, selectedLevels, selectedIndustry]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  // Client-side pass for multi-select and remoteOnly (not supported server-side)
  const filtered = jobs.filter((job) => {
    if (selectedTypes.length > 1 && !selectedTypes.includes(job.jobType)) return false;
    if (selectedLevels.length > 1 && !selectedLevels.includes(job.level)) return false;
    if (remoteOnly && !job.remote) return false;
    return true;
  });

  const toggleType = (t: string) => setSelectedTypes((p) => p.includes(t) ? p.filter((x) => x !== t) : [...p, t]);
  const toggleLevel = (l: string) => setSelectedLevels((p) => p.includes(l) ? p.filter((x) => x !== l) : [...p, l]);
  const clearFilters = () => { setSelectedTypes([]); setSelectedLevels([]); setSelectedIndustry(''); setRemoteOnly(false); };
  const hasFilters = selectedTypes.length > 0 || selectedLevels.length > 0 || !!selectedIndustry || remoteOnly;
  const activeFilterCount = selectedTypes.length + selectedLevels.length + (selectedIndustry ? 1 : 0) + (remoteOnly ? 1 : 0);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <Image src="/images/hero/hero-2.jpg" alt="Find jobs" fill className="object-cover object-center" priority sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/85 via-blue-800/70 to-indigo-900/60" />

        <div className="relative z-10 max-w-screen-2xl mx-auto px-4 sm:px-8 lg:px-16">
          {/* Stats row */}
          {/* <div className="flex flex-wrap gap-6 mb-10">
            {[
              { icon: Briefcase, label: `${loading ? '...' : jobs.length + '+'}`, desc: 'Open Roles' },
              { icon: Building2, label: '500+', desc: 'Companies' },
              { icon: Users, label: '50k+', desc: 'Job Seekers' },
              { icon: TrendingUp, label: '95%', desc: 'Success Rate' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={desc} className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2.5">
                <Icon className="w-4 h-4 text-blue-300" />
                <span className="font-bold text-white">{label}</span>
                <span className="text-blue-200 text-sm">{desc}</span>
              </div>
            ))}
          </div> */}

          <h1 className="text-5xl sm:text-6xl font-extrabold text-white mb-4 leading-tight max-w-2xl">
            Find Your Perfect Opportunity
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-xl">
            Browse thousands of internship and job opportunities from top companies, updated daily.
          </p>

          {/* Search bar */}
          <div className="max-w-2xl relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by role, company, or skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-12 py-4 rounded-2xl text-gray-900 dark:text-white dark:bg-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-2xl text-base"
            />
            {search ? (
              <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            ) : (
              <Zap className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400 pointer-events-none" />
            )}
          </div>

          {/* Quick filter pills */}
          <div className="flex flex-wrap gap-2 mt-5">
            {JOB_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                  selectedTypes.includes(type)
                    ? 'bg-white text-blue-700 border-white shadow-md'
                    : 'bg-white/10 text-white border-white/25 hover:bg-white/20'
                }`}
              >
                {type}
              </button>
            ))}
            <button
              onClick={() => setRemoteOnly((v) => !v)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                remoteOnly
                  ? 'bg-white text-blue-700 border-white shadow-md'
                  : 'bg-white/10 text-white border-white/25 hover:bg-white/20'
              }`}
            >
              Remote only
            </button>
          </div>
        </div>
      </section>

      {/* ── Content ──────────────────────────────────── */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 lg:px-16 py-10">

        {/* Mobile filter toggle */}
        <div className="flex items-center justify-between mb-6 lg:hidden">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
            <span className="text-gray-900 dark:text-white font-bold">{filtered.length}</span> jobs found
          </p>
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-sm"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {hasFilters && (
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {sidebarOpen && (
          <div className="lg:hidden mb-6">
            <FilterPanel {...{ selectedTypes, selectedLevels, selectedIndustry, remoteOnly, hasFilters, toggleType, toggleLevel, setSelectedIndustry, setRemoteOnly, clearFilters }} />
          </div>
        )}

        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <FilterPanel {...{ selectedTypes, selectedLevels, selectedIndustry, remoteOnly, hasFilters, toggleType, toggleLevel, setSelectedIndustry, setRemoteOnly, clearFilters }} />
            </div>
          </aside>

          {/* Job list */}
          <div className="flex-1 min-w-0">
            {/* Results bar */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
              <div>
                <p className="font-bold text-gray-900 dark:text-white">
                  {filtered.length} <span className="font-normal text-gray-500 dark:text-gray-400">Jobs found</span>
                </p>
                {hasFilters && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {selectedTypes.map((t) => (
                      <span key={t} className="inline-flex items-center gap-1 text-xs bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900 px-2.5 py-1 rounded-full font-medium">
                        {t}
                        <button onClick={() => toggleType(t)}><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                    {selectedLevels.map((l) => (
                      <span key={l} className="inline-flex items-center gap-1 text-xs bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900 px-2.5 py-1 rounded-full font-medium">
                        {l}
                        <button onClick={() => toggleLevel(l)}><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                    {selectedIndustry && (
                      <span className="inline-flex items-center gap-1 text-xs bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900 px-2.5 py-1 rounded-full font-medium">
                        {selectedIndustry}
                        <button onClick={() => setSelectedIndustry('')}><X className="w-3 h-3" /></button>
                      </span>
                    )}
                    {remoteOnly && (
                      <span className="inline-flex items-center gap-1 text-xs bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900 px-2.5 py-1 rounded-full font-medium">
                        Remote
                        <button onClick={() => setRemoteOnly(false)}><X className="w-3 h-3" /></button>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* View toggle */}
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl flex-shrink-0">
                <button
                  onClick={() => setViewMode('list')}
                  title="List view"
                  className={`p-1.5 rounded-lg transition-all ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <LayoutList className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  title="Grid view"
                  className={`p-1.5 rounded-lg transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Loading skeletons */}
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 animate-pulse">
                    <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 rounded mb-6" />
                    <div className="flex gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                      <div className="flex-1 space-y-3">
                        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                        <div className="flex gap-2">
                          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20" />
                          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            ) : filtered.length === 0 ? (
              <div className="text-center py-24 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-5">
                  <Building2 className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {jobs.length === 0 ? 'No jobs posted yet' : 'No jobs match your filters'}
                </p>
                <p className="text-gray-500 dark:text-gray-400 mb-5 text-sm">
                  {jobs.length === 0 ? 'New opportunities are posted daily — check back soon.' : 'Try broadening your search or removing some filters.'}
                </p>
                {hasFilters && (
                  <button onClick={clearFilters} className="px-5 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors">
                    Clear all filters
                  </button>
                )}
              </div>

            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'space-y-4'}>
                {filtered.map((job, i) => (
                  <JobCard key={job._id} job={job} colorIndex={i} view={viewMode} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense>
      <JobsContent />
    </Suspense>
  );
}
