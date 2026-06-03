/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@google-cloud/bigquery'],
  turbopack: {
    root: __dirname,
  },
  devIndicators: {
    position: 'bottom-right',
  },
  async redirects() {
    return [
      { source: '/request-center', destination: '/pedir', permanent: false },
      { source: '/hub', destination: '/command-center/pedidos', permanent: false },
      { source: '/hub/:path*', destination: '/command-center/pedidos', permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
