/** @type {import('next').NextConfig} */
const nextConfig = {
    onDemandEntries: {
        maxInactiveAge: 25 * 1000, // 25 seconds
        pagesBufferLength: 2, // Keep only 2 pages in buffer
    },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000',
  },
};

module.exports = nextConfig;
