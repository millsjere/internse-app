'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { useRouter } from 'next/navigation';
import {
  ArrowRight, Check, Zap, Users, Target, BarChart3,
  FileText, Bell, Briefcase, Star, Globe,
  ChevronLeft, ChevronRight, Search,
  Code2, Palette, HeartPulse, GraduationCap, Megaphone, PenTool,
  Cog, TrendingUp, Scale, Wrench, Layers,
} from 'lucide-react';
import { JOB_INDUSTRIES } from '@/lib/constants';

const heroSlides = [
  {
    image: '/images/hero/hero-1.jpg',
    badge: '10,000+ new jobs posted this week',
    heading: 'Connecting Young People to Opportunities',
    sub: 'Discover internships, jobs, fellowships, volunteer programmes, and career-building opportunities for young people worldwide.',
  },
  {
    image: '/images/hero/hero-2.jpg',
    badge: 'Discover Opportunities That Matter',
    heading: 'Build Skills. Gain Experience. Create Impact.',
    sub: 'Explore internships, volunteer programmes, fellowships, and career opportunities tailored to your goals.',
  },
  {
    image: '/images/hero/hero-3.jpg',
    badge: 'Opportunities Across Sectors',
    heading: 'Your Next Opportunity Starts Here',
    sub: "Whether you're seeking experience, leadership opportunities, or your first professional role, Internse helps you take the next step.",
  },
  {
    image: '/images/hero/hero-4.jpg',
    badge: 'Connect With Leading Organisations',
    heading: 'Learn, Contribute, and Grow',
    sub: 'Join programmes offered by employers, NGOs, governments, and institutions committed to developing the next generation of talent.',
  },
];

// Maps each industry to an icon — all share the same flat blue colour scheme
const CATEGORY_META: Record<string, { icon: React.ElementType }> = {
  Technology:  { icon: Code2 },
  Finance:     { icon: TrendingUp },
  Healthcare:  { icon: HeartPulse },
  Education:   { icon: GraduationCap },
  Marketing:   { icon: Megaphone },
  Design:      { icon: Palette },
  Engineering: { icon: Wrench },
  Sales:       { icon: Layers },
  Operations:  { icon: Cog },
  Legal:       { icon: Scale },
  Other:       { icon: PenTool },
};

const features = [
  { icon: Zap, title: 'Quick Apply', desc: 'Apply to any opportunity with one click. No lengthy forms, no repetitive data entry.', color: 'bg-blue-100 text-blue-600' },
  { icon: Target, title: 'Smart Matching', desc: 'AI-powered recommendations tailored to your skills and career goals.', color: 'bg-violet-100 text-violet-600' },
  { icon: FileText, title: 'Profile Builder', desc: 'Create a standout profile that gets noticed by top recruiters.', color: 'bg-pink-100 text-pink-600' },
  { icon: Bell, title: 'Real-time Alerts', desc: 'Get instant notifications when new opportunities match your criteria.', color: 'bg-amber-100 text-amber-600' },
  { icon: BarChart3, title: 'Track Progress', desc: 'Monitor all your applications and interview stages in one place.', color: 'bg-emerald-100 text-emerald-600' },
  { icon: Users, title: 'Community', desc: 'Connect with peers, share tips, and learn from success stories.', color: 'bg-orange-100 text-orange-600' },
];

const companies = ['Stripe', 'Airbnb', 'Figma', 'HubSpot', 'Notion', 'Vercel', 'Linear', 'Loom'];

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$', GBP: '£', EUR: '€', GHS: '₵', NGN: '₦', KES: 'KSh', ZAR: 'R',
};

const SLIDE_INTERVAL = 6000;

