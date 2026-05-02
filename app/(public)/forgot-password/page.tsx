'use client';

import { useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft, Briefcase, CheckCircle, Loader } from 'lucide-react';
import { ThemeToggler } from '@/app/components/ThemeToggler';
import { AuthCarousel } from '@/app/components/AuthCarousel';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiClient.forgotPassword(email);
      if (response.success) {
        setSubmitted(true);
        toast.success('Check your email for reset instructions 📧');
      } else {
        setError(response.message || 'Failed to send reset email');
        toast.error(response.message);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to send reset email';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex relative">
        {/* Theme Toggler */}
        <div className="absolute top-6 right-6 z-50">
          <ThemeToggler />
        </div>

        {/* Left Section - Carousel (Hidden on mobile) */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-gray-50 dark:from-gray-900 dark:to-gray-800">
          <AuthCarousel />
        </div>

        {/* Right Section - Success Message */}
        <div className="w-full lg:w-1/2 flex items-center justify-center py-12 px-4 lg:px-8">
          <div className="w-full max-w-md">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>

              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Check Your Email
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                We&apos;ve sent password reset instructions to{' '}
                <span className="font-semibold text-gray-900 dark:text-white">{email}</span>
              </p>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Click the link in the email to reset your password. The link expires in 24 hours.
                </p>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Didn&apos;t receive the email? Check your spam folder or{' '}
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-primary hover:underline font-medium"
                >
                  try another email
                </button>
              </p>

              <Link
                href="/login"
                className="w-full py-3 px-4 rounded-lg bg-primary text-white font-medium hover:bg-blue-600 transition flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex relative">
      {/* Theme Toggler */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggler />
      </div>

      {/* Left Section - Carousel (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <AuthCarousel />
      </div>

      {/* Right Section - Forgot Password Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center py-12 px-4 lg:px-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8 animate-fadeIn">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Reset Password
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Enter your email address to receive password reset instructions
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                {/* <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 dark:text-gray-600 pointer-events-none" /> */}
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  className={`input pl-12 dark:bg-gray-800 dark:border-gray-700 dark:text-white ${
                    error ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                  placeholder="you@example.com"
                />
              </div>
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  Send Reset Email
                </>
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Remember your password?{' '}
              <Link
                href="/login"
                className="text-primary hover:text-blue-600 dark:hover:text-blue-400 font-medium transition"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
