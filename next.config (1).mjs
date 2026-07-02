/**
 * File: next.config.mjs
 * Fungsi: Konfigurasi utama untuk framework Next.js.
 * Memastikan proteksi environment variable rahasia (seperti API Key) agar tidak tertahan di client-side bundle,
 * serta optimasi build untuk deployment di platform cloud seperti Vercel.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Menonaktifkan powered-by header demi keamanan dasar
  poweredByHeader: false,
};

export default nextConfig;
