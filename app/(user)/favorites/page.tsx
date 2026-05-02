'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { PageHeader } from '@/app/components/ui/PageHeader';
import { EmptyState } from '@/app/components/ui/EmptyState';
import { Spinner } from '@/app/components/ui/Spinner';
import { Badge } from '@/app/components/ui/Badge';
import { formatRelativeDate, formatSalary } from '@/lib/utils';
import { IFavourite } from '@/types';
import toast from 'react-hot-toast';
import { Heart, MapPin, Briefcase, ExternalLink, Bookmark } from 'lucide-react';
import Link from 'next/link';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<IFavourite[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.getUserFavourites();
      if (res.success && Array.isArray(res.data)) setFavorites(res.data);
    } catch {
      toast.error('Failed to load saved jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleRemove(jobId: string, favId: string) {
    setRemovingId(favId);
    try {
      const res = await apiClient.toggleFavourite(jobId);
      if (res.success) {
        setFavorites((prev) => prev.filter((f) => f._id !== favId));
        toast.success('Removed from saved jobs');
      } else {
        toast.error('Failed to remove');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Saved Jobs"
        description={favorites.length > 0 ? `${favorites.length} saved job${favorites.length !== 1 ? 's' : ''}` : 'Jobs you saved for later'}
        action={
          <Link href="/browse" className="btn btn-outline">
            <Briefcase className="w-4 h-4" /> Browse Jobs
          </Link>
        }
      />

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" className="text-blue-500" />
        </div>
      ) : favorites.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Bookmark}
            title="No saved jobs yet"
            description="Save jobs you're interested in so you can apply later."
            action={
              <Link href="/browse" className="btn btn-primary btn-sm">
                <Briefcase className="w-3.5 h-3.5" /> Browse Jobs
              </Link>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {favorites.map((fav) => {
            const job = fav.job;
            return (
              <div key={fav._id} className="card">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-0.5">{job.title}</h3>
                    <p className="text-sm text-gray-500">{(job.company as any)?.companyName ?? ''}</p>
                  </div>
                  <button
                    onClick={() => handleRemove(job._id, fav._id)}
                    disabled={removingId === fav._id}
                    className="btn btn-ghost btn-icon text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 flex-shrink-0"
                  >
                    {removingId === fav._id ? <Spinner size="sm" /> : <Heart className="w-4 h-4 fill-current" />}
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {job.jobType && <Badge variant="blue">{job.jobType.replace('-', ' ')}</Badge>}
                  {job.level && <Badge variant="gray" className="capitalize">{job.level}-level</Badge>}
                  {job.remote && <Badge variant="green">Remote</Badge>}
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400 mb-4">
                  {job.location && (
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                  )}
                  {(job.salary?.min || job.salary?.max) && (
                    <span>{formatSalary(job.salary?.min, job.salary?.max, job.salary?.currency)}</span>
                  )}
                  <span>Saved {formatRelativeDate(fav.createdAt)}</span>
                </div>

                <div className="flex gap-2">
                  <Link href={`/jobs/${job.slug}`} className="btn btn-primary btn-sm flex-1">Apply Now</Link>
                  <Link href={`/jobs/${job.slug}`} className="btn btn-ghost btn-icon btn-sm">
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
