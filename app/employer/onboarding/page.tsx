'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api';
import { ICompany } from '@/types';
import { Spinner } from '@/app/components/ui/Spinner';
import toast from 'react-hot-toast';
import {
  Building2, Check, Zap, Star, Crown, CreditCard,
  Globe, Phone, MapPin, Briefcase,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$', GBP: '£', EUR: '€', GHS: '₵', NGN: '₦', KES: 'KSh', ZAR: 'R',
};

const PLAN_ICONS = [Zap, Star, Crown, CreditCard];

const INDUSTRIES = [
  'Technology', 'Finance', 'Healthcare', 'Education', 'Retail',
  'Manufacturing', 'Consulting', 'Marketing', 'Media', 'Real Estate', 'Other',
];

const EMPLOYEE_RANGES = ['1–10', '11–50', '51–200', '201–500', '500+'];

const STEPS = [
  {
    n: 1,
    icon: Building2,
    title: 'Company Profile',
    description: 'Tell candidates about your company — industry, size, and where you\'re based.',
  },
  {
    n: 2,
    icon: CreditCard,
    title: 'Choose a Plan',
    description: 'Pick the plan that fits your hiring needs. Start free or unlock more features.',
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const company = user as ICompany | null;

  const [step, setStep] = useState<1 | 2>(
    company?.onboardingStep === 'subscription' ? 2 : 1
  );

  const [profile, setProfile] = useState({
    phone: company?.phone ?? '',
    companySize: company?.companySize ?? '',
    industry: company?.industry ?? '',
    website: company?.website ?? '',
    address: company?.address ?? '',
    city: company?.city ?? '',
    state: company?.state ?? '',
    country: company?.country ?? '',
    description: company?.description ?? '',
  });

  const [plans, setPlans] = useState<any[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [selectingPlan, setSelectingPlan] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (company?.onboardingStep === 'complete') router.push('/employer');
  }, [company, router]);

  useEffect(() => {
    apiClient.getPlans()
      .then((res) => setPlans(Array.isArray(res.data) ? res.data : []))
      .catch(() => {})
      .finally(() => setPlansLoading(false));
  }, []);

  const validateProfile = () => {
    const e: Record<string, string> = {};
    if (!profile.industry) e.industry = 'Please select an industry';
    if (!profile.companySize) e.companySize = 'Please select company size';
    return e;
  };

  const handleSaveProfile = async () => {
    const errs = validateProfile();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSavingProfile(true);
    try {
      const res = await apiClient.saveOnboardingProfile(profile);
      if (res.success) {
        if (res.data) setUser(res.data, 'company');
        setStep(2);
      } else {
        toast.error(res.message || 'Failed to save profile');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSelectPlan = async (planKey: string) => {
    setSelectingPlan(planKey);
    try {
      const callbackUrl = `${window.location.origin}/employer/onboarding/success`;
      const res = await apiClient.selectPlan(planKey, 'monthly', callbackUrl);
      if (res.success) {
        const { authorizationUrl } = res.data ?? {};
        if (authorizationUrl) {
          // Paid plan — redirect to Paystack
          window.location.href = authorizationUrl;
        } else {
          // Free plan — backend returned full company object
          if (res.data) setUser(res.data, 'company');
          toast.success('Welcome to Internse!');
          router.push('/employer');
        }
      } else {
        toast.error(res.message || 'Failed to select plan');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSelectingPlan(null);
    }
  };

  const set = (field: keyof typeof profile, value: string) => {
    setProfile((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      {/* Card */}
      <div className="w-full max-w-5xl bg-white dark:bg-gray-900 rounded-3xl shadow-xl overflow-hidden flex min-h-[680px]">

        {/* ── Left sidebar ── */}
        <div className="hidden lg:flex flex-col w-[340px] flex-shrink-0 bg-gradient-to-b from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-850 p-8 relative overflow-hidden">

          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0 mb-3">
            <Image src="/images/internse-logo-blue.png" alt="Internse" width={120} height={36} className="h-9 w-auto object-contain" priority />
          </Link>

          {/* Info banner */}
          <div className="flex items-start gap-2.5 bg-white/70 dark:bg-gray-700/50 rounded-xl px-4 py-3 mb-8 border border-blue-100 dark:border-gray-600">
            <span className="text-blue-500 mt-0.5 text-base leading-none">ⓘ</span>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              Complete your profile to unlock your employer dashboard and start posting jobs.
            </p>
          </div>

          {/* Steps */}
          <div className="flex flex-col gap-0">
            {STEPS.map(({ n, icon: Icon, title, description }, idx) => {
              const isDone = step > n;
              const isActive = step === n;
              return (
                <div key={n} className="flex gap-4">
                  {/* Icon + connector */}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                      isDone
                        ? 'bg-emerald-500 shadow-md shadow-emerald-200 dark:shadow-emerald-900'
                        : isActive
                        ? 'bg-blue-600 shadow-md shadow-blue-200 dark:shadow-blue-900'
                        : 'bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600'
                    }`}>
                      {isDone
                        ? <Check className="w-4 h-4 text-white" />
                        : <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400 dark:text-gray-500'}`} />
                      }
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div className={`w-px flex-1 my-1 min-h-[40px] border-l-2 border-dashed transition-colors ${
                        isDone ? 'border-emerald-300 dark:border-emerald-700' : 'border-gray-200 dark:border-gray-600'
                      }`} />
                    )}
                  </div>

                  {/* Text */}
                  <div className="pb-8">
                    <p className={`text-sm font-bold mb-1 transition-colors ${
                      isActive ? 'text-gray-900 dark:text-white' : isDone ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'
                    }`}>{title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Decorative illustration */}
          <div className="mt-auto pt-4 relative">
            <div className="absolute bottom-0 left-0 right-0 h-40 overflow-hidden rounded-b-none">
              <div className="absolute bottom-[-20px] left-[-30px] w-48 h-48 rounded-full bg-blue-200/40 dark:bg-blue-900/30" />
              <div className="absolute bottom-[-40px] left-[60px] w-40 h-40 rounded-full bg-indigo-200/50 dark:bg-indigo-900/30" />
              <div className="absolute bottom-[-10px] left-[20px] w-24 h-24 rounded-full bg-blue-300/30 dark:bg-blue-800/20" />
            </div>
          </div>
        </div>

        {/* ── Right content ── */}
        <div className="flex-1 flex flex-col p-8 lg:p-10 overflow-y-auto">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-lg text-gray-900 dark:text-white">
              intern<span className="text-blue-600">se</span>
            </span>
          </div>

          {/* Step label */}
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">
            Step {step} of {STEPS.length}
          </p>

          {/* ── Step 1: Company Profile ── */}
          {step === 1 && (
            <div className="flex flex-col flex-1">
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">Set up your profile</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-7">
                Help candidates learn about your company. Pre-filled details from your registration are shown below.
              </p>

              {/* Pre-filled read-only */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Company Name</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{company?.companyName}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Email</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{company?.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Industry <span className="text-red-500">*</span></label>
                    <select
                      className={`input dark:bg-gray-800 dark:border-gray-700 dark:text-white ${errors.industry ? 'border-red-400' : ''}`}
                      value={profile.industry}
                      onChange={(e) => set('industry', e.target.value)}
                    >
                      <option value="">Select industry</option>
                      {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                    </select>
                    {errors.industry && <p className="text-red-500 text-xs mt-1">{errors.industry}</p>}
                  </div>
                  <div>
                    <label className="label">Company Size <span className="text-red-500">*</span></label>
                    <select
                      className={`input dark:bg-gray-800 dark:border-gray-700 dark:text-white ${errors.companySize ? 'border-red-400' : ''}`}
                      value={profile.companySize}
                      onChange={(e) => set('companySize', e.target.value)}
                    >
                      <option value="">Number of employees</option>
                      {EMPLOYEE_RANGES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                    {errors.companySize && <p className="text-red-500 text-xs mt-1">{errors.companySize}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">
                      <Phone className="w-3.5 h-3.5 inline mr-1 text-gray-400" />Phone
                    </label>
                    <input className="input dark:bg-gray-800 dark:border-gray-700 dark:text-white" type="tel" placeholder="+1 555 000 1234" value={profile.phone} onChange={(e) => set('phone', e.target.value)} />
                  </div>
                  <div>
                    <label className="label">
                      <Globe className="w-3.5 h-3.5 inline mr-1 text-gray-400" />Website
                    </label>
                    <input className="input dark:bg-gray-800 dark:border-gray-700 dark:text-white" type="url" placeholder="https://yourcompany.com" value={profile.website} onChange={(e) => set('website', e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className="label">
                    <MapPin className="w-3.5 h-3.5 inline mr-1 text-gray-400" />Address
                  </label>
                  <input className="input dark:bg-gray-800 dark:border-gray-700 dark:text-white" type="text" placeholder="123 Main St" value={profile.address} onChange={(e) => set('address', e.target.value)} />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {(['city', 'state', 'country'] as const).map((f) => (
                    <div key={f}>
                      <label className="label capitalize">{f}</label>
                      <input className="input dark:bg-gray-800 dark:border-gray-700 dark:text-white" value={profile[f]} onChange={(e) => set(f, e.target.value)} placeholder={f.charAt(0).toUpperCase() + f.slice(1)} />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="label">Company Description</label>
                  <textarea
                    className="input resize-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    rows={3}
                    placeholder="Tell candidates what makes your company a great place to work..."
                    value={profile.description}
                    onChange={(e) => set('description', e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-blue-200 dark:hover:shadow-blue-900 transition-all active:scale-95 disabled:opacity-60"
                >
                  {savingProfile && <Spinner size="sm" />}
                  Save and continue
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Choose Plan ── */}
          {step === 2 && (
            <div className="flex flex-col flex-1">
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">Choose your plan</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-7">
                Start free or unlock more with a paid plan. Upgrade or downgrade anytime.
              </p>

              {plansLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {plans.map((plan, idx) => {
                    const Icon = PLAN_ICONS[idx] ?? CreditCard;
                    const isFree = !plan.monthlyPrice || plan.monthlyPrice === 0;
                    const symbol = CURRENCY_SYMBOLS[plan.currency] ?? plan.currency ?? '';
                    const priceLabel = isFree ? 'Free' : `${symbol}${plan.monthlyPrice}`;
                    const billingNote = isFree ? 'Forever free' : 'per month';
                    const isSelecting = selectingPlan === plan.planType;
                    const anySelecting = selectingPlan !== null;

                    return (
                      <div
                        key={plan._id}
                        className={`rounded-2xl border-2 p-5 transition-all ${
                          plan.isPopular
                            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 shadow-md shadow-blue-100 dark:shadow-blue-900/20'
                            : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900'
                        }`}
                      >
                        {plan.isPopular && (
                          <span className="inline-block text-xs font-bold bg-blue-600 text-white px-3 py-0.5 rounded-full mb-3">
                            ⭐ Most Popular
                          </span>
                        )}
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl ${plan.isPopular ? 'bg-blue-100 dark:bg-blue-950' : 'bg-gray-100 dark:bg-gray-800'} flex items-center justify-center flex-shrink-0`}>
                              <Icon className={`w-5 h-5 ${plan.isPopular ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'}`} />
                            </div>
                            <div>
                              <div className="flex items-baseline gap-2 mb-1">
                                <h3 className="text-base font-extrabold text-gray-900 dark:text-white">{plan.displayName}</h3>
                                <span className="text-xl font-extrabold text-gray-900 dark:text-white">{priceLabel}</span>
                                <span className="text-xs text-gray-400">{billingNote}</span>
                              </div>
                              <ul className="flex flex-wrap gap-x-4 gap-y-1">
                                {(plan.features ?? []).map((f: string) => (
                                  <li key={f} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                    <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                                    {f}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <button
                            onClick={() => handleSelectPlan(plan.planType)}
                            disabled={anySelecting}
                            className={`flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-60 ${
                              plan.isPopular
                                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                                : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-100'
                            }`}
                          >
                            {isSelecting && <Spinner size="sm" />}
                            {isFree ? 'Start free' : 'Continue'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-auto pt-6 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  ← Back to profile
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
