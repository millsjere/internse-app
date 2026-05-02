'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, Star, StarOff, XCircle, Trash2 } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import toast from 'react-hot-toast';

export default function JobsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [featuredFilter, setFeaturedFilter] = useState<'' | 'true'>('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 15, search: search || undefined };
      if (statusFilter) params.status = statusFilter;
      if (featuredFilter) params.featured = true;
      const res = await adminApi.getJobs(params);
      const d = res.data ?? res;
      setData({ jobs: d.jobs ?? [], total: d.total ?? 0, pages: d.totalPages ?? 1 });
    } catch {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, featuredFilter]);

  useEffect(() => { load(); }, [load]);

  async function handleToggleFeatured(id: string, featured: boolean) {
    try {
      await adminApi.toggleFeatured(id);
      toast.success(featured ? 'Removed from featured' : 'Job featured for 30 days');
      load();
    } catch { toast.error('Action failed'); }
  }

  async function handleClose(id: string) {
    if (!confirm('Force close this job?')) return;
    try {
      await adminApi.forceCloseJob(id);
      toast.success('Job closed');
      load();
    } catch { toast.error('Action failed'); }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await adminApi.deleteJob(id);
      toast.success('Job deleted');
      load();
    } catch { toast.error('Delete failed'); }
  }

  const statusColors: Record<string, string> = {
    published: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    draft: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
    closed: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    expired: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Jobs</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{data?.total ?? '—'} total jobs</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by job title or company…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="closed">Closed</option>
            <option value="expired">Expired</option>
          </select>
          <button
            onClick={() => { setFeaturedFilter(f => f ? '' : 'true'); setPage(1); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${featuredFilter ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            <Star className="w-3.5 h-3.5" />Featured only
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Job Title</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Company</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Featured</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Views</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Apps</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Posted</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50 dark:border-gray-800/50">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-5 py-3.5"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : data?.jobs?.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-12 text-center text-gray-400">No jobs found</td></tr>
              ) : (
                data?.jobs?.map((job: any) => (
                  <tr key={job._id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white max-w-[200px] truncate">{job.title}</td>
                    <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 max-w-[150px] truncate">{job.company?.companyName || '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${statusColors[job.status] || statusColors.draft}`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {job.featured ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
                          <Star className="w-3 h-3" />Featured
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">{job.views ?? 0}</td>
                    <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">{job.applicationCount ?? 0}</td>
                    <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">{new Date(job.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggleFeatured(job._id, job.featured)}
                          title={job.featured ? 'Remove featured' : 'Feature for 30 days'}
                          className={`p-1.5 rounded-lg transition-colors ${job.featured ? 'text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20' : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'}`}
                        >
                          {job.featured ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                        </button>
                        {job.status === 'published' && (
                          <button
                            onClick={() => handleClose(job._id)}
                            title="Force close"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(job._id, job.title)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {data && data.pages > 1 && (
          <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <p className="text-xs text-gray-500">Page {page} of {data.pages}</p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button disabled={page >= data.pages} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
