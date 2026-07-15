'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api';
import { PageHeader } from '@/app/components/ui/PageHeader';
import { Spinner } from '@/app/components/ui/Spinner';
import { Badge } from '@/app/components/ui/Badge';
import { cn } from '@/lib/utils';
import { PLAN_LIMITS } from '@/lib/planLimits';
import toast from 'react-hot-toast';
import { ICompany } from '@/types';
import { ConfirmModal } from '@/app/components/ui/ConfirmModal';
import {
  Building2, Lock, Users, CreditCard, Save, Eye, EyeOff, Check,
  Zap, Star, Crown, Camera, ImagePlus, X, Send, Trash2,
} from 'lucide-react';

type Tab = 'account' | 'password' | 'teams';


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
            {/* eslint-disable-next-line @next/next/no-img-element */}
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

  const tabs: { key: Tab; label: string; icon: typeof Building2 }[] = [
    { key: 'account',  label: 'Account',  icon: Building2 },
    { key: 'password', label: 'Password', icon: Lock },
    { key: 'teams',    label: 'Teams',    icon: Users },
  ];

  return (
    <div>
      <PageHeader title="Settings" description="Manage your account and preferences" />

      {/* Tabs — Responsive */}
      <div className="flex gap-0 border-b border-gray-200 dark:border-gray-800 mb-6 overflow-x-auto -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 snap-x snap-mandatory">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex items-center gap-2 px-3 sm:px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap -mb-px flex-shrink-0',
              tab === t.key
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
            )}
          >
            <t.icon className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">{t.label}</span>
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
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 pb-5 border-b border-gray-100 dark:border-gray-800">
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
              <div className="flex-1 min-w-0 pt-0 sm:pt-6">
                <h2 className="font-semibold text-gray-900 dark:text-white truncate">{company?.companyName}</h2>
                <p className="text-sm text-gray-500 truncate">{company?.email}</p>
                {company?.verified && (
                  <Badge variant="green" className="mt-1.5"><Check className="w-3 h-3" /> Verified</Badge>
                )}
              </div>
            </div>

            {/* Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
              <button onClick={handleSaveProfile} disabled={savingProfile} className="btn btn-primary gap-2 whitespace-nowrap">
                {savingProfile ? <Spinner size="sm" /> : <Save className="w-4 h-4" />}
                <span className="hidden sm:inline">Save Changes</span>
                <span className="sm:hidden">Save</span>
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

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
              <button onClick={handleChangePassword} disabled={savingPassword} className="btn btn-primary gap-2 whitespace-nowrap">
                {savingPassword ? <Spinner size="sm" /> : <Lock className="w-4 h-4" />}
                <span className="hidden sm:inline">Update Password</span>
                <span className="sm:hidden">Update</span>
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