export default function HomeContent() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [heroSearch, setHeroSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [pricingPlans, setPricingPlans] = useState<any[]>([]);

  useEffect(() => {
    apiClient.getPlans()
      .then((res) => setPricingPlans(Array.isArray(res.data) ? res.data : []))
      .catch(() => {});
  }, []);

  const next = useCallback(() => setCurrent((c) => (c + 1) % heroSlides.length), []);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + heroSlides.length) % heroSlides.length), []);

  function handleHeroSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = heroSearch.trim();
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (selectedCategory) params.set('category', selectedCategory.toLowerCase());
    router.push(`/jobs${params.size > 0 ? '?' + params.toString() : ''}`);
  }

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, SLIDE_INTERVAL);
    return () => clearInterval(t);
  }, [paused, next]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 overflow-x-hidden">

      {/* ── Hero Slider ───────────────────────────────────── */}
      <section
        className="relative h-[90vh] min-h-[600px] overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Slides */}
        {heroSlides.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ${idx === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            <Image
              src={slide.image}
              alt={slide.heading}
              fill
              priority={idx === 0}
              className="object-cover object-center"
              sizes="100vw"
            />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/20" />
          </div>
        ))}

        {/* Content */}
        <div className="relative z-20 h-full flex items-center">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 lg:px-16 w-full">
            <div className="max-w-2xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white text-sm font-semibold px-4 py-2 rounded-full mb-6 border border-white/20 transition-all duration-700">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
                {heroSlides[current].badge}
              </div>

              {/* Heading */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight mb-6 leading-tight whitespace-pre-line">
                {heroSlides[current].heading}
              </h1>

              {/* Subtext */}
              <p className="text-lg text-white/80 mb-8 leading-relaxed max-w-xl">
                {heroSlides[current].sub}
              </p>

              {/* Search bar */}
              <form onSubmit={handleHeroSearch} className="mb-6 max-w-xl">
                <div className="flex items-center gap-0 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      value={heroSearch}
                      onChange={(e) => setHeroSearch(e.target.value)}
                      placeholder="Search role, company, or skill..."
                      className="w-full pl-12 pr-4 py-4 rounded-l-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-xl text-base"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-r-2xl shadow-xl transition-all duration-200 active:scale-95 flex-shrink-0"
                  >
                    Search
                  </button>
                </div>

                {/* Category selector */}
                <div className="flex flex-wrap gap-2">
                  {['Internship', 'Volunteer', 'Fellowship', 'Jobs', 'Leadership'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                        selectedCategory === cat
                          ? 'bg-white text-blue-700 border-white shadow-md'
                          : 'bg-white/20 text-white border-white/40 hover:bg-white/30'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </form>

            </div>
          </div>
        </div>

        {/* Prev / Next arrows */}
        <button
          onClick={prev}
          className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/20 hover:bg-white/35 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white transition-all"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={next}
          className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/20 hover:bg-white/35 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white transition-all"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Dot indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`rounded-full transition-all duration-300 ${
                idx === current
                  ? 'w-8 h-2.5 bg-white'
                  : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Stats bar pinned to bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-30 bg-black/30 backdrop-blur-md border-t border-white/10">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 lg:px-16 py-4 flex flex-wrap justify-center sm:justify-start gap-8">
            {[
              { value: '10,000+', label: 'Volunteer Programmes' },
              { value: '500+', label: 'Internships' },
              { value: '5,000+', label: 'Jobs' },
              { value: '1,000+', label: 'Fellowships' },
            ].map((stat) => (
              <div key={stat.label} className="text-center sm:text-left">
                <div className="text-xl font-extrabold text-white">{stat.value}</div>
                <div className="text-xs text-white/60 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 lg:px-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">Browse by Category</h2>
              <p className="text-lg text-gray-500 dark:text-gray-400">Explore opportunities across every industry.</p>
            </div>
            <Link href="/jobs" className="inline-flex items-center gap-2 text-blue-600 font-bold hover:text-blue-700 transition-colors flex-shrink-0">
              View all jobs <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {JOB_INDUSTRIES.filter((ind) => ind !== 'Other').map((industry) => {
              const { icon: Icon } = CATEGORY_META[industry];
              return (
                <Link
                  key={industry}
                  href={`/jobs?industry=${encodeURIComponent(industry)}`}
                  className="group flex flex-col gap-4 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{industry}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Browse roles</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────── */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900 overflow-hidden">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left — steps */}
            <div>
              <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-3">Get Hired in 4 Steps</h2>
              <p className="text-lg text-gray-500 dark:text-gray-400 mb-10">From signup to offer letter — faster than you think.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {[
                  { step: '01', icon: FileText, title: 'Create Account', desc: 'Join the platform in under a minute', color: 'from-blue-500 to-blue-600' },
                  { step: '02', icon: Users, title: 'Build Your Profile', desc: 'Showcase your skills, interests, and experience', color: 'from-violet-500 to-violet-600' },
                  { step: '03', icon: Briefcase, title: 'Explore Opportunities', desc: 'Discover internships, jobs, volunteer programmes, and fellowships tailored to your goals', color: 'from-pink-500 to-pink-600' },
                  { step: '04', icon: Star, title: 'Launch Your Journey', desc: 'Start your career, volunteer experience, or leadership pathway', color: 'from-amber-500 to-orange-500' },
                ].map((item, idx) => (
                  <div key={idx} className="relative bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                    <span className="absolute top-4 right-4 text-xs font-bold text-gray-300 dark:text-gray-600">{item.step}</span>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 shadow-md`}>
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — image */}
            <div className="relative h-[480px] lg:h-[560px] rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="/images/marketing/opportunity.png"
                alt="Team collaborating"
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>

          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 lg:px-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">Everything You Need to Succeed</h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">A full toolkit built for serious opportunity seekers — from first click to first day.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="group p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-xl hover:border-transparent hover:-translate-y-1 transition-all duration-200">
                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Internse ───────────────────────────────────── */}
      <section className="pb-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 lg:px-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">Why Internse?</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Everything you need to discover and land meaningful opportunities that match your ambitions.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl p-8 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 border border-blue-200 dark:border-blue-800">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-5">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Global Opportunities</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">Access internships, jobs, fellowships, and volunteer programmes from organisations worldwide.</p>
            </div>

            <div className="rounded-2xl p-8 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-900/10 border border-indigo-200 dark:border-indigo-800">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-5">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Built for Young People</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">Designed to help students and emerging professionals discover meaningful opportunities.</p>
            </div>

            <div className="rounded-2xl p-8 bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-900/20 dark:to-violet-900/10 border border-violet-200 dark:border-violet-800">
              <div className="w-12 h-12 rounded-xl bg-violet-600 text-white flex items-center justify-center mb-5">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">More Than a Job Board</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">Explore leadership programmes, career pathways, and opportunities for growth.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing Preview ───────────────────────────────── */}
      {/* <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 lg:px-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">Simple, Transparent Pricing</h2>
              <p className="text-lg text-gray-500 dark:text-gray-400">No hidden fees. Cancel anytime.</p>
            </div>
            <Link href="/pricing" className="inline-flex items-center gap-2 text-blue-600 font-bold hover:text-blue-700 transition-colors flex-shrink-0">
              See full pricing <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className={`grid grid-cols-1 gap-6 ${pricingPlans.length === 2 ? 'md:grid-cols-2 max-w-3xl mx-auto' : 'md:grid-cols-3'}`}>
            {pricingPlans.map((plan) => {
              const symbol = CURRENCY_SYMBOLS[plan.currency] ?? plan.currency ?? '$';
              return (
                <div
                  key={plan._id}
                  className={`rounded-2xl p-8 border-2 transition-all ${
                    plan.isPopular
                      ? 'border-blue-600 bg-blue-600 text-white shadow-2xl shadow-blue-200 -translate-y-2'
                      : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900'
                  }`}
                >
                  {plan.isPopular && (
                    <span className="inline-block text-xs font-bold bg-white/20 text-white px-3 py-1 rounded-full mb-4">
                      Most Popular
                    </span>
                  )}
                  <h3 className={`text-2xl font-extrabold mb-3 ${plan.isPopular ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                    {plan.displayName}
                  </h3>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className={`text-4xl font-extrabold ${plan.isPopular ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                      {symbol}{plan.monthlyPrice}
                    </span>
                    {plan.monthlyPrice > 0 && (
                      <span className={`text-sm ${plan.isPopular ? 'text-blue-100' : 'text-gray-400 dark:text-gray-500'}`}>/mo</span>
                    )}
                  </div>
                  <Link
                    href="/register"
                    className={`block text-center py-3 rounded-xl font-bold text-sm mb-6 transition-all active:scale-95 ${
                      plan.isPopular
                        ? 'bg-white text-blue-600 hover:bg-blue-50'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    Get started
                  </Link>
                  <ul className="space-y-3">
                    {(plan.features ?? []).map((f: string, i: number) => (
                      <li key={i} className="flex items-center gap-2.5 text-base">
                        <Check className={`w-4 h-4 flex-shrink-0 ${plan.isPopular ? 'text-blue-200' : 'text-emerald-500'}`} />
                        <span className={plan.isPopular ? 'text-blue-100' : 'text-gray-600 dark:text-gray-300'}>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section> */}

      {/* ── Final CTA ─────────────────────────────────────── */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <Image
          src="/images/marketing/office-meeting.jpg"
          alt="Start your career"
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-blue-800/80 to-indigo-900/90" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="text-5xl font-extrabold text-white mb-6 leading-tight">
            Ready to Land Your Next Opportunity?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Explore opportunities designed to help young people grow, lead, and succeed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-blue-700 bg-white hover:bg-blue-50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 active:scale-95"
            >
              Sign Up Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/jobs"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-white border-2 border-white/30 hover:bg-white/10 rounded-2xl transition-all duration-200"
            >
              Browse Opportunities <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
