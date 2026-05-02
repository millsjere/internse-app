'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Check, ArrowRight, Zap, Shield, Headphones } from 'lucide-react';
import { apiClient } from '@/lib/api';

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$', GBP: '£', EUR: '€', GHS: '₵', NGN: '₦', KES: 'KSh', ZAR: 'R',
};

const faqs = [
  { q: 'Can I cancel my subscription at any time?', a: 'Yes — cancel anytime with no penalties. You keep access until the end of your billing period.' },
  { q: 'Is there a free trial for paid plans?', a: 'We offer a 7-day free trial for both Basic and Premium plans. No credit card required to start.' },
  { q: 'What happens to my data if I downgrade?', a: "Your profile and application history are always preserved. If you exceed storage limits, you'll be prompted to remove files." },
  { q: 'Do you offer discounts for students?', a: 'Yes! Verify your student email and get 30% off any paid plan for up to 2 years.' },
  { q: 'How does billing work for annual plans?', a: 'Annual plans are billed once per year at the discounted rate — saving you 2 months compared to monthly billing.' },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);

  useEffect(() => {
    apiClient.getPlans()
      .then((res) => setPlans(Array.isArray(res.data) ? res.data : []))
      .catch(() => {})
      .finally(() => setPlansLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="relative h-[52vh] min-h-[400px] overflow-hidden">
        <Image src="/images/pricing/hero.jpg" alt="Pricing" fill className="object-cover object-center" priority sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/85 via-blue-800/70 to-indigo-900/60" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-300 mb-4">Pricing</span>
          <h1 className="text-5xl font-extrabold text-white mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-blue-100 mb-10 max-w-xl">No hidden fees. No surprise charges. Just tools to help you succeed.</p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-3 bg-white/15 border border-white/20 rounded-2xl p-1.5 backdrop-blur-sm">
            <button
              onClick={() => setAnnual(false)}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${!annual ? 'bg-white text-blue-700 shadow-md' : 'text-white hover:bg-white/10'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${annual ? 'bg-white text-blue-700 shadow-md' : 'text-white hover:bg-white/10'}`}
            >
              Annual
              <span className="text-xs bg-emerald-400 text-white px-2 py-0.5 rounded-full font-bold">Save 2 months</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── Plan cards ───────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 lg:px-16">
          {plansLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1,2,3].map(i => <div key={i} className="h-96 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />)}
            </div>
          ) : plans.length === 0 ? (
            <p className="text-center text-gray-400 py-16">Plans coming soon.</p>
          ) : (
            <div className={`grid grid-cols-1 gap-6 ${plans.length === 2 ? 'md:grid-cols-2 max-w-3xl mx-auto' : plans.length >= 3 ? 'md:grid-cols-3' : 'max-w-sm mx-auto'}`}>
              {plans.map((plan) => {
                const price = annual ? plan.annualPrice : plan.monthlyPrice;
                const symbol = CURRENCY_SYMBOLS[plan.currency] ?? plan.currency;
                return (
                  <div
                    key={plan._id}
                    className={`rounded-2xl border-2 p-8 transition-all relative ${
                      plan.isPopular
                        ? 'border-blue-600 bg-blue-600 shadow-2xl shadow-blue-200 dark:shadow-blue-900/50 -translate-y-3'
                        : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900'
                    }`}
                  >
                    {plan.isPopular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="bg-amber-400 text-amber-900 text-xs font-extrabold px-4 py-1.5 rounded-full shadow-md whitespace-nowrap">
                          ⭐ Most Popular
                        </span>
                      </div>
                    )}

                    <h2 className={`text-2xl font-extrabold mb-5 ${plan.isPopular ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                      {plan.displayName}
                    </h2>

                    <div className="flex items-baseline gap-1 mb-6">
                      <span className={`text-5xl font-extrabold ${plan.isPopular ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                        {symbol}{price}
                      </span>
                      {price > 0 && (
                        <span className={`text-sm ${plan.isPopular ? 'text-blue-100' : 'text-gray-400 dark:text-gray-500'}`}>
                          /mo{annual ? ' billed annually' : ''}
                        </span>
                      )}
                    </div>

                    <Link
                      href="/register"
                      className={`w-full block text-center py-3.5 rounded-xl font-bold text-sm mb-8 transition-all active:scale-95 ${
                        plan.isPopular
                          ? 'bg-white text-blue-700 hover:bg-blue-50 shadow-md'
                          : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                      }`}
                    >
                      Get started
                    </Link>

                    <ul className="space-y-3">
                      {(plan.features ?? []).map((feature: string, i: number) => (
                        <li key={i} className="flex items-center gap-2.5 text-base">
                          <Check className={`w-4 h-4 flex-shrink-0 ${plan.isPopular ? 'text-blue-200' : 'text-emerald-500'}`} />
                          <span className={plan.isPopular ? 'text-blue-100' : 'text-gray-600 dark:text-gray-300'}>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Why upgrade — split layout ───────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 lg:px-16 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <div className="relative h-[420px] rounded-3xl overflow-hidden shadow-2xl order-2 lg:order-1">
            <Image src="/images/pricing/upgrade.jpg" alt="Level up your career" fill className="object-cover object-center" sizes="(max-width: 1024px) 100vw, 50vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-2xl px-5 py-4 shadow-lg">
                <p className="text-base font-bold text-gray-900 dark:text-white">&ldquo;Upgraded to Basic and landed 3 interviews in a week.&rdquo;</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">— Michael Chen, Business Analyst Intern @ McKinsey</p>
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="order-1 lg:order-2">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-3 block">Worth every penny</span>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">Why Upgrade?</h2>
            <div className="space-y-6">
              {[
                { icon: Zap, title: 'Land Jobs Faster', desc: 'Unlimited applications and smart recommendations mean you hear back sooner.', light: 'bg-blue-50 text-blue-600', dark: 'dark:bg-blue-950 dark:text-blue-400' },
                { icon: Shield, title: 'Stand Out More', desc: 'Profile boosts get your application seen first by top employers.', light: 'bg-violet-50 text-violet-600', dark: 'dark:bg-violet-950 dark:text-violet-400' },
                { icon: Headphones, title: 'Expert Support', desc: 'Priority access to career coaches and 24/7 support from our team.', light: 'bg-emerald-50 text-emerald-600', dark: 'dark:bg-emerald-950 dark:text-emerald-400' },
              ].map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className={`w-11 h-11 rounded-xl ${item.light} ${item.dark} flex items-center justify-center flex-shrink-0`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                    <p className="text-base text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* ── FAQ ──────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  {faq.q}
                  <span className={`text-gray-400 dark:text-gray-500 text-xl transition-transform ${openFaq === idx ? 'rotate-45' : ''}`}>+</span>
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-5 text-base text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-50 dark:border-gray-700 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────── */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
        <Image src="/images/pricing/hero.jpg" alt="Get started" fill className="object-cover object-center" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700/90 to-indigo-800/90" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-4xl font-extrabold text-white mb-4">Start for free today</h2>
          <p className="text-gray-300 mb-8">No credit card required. Upgrade whenever you&apos;re ready.</p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 text-base font-bold text-blue-700 bg-white hover:bg-blue-50 rounded-2xl shadow-xl transition-all duration-200 active:scale-95"
          >
            Get started free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

    </div>
  );
}
