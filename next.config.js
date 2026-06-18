/** @type {import('next').NextConfig} */
module.exports = {
  output: 'standalone',
  experimental: { serverComponentsExternalPackages: ['@prisma/client','prisma'] },
}
