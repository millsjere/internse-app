'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import { ThemeToggler } from '@/app/components/ThemeToggler';
import { AuthCarousel } from '@/app/components/AuthCarousel';

export default function RegisterPage() {
  const router = useRouter();
  const [userType, setUserType] = useState<'user' | 'company'>('user');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    companyName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (userType === 'user') {
      if (!formData.firstname) e.firstname = 'First name is required';
      if (!formData.lastname) e.lastname = 'Last name is required';
    } else {
      if (!formData.companyName) e.companyName = 'Company name is required';
    }
    if (!formData.email) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Invalid email address';
    if (!formData.password) e.password = 'Password is required';
    else if (formData.password.length < 6) e.password = 'At least 6 characters';
    if (!formData.confirmPassword) e.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setIsLoading(true);
    try {
      let response;
      if (userType === 'user') {
        response = await apiClient.userSignUp({
          firstname: formData.firstname,
          lastname: formData.lastname,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        });
      } else {
        response = await apiClient.companySignUp({
          companyName: formData.companyName,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        });
      }

      if (response.success) {
        toast.success('Account created! Check your email to verify.');
        router.push(`/pending-verification?email=${encodeURIComponent(formData.email)}&type=${userType}`);
      } else {
        toast.error(response.message);
        setErrors({ submit: response.message });
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Registration failed';
      toast.error(msg);
      setErrors({ submit: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const field = (
    name: keyof typeof formData,
    label: string,
    type: string = 'text',
    placeholder: string = '',
    extra?: React.ReactNode
  ) => (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          placeholder={placeholder}
          className={`input dark:bg-gray-800 dark:border-gray-700 dark:text-white ${errors[name] ? 'border-red-500 focus:ring-red-500' : ''}`}
        />
        {extra}
      </div>
      {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex relative">
      <div className="absolute top-6 right-6 z-50"><ThemeToggler /></div>

      {/* Left carousel */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <AuthCarousel />
      </div>

      {/* Right form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center py-12 px-4 lg:px-8 max-h-screen overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Get Started</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {userType === 'company'
                ? 'Create your employer account — takes less than a minute'
                : 'Create your account and find your next opportunity'}
            </p>
          </div>

          {/* Type toggle */}
          <div className="flex gap-3 mb-6">
            {(['user', 'company'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { setUserType(t); setErrors({}); }}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                  userType === t
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {t === 'user' ? 'Candidate' : 'Organisation'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {userType === 'user' ? (
              <div className="grid grid-cols-2 gap-3">
                {field('firstname', 'First Name', 'text', 'John')}
                {field('lastname', 'Last Name', 'text', 'Doe')}
              </div>
            ) : (
              field('companyName', 'Company Name', 'text', 'Acme Inc.')
            )}

            {field('email', 'Email Address', 'email', 'you@example.com')}

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`input pr-12 dark:bg-gray-800 dark:border-gray-700 dark:text-white ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              <p className="text-xs text-gray-400 mt-1">At least 6 characters</p>
            </div>

            <div>
              <label className="label">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`input pr-12 dark:bg-gray-800 dark:border-gray-700 dark:text-white ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                <button type="button" onClick={() => setShowConfirmPassword((v) => !v)} className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            {errors.submit && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-700 dark:text-red-300 text-sm">{errors.submit}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 btn-primary py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating account...</>
              ) : (
                <><UserPlus className="w-5 h-5" /> Create Account</>
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:text-blue-600 dark:hover:text-blue-400 font-medium transition">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
