import type { MetadataRoute } from 'next';

const BASE_URL = 'https://www.internse.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/jobs`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE_URL}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  let jobPages: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api'}/jobs?limit=200`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      const jobs = data?.data?.jobs ?? [];
      jobPages = jobs.map((job: { slug: string; updatedAt?: string; createdAt?: string }) => ({
        url: `${BASE_URL}/jobs/${job.slug}`,
        lastModified: new Date(job.updatedAt ?? job.createdAt ?? Date.now()),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
    }
  } catch {
    // fall back to static pages only
  }

  return [...staticPages, ...jobPages];
}
