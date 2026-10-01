import type { NextConfig } from "next";

const securityHeaders = [
  // BUG-6: Content Security Policy — disallows framing from other origins
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://apis.google.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://identitytoolkit.googleapis.com wss://*.firebaseio.com",
      "frame-src 'self' https://www.google.com",
      "frame-ancestors 'self'",
    ].join('; '),
  },
  // BUG-6: Prevent clickjacking
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  // BUG-6: Prevent MIME-type sniffing
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // BUG-6: Control referrer information
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  // BUG-6: Permissions policy (restrict powerful APIs)
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  // BUG-6: HSTS — forces HTTPS
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
];

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async redirects() {
    return [
      {
        // BUG-21: Standardize auth route family, redirect legacy /members to /member/apply
        source: '/members',
        destination: '/member/apply',
        permanent: true,
      },
      {
        // Convenience redirect for /join -> /member/apply
        source: '/join',
        destination: '/member/apply',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
