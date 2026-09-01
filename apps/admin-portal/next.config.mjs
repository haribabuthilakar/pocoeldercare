/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  transpilePackages: [
    '@poco/business-rules',
    '@poco/constants',
    '@poco/database',
    '@poco/design-tokens',
    '@poco/integrations',
    '@poco/types',
    '@poco/ui',
    '@poco/validation',
  ],
};

export default nextConfig;
