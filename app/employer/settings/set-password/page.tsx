'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api';
import { ICompany } from '@/types';
import toast from 'react-hot-toast';
import { Lock } from 'lucide-react';

export default function SetPasswordPage() {
  const router = useRouter();
  const { user, isAuthenticated, userType, setUser, tokenExpiry } = useAuthStore();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ new?: string; confirm?: string }>({});

  // Redirect if not a company or not authenticated
  if (!isAuthenticated || userType !== 'company') {
    router.push('/employer/login');
    return null;
  }

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!newPassword) {
      newErrors.new = 'Password is required';
    } else if (newPassword.length < 8) {
      newErrors.new = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      newErrors.confirm = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirm = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.setPassword(newPassword, confirmPassword);

      if (response.success) {
        // Clear mustSetPassword flag in auth store so layout doesn't redirect back here
        if (user && setUser) {
          const company = user as ICompany;
          setUser({ ...company, mustSetPassword: false }, 'company', tokenExpiry ?? undefined);
        }
        toast.success('Password set successfully!');
        setTimeout(() => {
          router.push('/employer');
        }, 1500);
      } else {
        toast.error(response.message || 'Failed to set password');
      }
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message || err.message || 'Failed to set password';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full px-6 py-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="flex justify-center mb-4">
          <Lock className="w-12 h-12 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
          Set Your Password
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
          Welcome to your team! Please set a strong password to secure your account.
        </p>

        {user && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Email:</strong> {user.email}
            </p>
          </div>
        )}

        <form onSubmit={handleSetPassword} className="space-y-4">
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (errors.new) setErrors({ ...errors, new: undefined });
              }}
              placeholder="Enter a strong password"
              className={`w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                errors.new ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } focus:outline-none focus:ring-2 focus:ring-blue-600`}
              disabled={loading}
            />
            {errors.new && <p className="mt-1 text-sm text-red-600">{errors.new}</p>}
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirm) setErrors({ ...errors, confirm: undefined });
              }}
              placeholder="Confirm your password"
              className={`w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                errors.confirm ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } focus:outline-none focus:ring-2 focus:ring-blue-600`}
              disabled={loading}
            />
            {errors.confirm && <p className="mt-1 text-sm text-red-600">{errors.confirm}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
          >
            {loading ? 'Setting Password...' : 'Set Password'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-6">
          Use a strong password with at least 8 characters.
        </p>
      </div>
    </div>
  );
}
