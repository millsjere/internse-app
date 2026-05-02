import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: "Get in touch with the Internse team. We're here to help job seekers, employers, and partners. Reach us by email, phone, or our contact form.",
  openGraph: {
    title: 'Contact Us | Internse',
    description: "Get in touch with the Internse team. We're here to help job seekers, employers, and partners.",
    type: 'website',
    siteName: 'Internse',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us | Internse',
    description: 'Get in touch with the Internse team.',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
