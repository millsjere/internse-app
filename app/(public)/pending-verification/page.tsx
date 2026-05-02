'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Mail, ArrowRight } from 'lucide-react';
import { ThemeToggler } from '@/app/components/ThemeToggler';
import { AuthCarousel } from '@/app/components/AuthCarousel';
import Link from 'next/link';
import { Suspense } from 'react';

function PendingVerificationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const email = searchParams.get('email') || '';
  const userType = searchParams.get('type') || 'user';

  const handleBackToLogin = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-light dark:bg-gray-950 text-dark dark:text-light transition-colors duration-300 flex">
      {/* ThemeToggler */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggler />
      </div>

      {/* Left Side - Carousel (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center">
        <AuthCarousel />
      </div>

      {/* Right Side - Content */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-md text-center">
          {/* Mail Icon */}
          <div className="mb-4 flex justify-center">
            <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Mail className="w-10 h-10 text-primary" />
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-2xl font-bold mb-1">Check Your Email</h1>

          {/* Subheading */}
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Registration successful!
          </p>

          {/* Email Display */}
          {email && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 my-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Verification email sent to:</p>
              <p className="font-semibold text-blue-600 dark:text-blue-400 break-all">{email}</p>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-8 text-left">
            <h3 className="font-semibold mb-3 text-dark dark:text-light">What&apos;s next?</h3>
            <ol className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex gap-3">
                <span className="font-semibold text-primary flex-shrink-0">1.</span>
                <span>Check your email inbox for a message from Internse</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-primary flex-shrink-0">2.</span>
                <span>Click the &quot;Verify Email&quot; button in the email</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-primary flex-shrink-0">3.</span>
                <span>You&apos;ll be logged into your {userType === 'company' ? 'employer' : 'job seeker'} dashboard</span>
              </li>
            </ol>
          </div>

          {/* Spam Warning */}
          <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">
            💡 Tip: If you don&apos;t see the email, please check your spam or junk folder
          </p>

          {/* Back to Login Button */}
          {/* <button
            onClick={handleBackToLogin}
            className="btn-secondary w-full flex items-center justify-center gap-2 mb-4"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Back to Login
          </button> */}

          {/* Help Text */}
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Already verified?{' '}
            <Link href="/login" className="text-primary hover:underline font-semibold">
              Go to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PendingVerificationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>}>
      <PendingVerificationContent />
    </Suspense>
  );
}
