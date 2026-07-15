'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api';
import { Spinner } from '@/app/components/ui/Spinner';
import { CheckCircle2, XCircle, Briefcase } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function OnboardingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string }>;
}) {
  const { reference } = use(searchParams);
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

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Link href="/" className="flex items-center flex-shrink-0">
            <Image src="/images/internse-logo-blue.png" alt="Internse" width={120} height={36} className="h-9 w-auto object-contain" priority />
          </Link>
        </div>

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
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Payment confirmed!</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
              Your plan is now active. Welcome to Internse — let&apos;s start posting jobs.
            </p>
            <button
              onClick={() => router.push('/employer')}
              className="btn btn-primary w-full py-3 text-base"
            >
              Go to Dashboard
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
              onClick={() => router.push('/employer/onboarding')}
              className="btn btn-primary w-full py-3 text-base"
            >
              Back to Onboarding
            </button>
          </>
        )}
      </div>
    </div>
  );
}
