import type { NextConfig } from "next";

// Keep this policy explicit and host-specific. Do not replace these origins with
// broad wildcards unless a newly integrated provider actually requires it.
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self' https://checkout.stripe.com https://*.stripe.com",
  // Next requires unsafe-eval for development. It is omitted from production.
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""} https://js.stripe.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://res.cloudinary.com https://image.pollinations.ai https://avatar.vercel.sh",
  "font-src 'self' data:",
  "connect-src 'self' https://api.stripe.com https://openrouter.ai https://api.openrouter.ai https://api.cloudinary.com https://image.pollinations.ai https://gen.pollinations.ai",
  "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "image.pollinations.ai" },
      { protocol: "https", hostname: "avatar.vercel.sh" },
    ],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
