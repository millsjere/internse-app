'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react';
import { ThemeToggler } from '@/app/components/ThemeToggler';
import { AuthCarousel } from '@/app/components/AuthCarousel';

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (!token) {
      toast.error('Invalid or missing reset token');
      router.push('/forgot-password');
    }
  }, [token, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!token) {
      toast.error('Invalid reset token');
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiClient.resetPassword({
        email: formData.email,
        token: token,
        newPassword: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      if (response.success) {
        setSubmitted(true);
        toast.success('Password reset successfully! 🎉');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        toast.error(response.message);
        setErrors({ submit: response.message });
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to reset password';
      toast.error(errorMsg);
      setErrors({ submit: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return null;
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex relative">
        {/* Theme Toggler */}
        <div className="absolute top-6 right-6 z-50">
          <ThemeToggler />
        </div>

        {/* Left Section - Carousel (Hidden on mobile) */}
        <div className="hidden lg:flex lg:w-1/2 h-screen sticky top-0">
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
                Password Reset Successful
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Your password has been successfully reset. You&apos;ll be redirected to the login page shortly.
              </p>

              <Link
                href="/login"
                className="w-full py-3 px-4 rounded-lg bg-primary text-white font-medium hover:bg-blue-600 transition flex items-center justify-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                Go to Login
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
      <div className="hidden lg:flex lg:w-1/2 h-screen sticky top-0">
        <AuthCarousel />
      </div>

      {/* Right Section - Reset Password Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center py-12 px-4 lg:px-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8 animate-fadeIn">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Reset Password
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Enter your new password below
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`input dark:bg-gray-800 dark:border-gray-700 dark:text-white ${
                  errors.email ? 'border-red-500 focus:ring-red-500' : ''
                }`}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-2">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="label">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`input pr-12 dark:bg-gray-800 dark:border-gray-700 dark:text-white ${
                    errors.password ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-2">{errors.password}</p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                At least 6 characters, mix of letters and numbers recommended
              </p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="label">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`input pr-12 dark:bg-gray-800 dark:border-gray-700 dark:text-white ${
                    errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-2">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg">
                <p className="text-red-700 dark:text-red-300 text-sm">{errors.submit}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Reset Password
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

          {/* Help Text */}
          <p className="text-center text-gray-600 dark:text-gray-400 text-sm mt-6">
            This link expires in 24 hours. If it&apos;s expired,{' '}
            <Link href="/forgot-password" className="text-primary hover:underline">
              request a new one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
