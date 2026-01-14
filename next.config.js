/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ensure environment variables are available on client
  env: {
    NEXT_PUBLIC_POCKETBASE_URL: process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://localhost:8090',
  },
};

module.exports = nextConfig;

