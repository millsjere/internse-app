'use client';

import { useState } from 'react';
import { User, Lock, Save } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import { useAdminStore } from '@/lib/adminStore';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const { admin, setAdmin } = useAdminStore();

  const [profile, setProfile] = useState({ name: admin?.name ?? '', email: admin?.email ?? '' });
  const [profileSaving, setProfileSaving] = useState(false);

  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordSaving, setPasswordSaving] = useState(false);

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    if (!profile.name.trim() || !profile.email.trim()) {
      toast.error('Name and email are required');
      return;
    }
    setProfileSaving(true);
    try {
      const res = await adminApi.updateProfile({ name: profile.name.trim(), email: profile.email.trim() });
      if (res.success) {
        setAdmin(res.data);
        toast.success('Profile updated');
      } else {
        toast.error(res.message || 'Update failed');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Update failed');
    } finally {
      setProfileSaving(false);
    }
  }

  async function handlePasswordSave(e: React.FormEvent) {
    e.preventDefault();
    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      toast.error('All password fields are required');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwords.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    setPasswordSaving(true);
    try {
      const res = await adminApi.updatePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      if (res.success) {
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        toast.success('Password updated');
      } else {
        toast.error(res.message || 'Update failed');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Update failed');
    } finally {
      setPasswordSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage your admin account details</p>
      </div>

      {/* Account */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400 flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Account</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Update your name and email address</p>
          </div>
        </div>
        <form onSubmit={handleProfileSave} className="px-6 py-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400/50 focus:border-red-400 dark:focus:border-red-500 transition-colors"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400/50 focus:border-red-400 dark:focus:border-red-500 transition-colors"
                placeholder="admin@example.com"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={profileSaving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-100 disabled:opacity-50 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              {profileSaving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Password */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-500 dark:text-amber-400 flex items-center justify-center">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Password</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Change your admin account password</p>
          </div>
        </div>
        <form onSubmit={handlePasswordSave} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Current Password</label>
            <input
              type="password"
              value={passwords.currentPassword}
              onChange={(e) => setPasswords((p) => ({ ...p, currentPassword: e.target.value }))}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400/50 focus:border-red-400 dark:focus:border-red-500 transition-colors"
              placeholder="Enter current password"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">New Password</label>
              <input
                type="password"
                value={passwords.newPassword}
                onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400/50 focus:border-red-400 dark:focus:border-red-500 transition-colors"
                placeholder="Min 8 characters"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm New Password</label>
              <input
                type="password"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords((p) => ({ ...p, confirmPassword: e.target.value }))}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400/50 focus:border-red-400 dark:focus:border-red-500 transition-colors"
                placeholder="Repeat new password"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={passwordSaving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-100 disabled:opacity-50 transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              {passwordSaving ? 'Updating…' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
