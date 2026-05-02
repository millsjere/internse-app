import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Heart, Globe, Lightbulb, Users, Briefcase, Building2, TrendingUp, Award } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn how Internse is transforming early career hiring for students worldwide. Our mission: connect every ambitious student with their dream opportunity.',
  keywords: ['about Internse', 'internship platform mission', 'early career hiring', 'student job marketplace'],
  openGraph: {
    title: 'About Internse',
    description: 'Learn how Internse is transforming early career hiring for students worldwide.',
    type: 'website',
    siteName: 'Internse',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Internse',
    description: 'Learn how Internse is transforming early career hiring for students worldwide.',
  },
};

const stats = [
  { value: '10,000+', label: 'Active Opportunities', desc: 'Live roles updated daily across every industry', icon: Briefcase, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  { value: '500+', label: 'Partner Companies', desc: 'From seed-stage startups to Fortune 500s', icon: Building2, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
  { value: '50,000+', label: 'Students Helped', desc: 'Across 60+ countries and counting', icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  { value: '95%', label: 'Success Rate', desc: 'Of active users land a role within 90 days', icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
];

const values = [
  { icon: Heart, title: 'Student First', desc: 'Every decision we make starts with one question: does this help students? Internse was built by people who remember the anxiety of job searching, and we design every feature to reduce that friction.', light: 'bg-pink-100 text-pink-600', dark: 'dark:bg-pink-950 dark:text-pink-400' },
  { icon: Globe, title: 'Radical Transparency', desc: 'Salaries shown upfront. No black-box algorithms. We believe you deserve to know exactly where your application stands and what employers are looking for.', light: 'bg-blue-100 text-blue-600', dark: 'dark:bg-blue-950 dark:text-blue-400' },
  { icon: Lightbulb, title: 'Constant Innovation', desc: "The job market moves fast. We move faster. We're always shipping new features — smart matching, one-click apply, real-time alerts — because your time is too valuable to waste.", light: 'bg-amber-100 text-amber-600', dark: 'dark:bg-amber-950 dark:text-amber-400' },
  { icon: Users, title: 'Inclusive by Design', desc: "Great talent is everywhere. Opportunity shouldn't be. We actively work to surface roles from diverse employers and remove barriers for candidates from all backgrounds.", light: 'bg-emerald-100 text-emerald-600', dark: 'dark:bg-emerald-950 dark:text-emerald-400' },
];


export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="relative h-[60vh] min-h-[480px] overflow-hidden">
        <Image src="/images/about/hero.jpg" alt="Our team" fill className="object-cover object-center" priority sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/85 via-blue-800/70 to-indigo-900/60" />
        <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
          <div className="max-w-3xl">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-blue-300 mb-4">Our Mission</span>
            <h1 className="text-5xl sm:text-6xl font-extrabold text-white mb-6 leading-tight">
              We&apos;re on a Mission to<br />
              <span className="text-blue-300">Democratise Opportunity</span>
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed max-w-2xl mx-auto">
              Internse was built because finding a great internship shouldn&apos;t require knowing the right people. It should just require being talented and willing to work hard.
            </p>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-100 dark:bg-gray-950">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 lg:px-16">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-3 block">By the numbers</span>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Our impact, in numbers</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-7 flex flex-col gap-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-white/10`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <div className={`text-4xl font-extrabold mb-1 ${stat.color}`}>{stat.value}</div>
                    <p className="text-gray-900 dark:text-white font-semibold text-lg mb-1">{stat.label}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{stat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Our Story ────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 lg:px-16 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-3 block">How it started</span>
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8">Our Story</h2>
            <div className="space-y-5 text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
              <p>
                Internse started in 2022 when our founders — both recent graduates — spent months sifting through outdated job boards, submitting applications into black holes, and getting ghosted by recruiters. They knew it didn&apos;t have to be this way.
              </p>
              <p>
                They built the platform they wished had existed: one that aggregates thousands of real opportunities, shows honest salary data, and lets you apply in seconds — not minutes. Within six months of launch, over 5,000 students had used Internse to land internships at companies ranging from early-stage startups to Fortune 500s.
              </p>
              <p>
                Today, Internse is the fastest-growing internship platform in the world, with 500+ employer partners and a community of 50,000+ students. But the mission hasn&apos;t changed: make opportunity accessible to anyone with the drive to seize it.
              </p>
            </div>
          </div>
          {/* Image */}
          <div className="relative h-[480px] rounded-3xl overflow-hidden shadow-2xl">
            <Image src="/images/about/story.jpg" alt="Founders working" fill className="object-cover object-center" sizes="(max-width: 1024px) 100vw, 50vw" />
            {/* Floating stat card */}
            <div className="absolute bottom-6 left-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl px-5 py-4">
              <div className="text-3xl font-extrabold text-blue-600">5,000+</div>
              <p className="text-base text-gray-500 dark:text-gray-400 font-medium">placements in first 6 months</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ───────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 lg:px-16">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-3 block">Our principles</span>
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">What We Stand For</h2>
            <p className="text-lg text-gray-500 dark:text-gray-400">Four principles that guide every decision we make.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((v) => (
              <div key={v.title} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-7 hover:shadow-lg dark:hover:shadow-gray-900 transition-shadow">
                <div className={`w-12 h-12 rounded-xl ${v.light} ${v.dark} flex items-center justify-center mb-5`}>
                  <v.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{v.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────── */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
        <Image src="/images/about/hero.jpg" alt="Join us" fill className="object-cover object-center" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700/90 to-indigo-800/90" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-4xl font-extrabold text-white mb-4">Join Our Community</h2>
          <p className="text-lg text-blue-100 mb-8">
            50,000+ students already building their futures with Internse. Your turn.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 font-bold text-blue-700 bg-white hover:bg-blue-50 rounded-2xl shadow-xl transition-all active:scale-95"
            >
              Sign Up Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 font-bold text-white border-2 border-white/30 hover:bg-white/10 rounded-2xl transition-all"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
