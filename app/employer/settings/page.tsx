'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api';
import { PageHeader } from '@/app/components/ui/PageHeader';
import { Spinner } from '@/app/components/ui/Spinner';
import { Badge } from '@/app/components/ui/Badge';
import { ThemeToggler } from '@/app/components/ThemeToggler';
import { cn } from '@/lib/utils';
import { PLAN_LIMITS } from '@/lib/planLimits';
import toast from 'react-hot-toast';
import { ICompany } from '@/types';
import { ConfirmModal } from '@/app/components/ui/ConfirmModal';
import {
  Building2, Lock, Users, CreditCard, Save, Eye, EyeOff, Check,
  Zap, Star, Crown, Camera, ImagePlus, X, Receipt, Download, Mail, Send, Trash2,
} from 'lucide-react';

type Tab = 'account' | 'password' | 'teams' | 'subscription' | 'billing';

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$', GBP: '£', EUR: '€', GHS: '₵', NGN: '₦', KES: 'KSh', ZAR: 'R',
};

const PLAN_ICONS = [Zap, Star, Crown, CreditCard];

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function ImageUploader({
  label,
  current,
  preview,
  onSelect,
  onRemove,
  shape = 'square',
}: {
  label: string;
  current?: string;
  preview: string | null;
  onSelect: (file: File) => void;
  onRemove: () => void;
  shape?: 'square' | 'wide';
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const displayed = preview ?? current;

  return (
    <div>
      <p className="label mb-2">{label}</p>
      <div
        className={cn(
          'relative group rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors',
          shape === 'wide' ? 'h-36 w-full' : 'h-24 w-24'
        )}
        onClick={() => inputRef.current?.click()}
      >
        {displayed ? (
          <>
            <img src={displayed} alt={label} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 text-gray-400 dark:text-gray-500">
            <ImagePlus className="w-6 h-6" />
            <span className="text-xs font-medium">Upload</span>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onSelect(f); e.target.value = ''; }}
        />
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
        {shape === 'wide' ? 'Recommended: 1200 × 400px' : 'Recommended: 400 × 400px'}
      </p>
    </div>
  );
}

function EmployerSettingsPage() {
  const { user, setUser } = useAuthStore();
  const company = user as ICompany | null;
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>((searchParams.get('tab') as Tab) ?? 'account');

  const [profile, setProfile] = useState({
    companyName: '', email: '', phone: '', website: '', industry: '',
    companySize: '', address: '', city: '', state: '', country: '', description: '',
    logo: '', coverPhoto: '',
  });

  // In-memory previews (base64 data URLs) before save
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, next: false, confirm: false });
  const [savingPassword, setSavingPassword] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [changingPlan, setChangingPlan] = useState<string | null>(null);
  const [billingHistory, setBillingHistory] = useState<any[]>([]);
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingLoaded, setBillingLoaded] = useState(false);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('recruiter'); // recruiter, admin, etc.
  const [sendingInvite, setSendingInvite] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<any>(null);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);

  // Calculate team seat usage
  const planType = (company?.paymentPlan?.planType || 'starter') as keyof typeof PLAN_LIMITS;
  const seatsAvailable = PLAN_LIMITS[planType]?.teamSeats || 1;
  const isUnlimited = seatsAvailable === -1;
  const acceptedMembers = teamMembers.filter((m) => m.status === 'accepted').length;
  const seatsUsed = acceptedMembers;
  const seatsRemaining = isUnlimited ? Infinity : Math.max(0, seatsAvailable - seatsUsed);
  const isAtCapacity = !isUnlimited && seatsRemaining === 0;

  useEffect(() => {
    apiClient.getPlans()
      .then((res) => setPlans(Array.isArray(res.data) ? res.data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (tab !== 'teams') return;
    apiClient.getTeamMembers()
      .then((res) => { setTeamMembers(Array.isArray(res.data) ? res.data : []); })
      .catch(() => {});
  }, [tab]);

  async function handleRemoveMember() {
    if (!memberToRemove) return;
    setRemovingMemberId(memberToRemove._id);
    try {
      const res = await apiClient.removeTeamMember(memberToRemove._id);
      if (res.success) {
        toast.success('Team member removed');
        setTeamMembers((prev) => prev.filter((m) => m._id !== memberToRemove._id));
      } else {
        toast.error(res.message || 'Failed to remove team member');
      }
    } catch {
      toast.error('Failed to remove team member');
    } finally {
      setRemovingMemberId(null);
      setMemberToRemove(null);
    }
  }

  useEffect(() => {
    if (tab !== 'billing' || billingLoaded) return;
    setBillingLoading(true);
    apiClient.getBillingHistory()
      .then((res) => { setBillingHistory(Array.isArray(res.data) ? res.data : []); setBillingLoaded(true); })
      .catch(() => setBillingLoaded(true))
      .finally(() => setBillingLoading(false));
  }, [tab, billingLoaded]);

  function downloadInvoice(payment: any) {
    const fmt = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const sym = CURRENCY_SYMBOLS[payment.currency] ?? payment.currency;
    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Invoice ${payment.invoiceNumber}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #111; background: #fff; padding: 48px; max-width: 720px; margin: 0 auto; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 48px; }
  .brand { font-size: 24px; font-weight: 900; color: #2563eb; }
  .brand span { color: #111; }
  .invoice-meta { text-align: right; }
  .invoice-meta h1 { font-size: 28px; font-weight: 900; color: #111; letter-spacing: -0.5px; }
  .invoice-meta p { color: #6b7280; font-size: 13px; margin-top: 4px; }
  .divider { border: none; border-top: 2px solid #e5e7eb; margin: 32px 0; }
  .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 40px; }
  .party-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #9ca3af; margin-bottom: 8px; }
  .party-name { font-weight: 700; font-size: 15px; color: #111; }
  .party-sub { font-size: 13px; color: #6b7280; margin-top: 3px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
  thead th { padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #9ca3af; border-bottom: 2px solid #e5e7eb; }
  tbody td { padding: 14px 12px; font-size: 14px; border-bottom: 1px solid #f3f4f6; }
  .amount-col { text-align: right; }
  .total-row td { font-weight: 700; font-size: 15px; border-bottom: none; padding-top: 20px; }
  .badge { display: inline-block; padding: 3px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; background: #dcfce7; color: #166534; }
  .footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 12px; text-align: center; }
  @media print { body { padding: 24px; } }
</style>
</head>
<body>
  <div class="header">
    <div class="brand">intern<span>se</span></div>
    <div class="invoice-meta">
      <h1>Invoice</h1>
      <p>${payment.invoiceNumber}</p>
      <p>Issued: ${fmt(payment.paidAt)}</p>
    </div>
  </div>
  <hr class="divider">
  <div class="parties">
    <div>
      <div class="party-label">From</div>
      <div class="party-name">Internse</div>
      <div class="party-sub">internse.com</div>
    </div>
    <div>
      <div class="party-label">Billed To</div>
      <div class="party-name">${company?.companyName ?? ''}</div>
      <div class="party-sub">${company?.email ?? ''}</div>
    </div>
  </div>
  <table>
    <thead><tr><th>Description</th><th>Period</th><th>Billing</th><th class="amount-col">Amount</th></tr></thead>
    <tbody>
      <tr>
        <td><strong>${payment.planDisplayName}</strong> Plan</td>
        <td>${fmt(payment.periodStart)} – ${fmt(payment.periodEnd)}</td>
        <td style="text-transform:capitalize">${payment.billingCycle}</td>
        <td class="amount-col">${sym}${payment.amount.toLocaleString()}</td>
      </tr>
    </tbody>
    <tfoot>
      <tr class="total-row"><td colspan="3">Total</td><td class="amount-col">${sym}${payment.amount.toLocaleString()}</td></tr>
    </tfoot>
  </table>
  <div style="display:flex;justify-content:space-between;align-items:center">
    <div><span class="badge">✓ Paid</span></div>
    <div style="font-size:12px;color:#6b7280">Reference: ${payment.reference}</div>
  </div>
  <div class="footer">Thank you for your business · Internse · internse.com</div>
  <script>window.print();</script>
</body>
</html>`;
    const win = window.open('', '_blank');
    if (win) { win.document.write(html); win.document.close(); }
  }

  useEffect(() => {
    if (company) {
      setProfile({
        companyName: company.companyName ?? '',
        email: company.email ?? '',
        phone: company.phone ?? '',
        website: company.website ?? '',
        industry: company.industry ?? '',
        companySize: company.companySize ?? '',
        address: company.address ?? '',
        city: company.city ?? '',
        state: company.state ?? '',
        country: company.country ?? '',
        description: company.description ?? '',
        logo: company.logo ?? '',
        coverPhoto: company.coverPhoto ?? '',
      });
    }
  }, [company]);

  async function handleLogoSelect(file: File) {
    try {
      const dataUrl = await readFileAsDataURL(file);
      setLogoPreview(dataUrl);
      setProfile((p) => ({ ...p, logo: dataUrl }));
    } catch {
      toast.error('Failed to read image');
    }
  }

  async function handleCoverSelect(file: File) {
    try {
      const dataUrl = await readFileAsDataURL(file);
      setCoverPreview(dataUrl);
      setProfile((p) => ({ ...p, coverPhoto: dataUrl }));
    } catch {
      toast.error('Failed to read image');
    }
  }

  async function handleSaveProfile() {
    setSavingProfile(true);
    try {
      const { email: _email, ...payload } = profile;
      const res = await apiClient.updateCompanyProfile(payload);
      if (res.success) {
        toast.success('Profile updated');
        setLogoPreview(null);
        setCoverPreview(null);
        if (res.data) setUser(res.data, 'company');
      } else {
        toast.error(res.message || 'Failed to update profile');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword() {
    if (passwords.next !== passwords.confirm) { toast.error('Passwords do not match'); return; }
    if (passwords.next.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setSavingPassword(true);
    try {
      const res = await apiClient.changeCompanyPassword({
        currentPassword: passwords.current,
        newPassword: passwords.next,
        confirmPassword: passwords.confirm,
      });
      if (res.success) {
        toast.success('Password changed successfully');
        setPasswords({ current: '', next: '', confirm: '' });
      } else {
        toast.error(res.message || 'Failed to change password');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleChangePlan(planType: string, isFree: boolean) {
    setChangingPlan(planType);
    try {
      const callbackUrl = `${window.location.origin}/employer/settings/verify`;
      const res = await apiClient.selectPlan(planType, 'monthly', callbackUrl);
      if (!res.success) { toast.error(res.message || 'Failed to change plan'); return; }

      if (isFree) {
        // Downgrade — completes immediately, backend returns full updated company
        if (res.data) setUser(res.data, 'company');
        toast.success('Plan changed successfully');
      } else {
        // Upgrade — redirect to Paystack, come back to settings after
        const { authorizationUrl } = res.data;
        if (authorizationUrl) {
          window.location.href = authorizationUrl;
        } else {
          toast.error('Could not initiate payment');
        }
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setChangingPlan(null);
    }
  }

  async function handleSendInvite() {
    if (!inviteEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }
    if (!inviteEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setSendingInvite(true);
    try {
      const res = await apiClient.sendTeamInvite(inviteEmail, inviteRole);
      if (res.success) {
        toast.success('Invitation sent successfully');
        setInviteEmail('');
        setInviteRole('recruiter');
      } else {
        toast.error(res.message || 'Failed to send invitation');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setSendingInvite(false);
    }
  }

  const currentPlan = company?.paymentPlan?.planType ?? 'starter';

  const tabs: { key: Tab; label: string; icon: typeof Building2 }[] = [
    { key: 'account',      label: 'Account',      icon: Building2 },
    { key: 'password',     label: 'Password',     icon: Lock },
    { key: 'teams',        label: 'Teams',        icon: Users },
    { key: 'subscription', label: 'Subscription', icon: CreditCard },
    { key: 'billing',      label: 'Billing',      icon: Receipt },
  ];

  return (
    <div>
      <PageHeader title="Settings" description="Manage your account and preferences" />

      {/* Tabs */}
      <div className="flex gap-0 border-b border-gray-200 dark:border-gray-800 mb-6 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap -mb-px',
              tab === t.key
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
            )}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      <div>
        {/* ── Account ── */}
        {tab === 'account' && (
          <div className="card space-y-6">

            {/* Cover photo */}
            <div>
              <ImageUploader
                label="Cover Photo"
                current={profile.coverPhoto || undefined}
                preview={coverPreview}
                onSelect={handleCoverSelect}
                onRemove={() => { setCoverPreview(null); setProfile((p) => ({ ...p, coverPhoto: '' })); }}
                shape="wide"
              />
            </div>

            {/* Logo + company info */}
            <div className="flex items-start gap-5 pb-5 border-b border-gray-100 dark:border-gray-800">
              <div className="flex-shrink-0">
                <ImageUploader
                  label="Company Logo"
                  current={profile.logo || undefined}
                  preview={logoPreview}
                  onSelect={handleLogoSelect}
                  onRemove={() => { setLogoPreview(null); setProfile((p) => ({ ...p, logo: '' })); }}
                  shape="square"
                />
              </div>
              <div className="pt-6">
                <h2 className="font-semibold text-gray-900 dark:text-white">{company?.companyName}</h2>
                <p className="text-sm text-gray-500">{company?.email}</p>
                {company?.verified && (
                  <Badge variant="green" className="mt-1.5"><Check className="w-3 h-3" /> Verified</Badge>
                )}
              </div>
            </div>

            {/* Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {([
                { field: 'companyName', label: 'Company Name', type: 'text' },
                { field: 'email',       label: 'Email',         type: 'email', disabled: true },
                { field: 'phone',       label: 'Phone',         type: 'tel' },
                { field: 'website',     label: 'Website',       type: 'url' },
                { field: 'industry',    label: 'Industry',      type: 'text' },
                { field: 'companySize', label: 'Company Size',  type: 'text' },
              ] as const).map(({ field, label, type, disabled }: any) => (
                <div key={field}>
                  <label className="label">{label}</label>
                  <input
                    type={type}
                    className="input"
                    disabled={disabled}
                    value={(profile as any)[field]}
                    onChange={(e) => setProfile((p) => ({ ...p, [field]: e.target.value }))}
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">City</label>
                <input className="input" value={profile.city} onChange={(e) => setProfile((p) => ({ ...p, city: e.target.value }))} />
              </div>
              <div>
                <label className="label">State</label>
                <input className="input" value={profile.state} onChange={(e) => setProfile((p) => ({ ...p, state: e.target.value }))} />
              </div>
              <div>
                <label className="label">Country</label>
                <select className="input" value={profile.country} onChange={(e) => setProfile((p) => ({ ...p, country: e.target.value }))}>
                  <option value="">Select a country</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                  <option value="India">India</option>
                  <option value="Nigeria">Nigeria</option>
                  <option value="Kenya">Kenya</option>
                  <option value="South Africa">South Africa</option>
                  <option value="Ghana">Ghana</option>
                  <option value="Egypt">Egypt</option>
                  <option value="Singapore">Singapore</option>
                  <option value="Japan">Japan</option>
                  <option value="China">China</option>
                  <option value="Brazil">Brazil</option>
                  <option value="Mexico">Mexico</option>
                  <option value="Argentina">Argentina</option>
                  <option value="Spain">Spain</option>
                  <option value="Italy">Italy</option>
                  <option value="Netherlands">Netherlands</option>
                  <option value="Sweden">Sweden</option>
                  <option value="Norway">Norway</option>
                  <option value="Switzerland">Switzerland</option>
                  <option value="New Zealand">New Zealand</option>
                  <option value="Ireland">Ireland</option>
                  <option value="South Korea">South Korea</option>
                  <option value="Malaysia">Malaysia</option>
                  <option value="Pakistan">Pakistan</option>
                  <option value="Bangladesh">Bangladesh</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label">Company Description</label>
              <textarea
                className="input resize-none"
                rows={4}
                value={profile.description}
                onChange={(e) => setProfile((p) => ({ ...p, description: e.target.value }))}
                placeholder="Tell candidates what makes your company great..."
              />
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-gray-800">
              <button onClick={handleSaveProfile} disabled={savingProfile} className="btn btn-primary">
                {savingProfile ? <Spinner size="sm" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* ── Password ── */}
        {tab === 'password' && (
          <div className="card space-y-4">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-2">Change Password</h2>

            {(['current', 'next', 'confirm'] as const).map((f) => {
              const labels = { current: 'Current Password', next: 'New Password', confirm: 'Confirm New Password' };
              return (
                <div key={f}>
                  <label className="label">{labels[f]}</label>
                  <div className="relative">
                    <input
                      type={showPasswords[f] ? 'text' : 'password'}
                      className="input pr-10"
                      value={passwords[f]}
                      onChange={(e) => setPasswords((p) => ({ ...p, [f]: e.target.value }))}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords((p) => ({ ...p, [f]: !p[f] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords[f] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              );
            })}

            <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-gray-800">
              <button onClick={handleChangePassword} disabled={savingPassword} className="btn btn-primary">
                {savingPassword ? <Spinner size="sm" /> : <Lock className="w-4 h-4" />}
                Update Password
              </button>
            </div>
          </div>
        )}

        {/* ── Preferences ── */}
        {tab === 'teams' && (
          <div className="space-y-6">
            {/* Invite Form */}
            <div className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-white mb-1">Invite Team Members</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Send invitations to colleagues to join and manage your company on the platform</p>
                </div>
              </div>

              {/* Seat Usage */}
              <div className="mb-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Team Seat Usage</p>
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                    {isUnlimited ? '∞ Unlimited' : `${seatsUsed} / ${seatsAvailable}`}
                  </p>
                </div>
                <div className="w-full bg-blue-200 dark:bg-blue-900 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      isUnlimited ? 'bg-green-500' :
                      seatsRemaining > 0 ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{ width: isUnlimited ? '100%' : `${Math.min(100, (seatsUsed / seatsAvailable) * 100)}%` }}
                  />
                </div>
                {isAtCapacity && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2 font-medium">🚨 Team seat limit reached. Remove members or upgrade your plan to invite more.</p>
                )}
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="label">Email Address</label>
                    <input
                      type="email"
                      className="input"
                      placeholder="colleague@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label">Role</label>
                    <select
                      className="input"
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                    >
                      <option value="recruiter">Recruiter</option>
                      <option value="admin">Administrator</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </div>
                </div>
                
                <button
                  onClick={handleSendInvite}
                  disabled={sendingInvite || !inviteEmail.trim() || isAtCapacity}
                  title={isAtCapacity ? 'Team seat limit reached' : ''}
                  className="btn btn-primary w-full sm:w-auto flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingInvite ? <Spinner size="sm" /> : <Send className="w-4 h-4" />}
                  {isAtCapacity ? 'Seat Limit Reached' : 'Send Invitation'}
                </button>
              </div>
            </div>

            {/* Team Members List */}
            <div className="card">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Team Members</h2>
              
              {!teamMembers || teamMembers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-400 dark:text-gray-500">No team members yet</p>
                  <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">Start by inviting colleagues above</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {teamMembers.map((member) => (
                    <div key={member._id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{member.fullName || member.email}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{member.email}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Status: {member.status}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="blue">{member.role}</Badge>
                        <button
                          onClick={() => setMemberToRemove(member)}
                          className="p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                          title="Remove member"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Billing ── */}
        {tab === 'billing' && (
          <div className="space-y-4">
            <div className="card">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-white">Billing History</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Download invoices for all your payments</p>
                </div>
              </div>

              {billingLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <div key={i} className="h-14 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />)}
                </div>
              ) : billingHistory.length === 0 ? (
                <div className="text-center py-14">
                  <Receipt className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-400 dark:text-gray-500">No payments yet</p>
                  <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">Your invoices will appear here after your first payment</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Invoice</th>
                        <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Plan</th>
                        <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Date</th>
                        <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Amount</th>
                        <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                        <th className="py-2.5 px-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                      {billingHistory.map((payment) => {
                        const sym = CURRENCY_SYMBOLS[payment.currency] ?? payment.currency;
                        return (
                          <tr key={payment._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <td className="py-3.5 px-3 font-mono text-xs text-gray-500 dark:text-gray-400">{payment.invoiceNumber}</td>
                            <td className="py-3.5 px-3 font-medium text-gray-900 dark:text-white">{payment.planDisplayName}</td>
                            <td className="py-3.5 px-3 text-gray-500 dark:text-gray-400">
                              {new Date(payment.paidAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </td>
                            <td className="py-3.5 px-3 font-semibold text-gray-900 dark:text-white">
                              {sym}{payment.amount.toLocaleString()}
                            </td>
                            <td className="py-3.5 px-3">
                              <span className={cn(
                                'inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full',
                                payment.status === 'success'
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                                  : payment.status === 'pending'
                                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
                                  : 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400'
                              )}>
                                <span className={cn('w-1.5 h-1.5 rounded-full', payment.status === 'success' ? 'bg-emerald-500' : payment.status === 'pending' ? 'bg-amber-500' : 'bg-red-500')} />
                                {payment.status === 'success' ? 'Paid' : payment.status === 'pending' ? 'Pending' : 'Failed'}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 text-right">
                              <button
                                onClick={() => downloadInvoice(payment)}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                              >
                                <Download className="w-3.5 h-3.5" />
                                Invoice
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Subscription ── */}
        {tab === 'subscription' && (() => {
          const anyChanging = changingPlan !== null;
          const paymentPlan = company?.paymentPlan;
          const currentPlanData = plans.find((p) => p.planType === currentPlan);
          const isUnlimited = (currentPlanData?.credits ?? 0) === -1;
          const creditsUsed = paymentPlan?.used ?? 0;
          const creditsTotal = paymentPlan?.credits ?? currentPlanData?.credits ?? 0;
          const creditsRemaining = isUnlimited ? Infinity : Math.max(0, creditsTotal - creditsUsed);
          const usagePct = isUnlimited ? 0 : creditsTotal > 0 ? Math.min(100, (creditsUsed / creditsTotal) * 100) : 0;
          const isLow = !isUnlimited && creditsRemaining <= 1;
          const isExhausted = !isUnlimited && creditsRemaining === 0;
          const resetsMonthly = currentPlanData?.resetsMonthly ?? false;
          const resetsLabel = resetsMonthly ? 'Resets monthly' : 'Lifetime cap';
          const teamSeats = currentPlanData?.teamSeats ?? 1;
          const symbol = CURRENCY_SYMBOLS[currentPlanData?.currency] ?? '';
          const priceLabel = !currentPlanData || currentPlanData.monthlyPrice === 0
            ? 'Free'
            : `${symbol}${currentPlanData.monthlyPrice}/mo`;
          const CurrentIcon = currentPlanData ? (PLAN_ICONS[plans.indexOf(currentPlanData)] ?? CreditCard) : CreditCard;

          return (
            <div className="space-y-4">
              <div className="card">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Current plan</p>
                    <div className="flex items-center gap-2">
                      <CurrentIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                      <span className="font-bold text-xl text-gray-900 dark:text-white">
                        {currentPlanData?.displayName ?? currentPlan}
                      </span>
                      <Badge variant="blue">{priceLabel}</Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{resetsLabel}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 mb-0.5">Team seats</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {teamSeats === -1 ? 'Unlimited' : teamSeats}
                    </p>
                  </div>
                </div>

                <div className={cn(
                  'rounded-xl p-4 border',
                  isExhausted ? 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800'
                    : isLow ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800'
                    : 'bg-gray-50 border-gray-100 dark:bg-gray-800/50 dark:border-gray-700'
                )}>
                  <div className="flex items-center justify-between mb-2">
                    <p className={cn('text-sm font-medium',
                      isExhausted ? 'text-red-700 dark:text-red-400' : isLow ? 'text-amber-700 dark:text-amber-400' : 'text-gray-700 dark:text-gray-200'
                    )}>
                      Job post credits
                    </p>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {isUnlimited ? 'Unlimited' : `${creditsUsed} / ${creditsTotal}`}
                    </span>
                  </div>

                  {!isUnlimited && (
                    <>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
                        <div
                          className={cn('h-full rounded-full transition-all',
                            isExhausted ? 'bg-red-500' : isLow ? 'bg-amber-500' : 'bg-blue-500'
                          )}
                          style={{ width: `${usagePct}%` }}
                        />
                      </div>
                      <p className={cn('text-xs',
                        isExhausted ? 'text-red-600 dark:text-red-400' : isLow ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400'
                      )}>
                        {isExhausted ? 'All credits used. Upgrade to post more jobs.'
                          : isLow ? `Only ${creditsRemaining} credit${creditsRemaining !== 1 ? 's' : ''} left.`
                          : `${creditsRemaining} credit${creditsRemaining !== 1 ? 's' : ''} remaining`}
                        {resetsMonthly && paymentPlan?.currentPeriodEnd && (
                          <span className="text-gray-400 dark:text-gray-500">
                            {' '}· Resets {new Date(paymentPlan.currentPeriodEnd).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </span>
                        )}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {plans.length > 0 && (
                <div className={`grid grid-cols-1 gap-4 ${plans.length === 1 ? '' : plans.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}`}>
                  {plans.map((p, idx) => {
                    const PlanIcon = PLAN_ICONS[idx] ?? CreditCard;
                    const isCurrent = currentPlan === p.planType;
                    const sym = CURRENCY_SYMBOLS[p.currency] ?? '';
                    const price = p.monthlyPrice === 0 ? 'Free' : `${sym}${p.monthlyPrice}/mo`;
                    const isFree = p.monthlyPrice === 0;
                    return (
                      <div key={p._id} className={cn('card relative flex flex-col', isCurrent && 'border-blue-400 dark:border-blue-600')}>
                        {isCurrent && (
                          <span className="absolute -top-2.5 left-4 bg-blue-600 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">Current</span>
                        )}
                        {p.isPopular && !isCurrent && (
                          <span className="absolute -top-2.5 right-4 bg-amber-400 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full">Popular</span>
                        )}

                        <div className="flex items-center gap-3 mb-4">
                          <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', isCurrent ? 'bg-blue-100 dark:bg-blue-950' : 'bg-gray-100 dark:bg-gray-800')}>
                            <PlanIcon className={cn('w-4 h-4', isCurrent ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400')} />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white leading-tight">{p.displayName}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                              {p.credits === -1 ? 'Unlimited credits' : `${p.credits} credits`}
                              {p.resetsMonthly ? ' / mo' : ' lifetime'}
                            </p>
                          </div>
                        </div>

                        <p className="text-2xl font-extrabold text-gray-900 dark:text-white mb-4">{price}</p>

                        {(p.features ?? []).length > 0 && (
                          <ul className="space-y-2 mb-4 flex-1">
                            {(p.features as string[]).map((f: string) => (
                              <li key={f} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                {f}
                              </li>
                            ))}
                          </ul>
                        )}

                        {!isCurrent && (
                          <button
                            onClick={() => handleChangePlan(p.planType, isFree)}
                            disabled={anyChanging}
                            className={cn(
                              'btn w-full btn-sm mt-auto disabled:opacity-50',
                              isFree ? 'btn-outline' : 'btn-primary'
                            )}
                          >
                            {changingPlan === p.planType ? (
                              <Spinner size="sm" />
                            ) : isFree ? 'Downgrade' : 'Upgrade'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Remove team member confirmation */}
      <ConfirmModal
        open={!!memberToRemove}
        title="Remove team member?"
        description={`"${memberToRemove?.email}" will be removed from the team. If they have already accepted the invitation, their account access will be revoked.`}
        confirmLabel="Remove"
        cancelLabel="Cancel"
        variant="danger"
        loading={removingMemberId === memberToRemove?._id}
        onConfirm={handleRemoveMember}
        onCancel={() => setMemberToRemove(null)}
      />
    </div>
  );
}

export default function SettingsPageWrapper() {
  return (
    <Suspense fallback={null}>
      <EmployerSettingsPage />
    </Suspense>
  );
}
