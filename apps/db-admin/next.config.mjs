/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@poco/types', '@poco/config', '@poco/database'],
  reactStrictMode: true,
};

export default nextConfig;
