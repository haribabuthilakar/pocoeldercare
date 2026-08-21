/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@poco/types', '@poco/config'],
};

export default nextConfig;
