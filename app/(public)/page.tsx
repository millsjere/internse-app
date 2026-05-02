import { Metadata } from 'next';
import HomeContent from './HomeContent';

export const metadata: Metadata = {
  title: 'Internse | Find Internships & Entry-Level Jobs',
  description: 'Discover thousands of internship and entry-level opportunities at top companies. Apply in one click, get hired faster. Join 50,000+ students already using Internse.',
  keywords: ['internships', 'entry-level jobs', 'job marketplace', 'student jobs', 'internship platform', 'career', 'hiring'],
  openGraph: {
    title: 'Internse | Find Internships & Entry-Level Jobs',
    description: 'Discover thousands of internship and entry-level opportunities at top companies. Apply in one click, get hired faster.',
    type: 'website',
    siteName: 'Internse',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Internse | Find Internships & Entry-Level Jobs',
    description: 'Discover thousands of internship and entry-level opportunities at top companies.',
  },
};

export default function Home() {
  return <HomeContent />;
}
