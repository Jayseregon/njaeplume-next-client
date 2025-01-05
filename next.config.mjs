import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const isLocalDev = process.env.NODE_ENV === 'development';

const permissionsPolicy = `
  accelerometer=(), 
  ambient-light-sensor=(), 
  autoplay=(), 
  battery=(), 
  camera=(), 
  display-capture=(), 
  document-domain=(), 
  encrypted-media=(), 
  fullscreen=(), 
  geolocation=(), 
  gyroscope=(), 
  layout-animations=(), 
  legacy-image-formats=(), 
  magnetometer=(), 
  microphone=(), 
  midi=(), 
  navigation-override=(), 
  payment=(), 
  picture-in-picture=(), 
  publickey-credentials-get=(), 
  sync-xhr=(), 
  usb=(), 
  wake-lock=(), 
  web-share=(), 
  xr-spatial-tracking=()
`.replace(/[\n\s]+/g, '');

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  output: 'standalone',
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  async headers() {
    return isLocalDev ? [] : [
      {
        source: '/:path*',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: permissionsPolicy },
          // { key: 'Expect-CT', value: 'max-age=86400, enforce, report-uri="https://yourdomain.com/report"' },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);