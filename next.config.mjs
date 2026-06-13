/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  // sqlite3 is a native addon and sqlite is its JS wrapper.
  // Both must be excluded from the Next.js bundle so they are never loaded
  // at build time on Vercel (where sqlite3's glibc binary is incompatible).
  serverExternalPackages: ['sqlite3', 'sqlite'],
};

export default nextConfig;
