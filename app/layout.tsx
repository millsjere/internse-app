import '@/app/globals.css';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from 'next-themes';
import { AuthInitProvider } from '@/app/providers/AuthInitProvider';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.internse.com'),
  title: {
    default: 'Internse | Find Internships & Entry-Level Jobs',
    template: '%s | Internse',
  },
  description: 'Discover thousands of internship and entry-level opportunities at top companies. Apply in one click and get hired faster.',
  keywords: ['internships', 'entry-level jobs', 'student jobs', 'job marketplace', 'internship platform', 'graduate jobs', 'hiring'],
  icons: {
    icon: '/favico.ico',
  },
  openGraph: {
    title: 'Internse | Find Internships & Entry-Level Jobs',
    description: 'Discover thousands of internship and entry-level opportunities at top companies. Apply in one click and get hired faster.',
    images: [
      {
        url: '/images/hero/hero-4.jpg',
        width: 1200,
        height: 630,
        alt: 'Internse - Internship & Job Marketplace',
      },
    ],
    type: 'website',
    url: 'https://www.internse.com',
    siteName: 'Internse',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Internse | Find Internships & Entry-Level Jobs',
    description: 'Discover thousands of internship and entry-level opportunities at top companies.',
    images: ['/images/hero/hero-4.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('theme') === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="bg-light dark:bg-gray-950 text-dark dark:text-light transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <AuthInitProvider>
            {children}
            <Toaster position="top-right" />
          </AuthInitProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
