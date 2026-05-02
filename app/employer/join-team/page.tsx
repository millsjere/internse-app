'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

export default function JoinTeamPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Prevent React Strict Mode from firing the invite acceptance twice
  const hasAccepted = useRef(false);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    const acceptInvite = async () => {
      if (hasAccepted.current) return;
      hasAccepted.current = true;
      if (!token) {
        setError('Invalid or missing invitation token');
        setLoading(false);
        return;
      }

      try {
        const response = await apiClient.acceptTeamInvite(token);

        if (response.success) {
          const { data } = response;

          // Store JWT
          if (data.token) {
            localStorage.setItem('cid_jwt', data.token);
            if (data.tokenExpiry) {
              localStorage.setItem('tokenExpiry', data.tokenExpiry.toString());
            }
          }

          // Update auth state
          if (setUser && data.company) {
            setUser(
              {
                _id: data.company._id,
                companyName: data.company.companyName || '',
                email: data.company.email,
                onboardingStep: data.company.onboardingStep || 'complete',
                mustSetPassword: data.company.mustSetPassword ?? true,
                verified: data.company.verified ?? true,
                teamRole: data.company.teamRole ?? data.role,
              } as any,
              'company',
              data.tokenExpiry
            );
          }

          // If they need to set password, redirect to set-password page
          if (data.mustSetPassword) {
            toast.success('Invitation accepted! Please set your password.');
            setTimeout(() => {
              router.push('/employer/settings/set-password');
            }, 1500);
          } else {
            toast.success('Invitation accepted successfully!');
            setTimeout(() => {
              router.push('/employer');
            }, 1500);
          }
        } else {
          throw new Error(response.message || 'Failed to accept invitation');
        }
      } catch (err: any) {
        const errorMsg =
          err?.response?.data?.message || err.message || 'Failed to accept invitation';
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    acceptInvite();
  }, [token, setUser, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Processing your invitation...
          </p>
        </div>
      </div>
    );
  }

  if (error && error === 'Invalid or missing invitation token') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full px-6 py-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-red-200 dark:border-red-900">
          <div className="flex justify-center mb-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-4">
            Invalid Invitation
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
            The invitation link is invalid or has expired. Please request a new invitation from
            your team admin.
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full px-6 py-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-red-200 dark:border-red-900">
          <div className="flex justify-center mb-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-4">
            Error
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full px-6 py-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="flex justify-center mb-4">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-4">
          Invitation Accepted!
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
          Your invitation has been accepted. You will be redirected shortly...
        </p>
        {email && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Email:</strong> {email}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
