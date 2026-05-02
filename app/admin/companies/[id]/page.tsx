'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, Globe, MapPin, Calendar, Briefcase, ShieldOff, ShieldCheck, Trash2, BadgeCheck, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import toast from 'react-hot-toast';

const PLAN_COLORS: Record<string, string> = {
  starter: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
  growth: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  enterprise: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  free: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-500',
};

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getCompanyDetail(id)
      .then((res) => setCompany(res.data ?? res))
      .catch(() => toast.error('Failed to load company'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleVerify() {
    try {
      await adminApi.verifyCompany(id);
      setCompany({ ...company, verified: true });
      toast.success('Company verified');
    } catch { toast.error('Action failed'); }
  }

  async function handleSuspend() {
    try {
      if (company.suspended) {
        await adminApi.activateCompany(id);
        setCompany({ ...company, suspended: false });
        toast.success('Company activated');
      } else {
        await adminApi.suspendCompany(id);
        setCompany({ ...company, suspended: true });
        toast.success('Company suspended');
      }
    } catch { toast.error('Action failed'); }
  }

  async function handleDelete() {
    if (!confirm('Delete this company? This will also delete all their jobs and applications.')) return;
    try {
      await adminApi.deleteCompany(id);
      toast.success('Company deleted');
      router.push('/admin/companies');
    } catch { toast.error('Delete failed'); }
  }

  if (loading) return <div className="h-64 flex items-center justify-center"><div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!company) return <p className="text-gray-400">Company not found.</p>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{company.companyName}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Company profile</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 text-2xl font-bold">
              {company.companyName?.[0]}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{company.companyName}</h2>
              <div className="flex flex-wrap gap-3 mt-1">
                <span className="flex items-center gap-1.5 text-sm text-gray-500"><Mail className="w-3.5 h-3.5" />{company.email}</span>
                {company.website && <span className="flex items-center gap-1.5 text-sm text-gray-500"><Globe className="w-3.5 h-3.5" />{company.website}</span>}
                {(company.city || company.address) && <span className="flex items-center gap-1.5 text-sm text-gray-500"><MapPin className="w-3.5 h-3.5" />{[company.city, company.address].filter(Boolean).join(', ')}</span>}
              </div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${PLAN_COLORS[company.paymentPlan?.planType ?? company.paymentPlan] || PLAN_COLORS.free}`}>
                  {company.paymentPlan?.planType ?? company.paymentPlan ?? 'free'} plan
                </span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${company.verified ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                  {company.verified ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  {company.verified ? 'Verified' : 'Unverified'}
                </span>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${company.suspended ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'}`}>
                  {company.suspended ? 'Suspended' : 'Active'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {!company.verified && (
              <button onClick={handleVerify} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors">
                <BadgeCheck className="w-4 h-4" />Verify
              </button>
            )}
            <button onClick={handleSuspend} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${company.suspended ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40' : 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/40'}`}>
              {company.suspended ? <ShieldCheck className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
              {company.suspended ? 'Activate' : 'Suspend'}
            </button>
            <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
              <Trash2 className="w-4 h-4" />Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
          <Stat label="Total Jobs" value={company.jobs?.length ?? 0} />
          <Stat label="Credits Left" value={company.paymentPlan?.credits ?? company.credits ?? 0} />
          <Stat label="Industry" value={company.industry || '—'} />
          <Stat label="Joined" value={new Date(company.createdAt).toLocaleDateString()} />
        </div>
      </div>

      {company.jobs?.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Jobs ({company.jobs.length})</h3>
          <div className="space-y-0">
            {company.jobs.map((job: any) => (
              <div key={job._id} className="flex items-center gap-3 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                <Briefcase className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{job.title}</p>
                  <p className="text-xs text-gray-400">{job.location} · {new Date(job.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${job.status === 'published' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                  {job.status}
                </span>
                <Link href={`/admin/jobs?company=${company._id}`} className="p-1 text-gray-400 hover:text-blue-500 transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-center">
      <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}
