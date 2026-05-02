'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api';
import { PageHeader } from '@/app/components/ui/PageHeader';
import { Spinner } from '@/app/components/ui/Spinner';
import { Avatar } from '@/app/components/ui/Avatar';
import { Badge } from '@/app/components/ui/Badge';
import { ThemeToggler } from '@/app/components/ThemeToggler';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { IUser } from '@/types';
import { User, Lock, Palette, Bell, Save, Eye, EyeOff, Check } from 'lucide-react';

type Tab = 'account' | 'password' | 'preferences' | 'notifications';

export default function UserSettingsPage() {
  const { user, setUser } = useAuthStore();
  const userData = user as IUser | null;
  const [tab, setTab] = useState<Tab>('account');

  const [profile, setProfile] = useState({ firstname: '', lastname: '', email: '', phone: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, next: false, confirm: false });
  const [savingPassword, setSavingPassword] = useState(false);

  const [notifPrefs, setNotifPrefs] = useState({ applicationUpdates: true, newJobMatches: true, newsletter: false });

  useEffect(() => {
    if (userData) {
      setProfile({ firstname: userData.firstname ?? '', lastname: userData.lastname ?? '', email: userData.email ?? '', phone: userData.phone ?? '' });
    }
  }, [userData]);

  async function handleSaveProfile() {
    setSavingProfile(true);
    try {
      const res = await apiClient.updateUserProfile(profile);
      if (res.success) {
        toast.success('Account updated');
        if (res.data) setUser(res.data, 'user');
      } else toast.error(res.message || 'Failed to update');
    } catch { toast.error('Something went wrong'); }
    finally { setSavingProfile(false); }
  }

  async function handleChangePassword() {
    if (passwords.next !== passwords.confirm) { toast.error('Passwords do not match'); return; }
    if (passwords.next.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setSavingPassword(true);
    try {
      const res = await apiClient.changeUserPassword({ currentPassword: passwords.current, newPassword: passwords.next, confirmPassword: passwords.confirm });
      if (res.success) {
        toast.success('Password changed');
        setPasswords({ current: '', next: '', confirm: '' });
      } else toast.error(res.message || 'Failed to change password');
    } catch { toast.error('Something went wrong'); }
    finally { setSavingPassword(false); }
  }

  const tabs: { key: Tab; label: string; icon: typeof User }[] = [
    { key: 'account',       label: 'Account',        icon: User },
    { key: 'password',      label: 'Password',       icon: Lock },
    { key: 'preferences',   label: 'Preferences',    icon: Palette },
    { key: 'notifications', label: 'Notifications',  icon: Bell },
  ];

  const fullName = `${userData?.firstname ?? ''} ${userData?.lastname ?? ''}`.trim();

  return (
    <div>
      <PageHeader title="Settings" description="Manage your account and preferences" />

      <div className="flex gap-6 flex-col lg:flex-row">
        <nav className="lg:w-48 flex-shrink-0">
          <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                  tab === t.key
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                )}
              >
                <t.icon className="w-4 h-4 flex-shrink-0" />
                {t.label}
              </button>
            ))}
          </div>
        </nav>

        <div className="flex-1 min-w-0">
          {tab === 'account' && (
            <div className="card space-y-5">
              <div className="flex items-center gap-4 pb-5 border-b border-gray-100 dark:border-gray-800">
                <Avatar src={userData?.profilePhoto} name={fullName || 'U'} size="xl" />
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-white">{fullName}</h2>
                  <p className="text-sm text-gray-500">{userData?.email}</p>
                  {userData?.verified && <Badge variant="green" className="mt-1.5"><Check className="w-3 h-3" />Verified</Badge>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">First Name</label>
                  <input className="input" value={profile.firstname} onChange={(e) => setProfile((p) => ({ ...p, firstname: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Last Name</label>
                  <input className="input" value={profile.lastname} onChange={(e) => setProfile((p) => ({ ...p, lastname: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input type="email" className="input" value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input type="tel" className="input" value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} />
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-gray-800">
                <button onClick={handleSaveProfile} disabled={savingProfile} className="btn btn-primary">
                  {savingProfile ? <Spinner size="sm" /> : <Save className="w-4 h-4" />} Save Changes
                </button>
              </div>
            </div>
          )}

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
                  {savingPassword ? <Spinner size="sm" /> : <Lock className="w-4 h-4" />} Update Password
                </button>
              </div>
            </div>
          )}

          {tab === 'preferences' && (
            <div className="card space-y-6">
              <h2 className="font-semibold text-gray-900 dark:text-white">Preferences</h2>
              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Appearance</p>
                  <p className="text-sm text-gray-500">Toggle between light and dark mode</p>
                </div>
                <ThemeToggler />
              </div>
            </div>
          )}

          {tab === 'notifications' && (
            <div className="card space-y-4">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-2">Notification Preferences</h2>
              {([
                { key: 'applicationUpdates', label: 'Application updates', desc: 'Get notified when your application status changes' },
                { key: 'newJobMatches', label: 'New job matches', desc: 'Receive alerts for jobs that match your profile' },
                { key: 'newsletter', label: 'Newsletter', desc: 'Tips, career advice, and platform updates' },
              ] as const).map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={notifPrefs[key]}
                      onChange={(e) => setNotifPrefs((p) => ({ ...p, [key]: e.target.checked }))}
                    />
                    <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                  </label>
                </div>
              ))}
              <div className="flex justify-end pt-2">
                <button onClick={() => toast.success('Preferences saved')} className="btn btn-primary">
                  <Save className="w-4 h-4" /> Save Preferences
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
