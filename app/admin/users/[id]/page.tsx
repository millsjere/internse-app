'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Phone, Calendar, Briefcase, GraduationCap, ShieldOff, ShieldCheck, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import toast from 'react-hot-toast';

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
    if (!confirm('Delete this user? This cannot be undone.')) return;
    try {
      await adminApi.deleteUser(id);
      toast.success('User deleted');
      router.push('/admin/users');
    } catch {
      toast.error('Delete failed');
    }
  }

  if (loading) {
    return <div className="h-64 flex items-center justify-center"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!user) return <p className="text-gray-400">User not found.</p>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user.firstname} {user.lastname}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">User profile</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-2xl font-bold">
              {user.firstname?.[0]}{user.lastname?.[0]}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{user.firstname} {user.lastname}</h2>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                  <Mail className="w-3.5 h-3.5" />{user.email}
                </div>
                {user.phone && (
                  <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                    <Phone className="w-3.5 h-3.5" />{user.phone}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${user.verified ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                  {user.verified ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  {user.verified ? 'Verified' : 'Unverified'}
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${user.suspended ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'}`}>
                  {user.suspended ? 'Suspended' : 'Active'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSuspend}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${user.suspended ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40' : 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/40'}`}
            >
              {user.suspended ? <ShieldCheck className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
              {user.suspended ? 'Activate' : 'Suspend'}
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
            >
              <Trash2 className="w-4 h-4" />Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
          <Stat label="Applications" value={user.applicationCount ?? 0} icon={<Briefcase className="w-4 h-4" />} />
          <Stat label="Experience" value={`${user.experience?.length ?? 0} entries`} icon={<Briefcase className="w-4 h-4" />} />
          <Stat label="Education" value={`${user.education?.length ?? 0} entries`} icon={<GraduationCap className="w-4 h-4" />} />
          <Stat label="Joined" value={new Date(user.createdAt).toLocaleDateString()} icon={<Calendar className="w-4 h-4" />} />
        </div>
      </div>

      {user.experience?.length > 0 && (
        <Section title="Experience">
          {user.experience.map((exp: any, i: number) => (
            <div key={i} className="py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
              <p className="font-medium text-gray-900 dark:text-white">{exp.position}</p>
              <p className="text-sm text-gray-500">{exp.company} · {exp.startDate ? new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''} – {exp.currentlyWorking || !exp.endDate ? 'Present' : new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
            </div>
          ))}
        </Section>
      )}

      {user.education?.length > 0 && (
        <Section title="Education">
          {user.education.map((edu: any, i: number) => (
            <div key={i} className="py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
              <p className="font-medium text-gray-900 dark:text-white">{edu.school}</p>
              <p className="text-sm text-gray-500">{edu.degree} in {edu.field} · {edu.startDate ? new Date(edu.startDate).getFullYear() : ''} – {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present'}</p>
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{title}</h3>
      {children}
    </div>
  );
}
