/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
    buildActivityPosition: 'bottom-right',
  },
  serverExternalPackages: ['@prisma/client', 'prisma'],
};

module.exports = nextConfig;
