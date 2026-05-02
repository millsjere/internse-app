import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing Plans',
  description: 'Simple, transparent pricing for job seekers. Start free — no credit card required. Upgrade anytime to unlock unlimited applications and premium features.',
  keywords: ['internse pricing', 'job seeker plans', 'free internship app', 'premium job search'],
  openGraph: {
    title: 'Pricing Plans | Internse',
    description: 'Simple, transparent pricing for job seekers. Start free — no credit card required.',
    type: 'website',
    siteName: 'Internse',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pricing Plans | Internse',
    description: 'Simple, transparent pricing for job seekers. Start free — no credit card required.',
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
