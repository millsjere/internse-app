import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Browse Jobs & Internships',
  description: 'Search thousands of internship and entry-level job listings. Filter by location, job type, salary, and more. New opportunities added daily.',
  keywords: ['internships', 'entry-level jobs', 'student jobs', 'job search', 'graduate jobs', 'part-time jobs', 'remote jobs'],
  openGraph: {
    title: 'Browse Jobs & Internships | Internse',
    description: 'Search thousands of internship and entry-level job listings. New opportunities added daily.',
    type: 'website',
    siteName: 'Internse',
    images: [{ url: '/images/hero/hero-2.jpg', width: 1200, height: 630, alt: 'Browse Jobs on Internse' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Browse Jobs & Internships | Internse',
    description: 'Search thousands of internship and entry-level job listings. New opportunities added daily.',
    images: ['/images/hero/hero-2.jpg'],
  },
};

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
