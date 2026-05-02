'use client';

import { Suspense } from 'react';
import VerifyEmailForm from './form';

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VerifyEmailForm />
    </Suspense>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-transparent dark:from-gray-950 dark:to-gray-900 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md text-center">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
}
