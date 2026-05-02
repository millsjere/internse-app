import type { Metadata } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;

  try {
    const res = await fetch(`${API_URL}/jobs/${id}`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      const job = data?.data ?? data?.job ?? data;
      const title = job?.title ?? 'Job Opportunity';
      const company = job?.company?.companyName ?? '';
      const location = job?.location ?? (job?.remote ? 'Remote' : '');
      const desc = `${title}${company ? ` at ${company}` : ''}${location ? ` · ${location}` : ''}. Apply now on Internse.`;

      return {
        title,
        description: desc,
        openGraph: {
          title: `${title}${company ? ` at ${company}` : ''}`,
          description: desc,
          type: 'website',
          siteName: 'Internse',
          images: job?.company?.logo
            ? [{ url: job.company.logo, width: 400, height: 400, alt: company }]
            : [{ url: '/images/hero/hero-4.jpg', width: 1200, height: 630, alt: 'Internse' }],
        },
        twitter: {
          card: 'summary_large_image',
          title: `${title}${company ? ` at ${company}` : ''}`,
          description: desc,
        },
      };
    }
  } catch {
    // fall through to defaults
  }

  return {
    title: 'Job Opportunity',
    description: 'View this job opportunity on Internse and apply in one click.',
  };
}

export default function JobDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
