'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api';
import { Spinner } from '@/app/components/ui/Spinner';
import { CheckCircle2, XCircle, Briefcase } from 'lucide-react';

export default function SettingsVerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string; trxref?: string }>;
}) {
  const params = use(searchParams);
  const reference = params.reference ?? params.trxref;
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');

  useEffect(() => {
    if (!reference) { setStatus('error'); return; }

    (async () => {
      try {
        const res = await apiClient.verifyPaystackPayment(reference);
        if (res.success && res.data) {
          setUser(res.data, 'company');
          setStatus('success');
        } else {
          setStatus('error');
        }
      } catch {
        setStatus('error');
      }
    })();
  }, [reference, setUser]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-10 text-center">

        {status === 'verifying' && (
          <>
            <Spinner size="lg" className="text-blue-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Verifying your payment…</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">This will only take a moment.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Plan updated!</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
              Your subscription is now active and your account has been updated.
            </p>
            <button
              onClick={() => router.push('/employer/settings?tab=subscription')}
              className="btn btn-primary w-full py-3 text-base"
            >
              Back to Settings
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center mx-auto mb-5">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Payment could not be verified</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
              If your payment went through, please contact support. Otherwise, go back and try again.
            </p>
            <button
              onClick={() => router.push('/employer/settings?tab=subscription')}
              className="btn btn-primary w-full py-3 text-base"
            >
              Back to Settings
            </button>
          </>
        )}
      </div>
    </div>
  );
}
