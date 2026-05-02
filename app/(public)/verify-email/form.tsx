'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Mail, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { AuthCarousel } from '@/app/components/AuthCarousel';
import { ThemeToggler } from '@/app/components/ThemeToggler';
import Link from 'next/link';

export default function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState<'user' | 'company'>('user');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');
  const [redirectCountdown, setRedirectCountdown] = useState(3);

  // Auto-verify when component mounts and URL params are present
  useEffect(() => {
    const verifyEmail = async () => {
      const tokenParam = searchParams.get('token');
      const emailParam = searchParams.get('email');
      const typeParam = (searchParams.get('type') as 'user' | 'company') || 'user';
      
      // Check if both params exist
      if (!tokenParam || !emailParam) {
        setStatus('error');
        setMessage('Invalid verification link. Please check your email or try signing up again.');
        return;
      }
      
      setToken(tokenParam);
      setEmail(decodeURIComponent(emailParam));
      setUserType(typeParam);
      
      try {
        // Call backend to verify - use the type from URL or try both
        let response;
        if (typeParam === 'company') {
          response = await apiClient.verifyCompanyEmail({
            email: decodeURIComponent(emailParam),
            token: tokenParam,
          });
        } else {
          response = await apiClient.verifyEmail({
            email: decodeURIComponent(emailParam),
            token: tokenParam,
          });
        }

        setStatus('success');
        setMessage('Email verified successfully! You will be redirected to login shortly.');
      } catch (error: any) {
        console.error('Verification error:', error);
        
        // If user verification failed, try company verification as fallback
        if (typeParam === 'user') {
          try {
            await apiClient.verifyCompanyEmail({
              email: decodeURIComponent(emailParam),
              token: tokenParam,
            });
            setStatus('success');
            setMessage('Email verified successfully! You will be redirected to login shortly.');
            return;
          } catch (companyError) {
            console.error('Company verification also failed:', companyError);
          }
        } else if (typeParam === 'company') {
          // If company verification failed, try user verification as fallback
          try {
            await apiClient.verifyEmail({
              email: decodeURIComponent(emailParam),
              token: tokenParam,
            });
            setStatus('success');
            setMessage('Email verified successfully! You will be redirected to login shortly.');
            return;
          } catch (userError) {
            console.error('User verification also failed:', userError);
          }
        }
        
        setStatus('error');
        setMessage(
          error.response?.data?.message || 
          'Failed to verify email. Please try again or request a new verification link.'
        );
      }
    };

    verifyEmail();
  }, [searchParams]);

  // Auto-redirect after success
  useEffect(() => {
    if (status === 'success') {
      const timer = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev <= 1) {
            router.push('/login');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [status, router]);

  // Loading state
  if (status === 'loading') {
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

        {/* Right Side - Loading */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8">
          <div className="w-full max-w-md text-center">
            <div className="mb-8 flex justify-center">
              <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full animate-pulse">
                <Loader className="w-12 h-12 text-primary animate-spin" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Verifying Your Email</h1>
            <p className="text-gray-600 dark:text-gray-400">{message}</p>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (status === 'success') {
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

        {/* Right Side - Success */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8">
          <div className="w-full max-w-md text-center">
            <div className="mb-8 flex justify-center">
              <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Email Verified!</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">{message}</p>

            {/* Email Display */}
            {email && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-8">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Verified email:</p>
                <p className="font-semibold text-green-600 dark:text-green-400 break-all">{email}</p>
              </div>
            )}

            {/* Redirect Countdown */}
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
              Redirecting to login in {redirectCountdown} seconds...
            </p>

            {/* Manual Redirect Button */}
            <Link href="/login" className="btn-primary w-full inline-block">
              Go to Login Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Error state
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

      {/* Right Side - Error */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-md text-center">
          <div className="mb-8 flex justify-center">
            <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full">
              <AlertCircle className="w-12 h-12 text-red-500" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-4">Verification Failed</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">{message}</p>

          {/* Suggestions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8 text-left">
            <h3 className="font-semibold mb-3 text-dark dark:text-light">What you can do:</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• Check that you copied the entire link from the email</li>
              <li>• Make sure the link hasn&apos;t expired (links expire after 24 hours)</li>
              <li>• Try requesting a new verification email</li>
              <li>• Contact support if the problem persists</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link href="/register" className="btn-primary w-full inline-block">
              Request New Verification Email
            </Link>
            <Link href="/login" className="btn-secondary w-full inline-block">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
