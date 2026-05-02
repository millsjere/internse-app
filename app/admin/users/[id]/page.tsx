'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Mail, Phone, Calendar, Briefcase, GraduationCap,
  ShieldOff, ShieldCheck, Trash2, CheckCircle, XCircle, AlertTriangle, User,
} from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import toast from 'react-hot-toast';

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    adminApi.getUserDetail(id)
      .then((res) => setUser(res.data ?? res))
      .catch(() => toast.error('Failed to load user'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSuspend() {
    try {
      if (user.suspended) {
        await adminApi.activateUser(id);
        setUser({ ...user, suspended: false });
        toast.success('User activated');
      } else {
        await adminApi.suspendUser(id);
        setUser({ ...user, suspended: true });
        toast.success('User suspended');
      }
    } catch {
      toast.error('Action failed');
    }
  }

  async function handleDelete() {
    try {
      await adminApi.deleteUser(id);
      toast.success('User deleted');
      router.push('/admin/users');
    } catch {
      toast.error('Delete failed');
    }
  }

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <p className="text-gray-400">User not found.</p>;

  const initials = `${user.firstname?.[0] ?? ''}${user.lastname?.[0] ?? ''}`.toUpperCase();

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Back nav */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Users
      </button>

      {/* Hero card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
        <div className="bg-gradient-to-r from-blue-500/15 via-sky-500/8 to-transparent dark:from-blue-500/10 dark:via-sky-500/5 rounded-t-2xl px-6 py-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            {/* Avatar + info */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-sky-600 flex items-center justify-center text-white text-xl font-bold shadow-md flex-shrink-0">
                {initials || <User className="w-6 h-6" />}
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                  {user.firstname} {user.lastname}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <Mail className="w-3 h-3" />{user.email}
                  </span>
                  {user.phone && (
                    <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Phone className="w-3 h-3" />{user.phone}
                    </span>
                  )}
                </div>
                {/* Status badges */}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    user.verified
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                  }`}>
                    {user.verified ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {user.verified ? 'Verified' : 'Unverified'}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    user.suspended
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400'
                      : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${user.suspended ? 'bg-red-500' : 'bg-emerald-500'}`} />
                    {user.suspended ? 'Suspended' : 'Active'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleSuspend}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                  user.suspended
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border-emerald-200 dark:border-emerald-800'
                    : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 border-amber-200 dark:border-amber-800'
                }`}
              >
                {user.suspended ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldOff className="w-3.5 h-3.5" />}
                {user.suspended ? 'Activate' : 'Suspend'}
              </button>
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
        <StatCard icon={<Briefcase className="w-4 h-4" />} color="blue" label="Applications" value={user.applicationCount ?? 0} />
        <StatCard icon={<Briefcase className="w-4 h-4" />} color="indigo" label="Experience" value={user.experience?.length ?? 0} />
        <StatCard icon={<GraduationCap className="w-4 h-4" />} color="cyan" label="Education" value={user.education?.length ?? 0} />
        <StatCard
          icon={<Calendar className="w-4 h-4" />}
          color="gray"
          label="Joined"
          value={new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          small
        />
      </div>

      {/* Experience + Education — side by side on desktop */}
      {(user.experience?.length > 0 || user.education?.length > 0) && (
        <div className="grid sm:grid-cols-2 gap-5">
          {user.experience?.length > 0 && (
            <TimelineSection title="Experience" icon={<Briefcase className="w-4 h-4" />} color="blue">
              {user.experience.map((exp: any, i: number) => (
                <TimelineItem
                  key={i}
                  color="blue"
                  primary={exp.position}
                  secondary={exp.company}
                  tertiary={[
                    exp.startDate ? new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : null,
                    exp.currentlyWorking || !exp.endDate ? 'Present' : new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                  ].filter(Boolean).join(' – ')}
                />
              ))}
            </TimelineSection>
          )}

          {user.education?.length > 0 && (
            <TimelineSection title="Education" icon={<GraduationCap className="w-4 h-4" />} color="cyan">
              {user.education.map((edu: any, i: number) => (
                <TimelineItem
                  key={i}
                  color="cyan"
                  primary={edu.school}
                  secondary={`${edu.degree}${edu.field ? ` · ${edu.field}` : ''}`}
                  tertiary={[
                    edu.startDate ? new Date(edu.startDate).getFullYear() : null,
                    edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present',
                  ].filter(Boolean).join(' – ')}
                />
              ))}
            </TimelineSection>
          )}
        </div>
      )}

      {/* Delete warning */}
      {confirmDelete && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-200 dark:border-red-800">
          <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-400">
            Deleting <strong>{user.firstname} {user.lastname}</strong> will permanently remove their account, applications, and favourites. This cannot be undone.
          </p>
        </div>
      )}
    </div>
  );
}

const STAT_COLORS: Record<string, string> = {
  blue:   'bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400',
  indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 dark:text-indigo-400',
  cyan:   'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-500 dark:text-cyan-400',
  gray:   'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
};

const TIMELINE_COLORS: Record<string, { border: string; dot: string }> = {
  blue: { border: 'border-blue-200 dark:border-blue-800', dot: 'bg-blue-500' },
  cyan: { border: 'border-cyan-200 dark:border-cyan-800', dot: 'bg-cyan-500' },
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
      <p className={`font-bold text-gray-900 dark:text-white ${small ? 'text-base' : 'text-2xl'}`}>{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}

function TimelineSection({
  title, icon, color, children,
}: {
  title: string;
  icon: React.ReactNode;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${STAT_COLORS[color as keyof typeof STAT_COLORS]}`}>
          {icon}
        </div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      <div className="space-y-0">{children}</div>
    </div>
  );
}

function TimelineItem({
  color, primary, secondary, tertiary,
}: {
  color: keyof typeof TIMELINE_COLORS;
  primary: string;
  secondary: string;
  tertiary: string;
}) {
  const c = TIMELINE_COLORS[color];
  return (
    <div className={`pl-4 py-3 border-l-2 ${c.border} relative`}>
      <span className={`absolute -left-[5px] top-4 w-2 h-2 rounded-full ${c.dot}`} />
      <p className="text-sm font-medium text-gray-900 dark:text-white">{primary}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{secondary}</p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{tertiary}</p>
    </div>
  );
}
