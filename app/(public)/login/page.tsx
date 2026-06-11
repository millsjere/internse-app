'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api';
import { initializeSocket, joinAsUser, joinAsCompany } from '@/lib/socket';
import toast from 'react-hot-toast';
import { Mail, Lock, LogIn, Eye, EyeOff, ArrowRight, Briefcase } from 'lucide-react';
import { ThemeToggler } from '@/app/components/ThemeToggler';
import { AuthCarousel } from '@/app/components/AuthCarousel';

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect');
  const { setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<'user' | 'company'>('user');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      let response;
      if (userType === 'user') {
        response = await apiClient.userLogin(formData);
      } else {
        response = await apiClient.companyLogin(formData);
      }

      if (response.success) {
        setUser(response.data, userType, response.data.tokenExpiry);
        const { setInitialized } = useAuthStore.getState();
        setInitialized(true);
        
        initializeSocket();
        if (userType === 'user') {
          joinAsUser(response.data._id, response.data.email);
        } else {
          joinAsCompany(response.data._id, response.data.email);
        }

        toast.success('Login successful! Redirecting...');
        if (redirectTo) {
          router.push(redirectTo);
        } else if (userType === 'user') {
          router.push('/dashboard');
        } else {
          const step = response.data.onboardingStep;
          router.push(step === 'complete' ? '/employer' : '/employer/onboarding');
        }
      } else {
        toast.error(response.message);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Login failed';
      toast.error(errorMsg);
      setErrors({ submit: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

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

      {/* Right Section - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center py-12 px-4 lg:px-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8 animate-fadeIn">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Sign in to your account and continue your journey
            </p>
          </div>

          {/* Google OAuth */}
          <button
            type="button"
            className="w-full py-3 px-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 font-medium flex items-center justify-center gap-2 transition mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
            <span className="text-sm text-gray-500 dark:text-gray-400">or continue with email</span>
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
          </div>

          {/* User Type Selector */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setUserType('user')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                userType === 'user'
                  ? 'bg-primary text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Candidate
            </button>
            <button
              onClick={() => setUserType('company')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                userType === 'company'
                  ? 'bg-primary text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Organisation
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                {/* <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 dark:text-gray-600 pointer-events-none" /> */}
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`input pl-12 dark:bg-gray-800 dark:border-gray-700 dark:text-white ${
                    errors.email ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-2">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="label">Password</label>
              <div className="relative">
                {/* <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 dark:text-gray-600 pointer-events-none" /> */}
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`input pl-12 pr-12 dark:bg-gray-800 dark:border-gray-700 dark:text-white ${
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
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:text-blue-600 dark:hover:text-blue-400 font-medium transition"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Login
                </>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="text-primary hover:text-blue-600 dark:hover:text-blue-400 font-medium transition"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
