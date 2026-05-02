'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Mail, Globe, MapPin, Calendar, Briefcase, CreditCard,
  ShieldOff, ShieldCheck, Trash2, BadgeCheck, CheckCircle, XCircle,
  ExternalLink, Building2, AlertTriangle, Receipt,
} from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import toast from 'react-hot-toast';

const PLAN_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  starter: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-300', dot: 'bg-gray-400' },
  growth:  { bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', dot: 'bg-blue-500' },
  enterprise: { bg: 'bg-violet-50 dark:bg-violet-900/30', text: 'text-violet-600 dark:text-violet-400', dot: 'bg-violet-500' },
  free:    { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-500 dark:text-gray-400', dot: 'bg-gray-400' },
};

const STATUS_COLORS: Record<string, string> = {
  published: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  draft: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
  closed: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  expired: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
};

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

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
    try {
      await adminApi.deleteCompany(id);
      toast.success('Company deleted');
      router.push('/admin/companies');
    } catch { toast.error('Delete failed'); }
  }

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!company) return <p className="text-gray-400">Company not found.</p>;

  const planType = company.paymentPlan?.planType ?? company.paymentPlan ?? 'free';
  const planStyle = PLAN_STYLES[planType] || PLAN_STYLES.free;

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Back nav */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Companies
      </button>

      {/* Hero card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
        <div className="bg-gradient-to-r from-violet-500/15 via-purple-500/8 to-transparent dark:from-violet-500/10 dark:via-purple-500/5 rounded-t-2xl px-6 py-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            {/* Avatar + info */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-md flex-shrink-0">
                {company.companyName?.[0]?.toUpperCase()}
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{company.companyName}</h1>
                <div className="flex flex-wrap items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <Mail className="w-3 h-3" />{company.email}
                  </span>
                  {company.website && (
                    <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Globe className="w-3 h-3" />{company.website}
                    </span>
                  )}
                  {(company.city || company.address) && (
                    <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <MapPin className="w-3 h-3" />{[company.city, company.address].filter(Boolean).join(', ')}
                    </span>
                  )}
                </div>
                {/* Status badges */}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${planStyle.bg} ${planStyle.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${planStyle.dot}`} />
                    {planType.charAt(0).toUpperCase() + planType.slice(1)} Plan
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    company.verified
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                  }`}>
                    {company.verified ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {company.verified ? 'Verified' : 'Unverified'}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    company.suspended
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400'
                      : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${company.suspended ? 'bg-red-500' : 'bg-emerald-500'}`} />
                    {company.suspended ? 'Suspended' : 'Active'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {!company.verified && (
                <button
                  onClick={handleVerify}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 transition-colors"
                >
                  <BadgeCheck className="w-3.5 h-3.5" />Verify
                </button>
              )}
              <button
                onClick={handleSuspend}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                  company.suspended
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border-emerald-200 dark:border-emerald-800'
                    : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 border-amber-200 dark:border-amber-800'
                }`}
              >
                {company.suspended ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldOff className="w-3.5 h-3.5" />}
                {company.suspended ? 'Activate' : 'Suspend'}
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
        <StatCard
          icon={<Briefcase className="w-4 h-4" />}
          color="violet"
          label="Total Jobs"
          value={company.jobs?.length ?? 0}
        />
        <StatCard
          icon={<CreditCard className="w-4 h-4" />}
          color="blue"
          label="Credits"
          value={company.paymentPlan?.credits ?? company.credits ?? 0}
        />
        <StatCard
          icon={<Building2 className="w-4 h-4" />}
          color="amber"
          label="Industry"
          value={company.industry || '—'}
          small
        />
        <StatCard
          icon={<Calendar className="w-4 h-4" />}
          color="gray"
          label="Joined"
          value={new Date(company.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          small
        />
      </div>

      {/* Jobs section */}
      {company.jobs?.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Jobs <span className="text-gray-400 font-normal">({company.jobs.length})</span>
            </h3>
            <Link
              href={`/admin/jobs?company=${company._id}`}
              className="text-xs text-violet-600 dark:text-violet-400 hover:underline inline-flex items-center gap-1"
            >
              View all <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {company.jobs.map((job: any) => (
              <Link
                key={job._id}
                href={`/admin/jobs/${job._id}`}
                className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors group"
              >
                <div className="w-7 h-7 rounded-lg bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                    {job.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {job.location} · {new Date(job.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold capitalize flex-shrink-0 ${STATUS_COLORS[job.status] || STATUS_COLORS.draft}`}>
                  {job.status}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Billing / Payments */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
            <Receipt className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Billing &amp; Payments
            {company.payments?.length > 0 && (
              <span className="ml-1.5 text-gray-400 font-normal">({company.payments.length})</span>
            )}
          </h3>
        </div>

        {!company.payments?.length ? (
          <p className="px-5 py-8 text-sm text-center text-gray-400 dark:text-gray-500">No payment records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50 dark:border-gray-800">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 dark:text-gray-500">Invoice</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 dark:text-gray-500">Plan</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 dark:text-gray-500">Cycle</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 dark:text-gray-500">Amount</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 dark:text-gray-500">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 dark:text-gray-500">Period</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 dark:text-gray-500">Paid</th>
                </tr>
              </thead>
              <tbody>
                {company.payments.map((p: any) => (
                  <tr key={p._id} className="border-b border-gray-50 dark:border-gray-800/50 last:border-0 hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">{p.invoiceNumber}</td>
                    <td className="px-5 py-3 text-gray-700 dark:text-gray-300 capitalize">{p.planDisplayName || p.planType}</td>
                    <td className="px-5 py-3 text-gray-500 dark:text-gray-400 capitalize">{p.billingCycle}</td>
                    <td className="px-5 py-3 text-right font-semibold text-gray-900 dark:text-white">
                      {p.currency} {Number(p.amount).toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        p.status === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                        : p.status === 'failed' ? 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400'
                        : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          p.status === 'success' ? 'bg-emerald-500' : p.status === 'failed' ? 'bg-red-500' : 'bg-amber-500'
                        }`} />
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-400 dark:text-gray-500">
                      {p.periodStart ? new Date(p.periodStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      {p.periodEnd ? ` → ${new Date(p.periodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : ''}
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-400 dark:text-gray-500">
                      {p.paidAt ? new Date(p.paidAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete warning */}
      {confirmDelete && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-200 dark:border-red-800">
          <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-400">
            Deleting <strong>{company.companyName}</strong> will permanently remove all their jobs and applications. This cannot be undone.
          </p>
        </div>
      )}
    </div>
  );
}

const COLOR_MAP = {
  violet: 'bg-violet-50 dark:bg-violet-900/20 text-violet-500 dark:text-violet-400',
  blue:   'bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400',
  amber:  'bg-amber-50 dark:bg-amber-900/20 text-amber-500 dark:text-amber-400',
  gray:   'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
};

function StatCard({
  icon, color, label, value, small,
}: {
  icon: React.ReactNode;
  color: keyof typeof COLOR_MAP;
  label: string;
  value: string | number;
  small?: boolean;
}) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${COLOR_MAP[color]}`}>
        {icon}
      </div>
      <p className={`font-bold text-gray-900 dark:text-white truncate ${small ? 'text-base' : 'text-2xl'}`}>{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}
