/**
 * File: app/layout.js
 * Fungsi: Root Layout untuk aplikasi Next.js (App Router).
 * Mengatur struktur HTML dasar, metadata aplikasi untuk SEO, serta menerapkan
 * tema gelap (dark theme) secara menyeluruh melalui class pada <body>.
 */

import "./globals.css";

export const metadata = {
  title: "Personal AI Assistant - Next.js & OpenRouter",
  description: "Asisten cerdas pribadi berbasis teknologi AI mutakhir yang dikembangkan dengan Next.js App Router dan OpenRouter API.",
  keywords: ["AI Assistant", "Next.js", "OpenRouter", "Chatbot", "Vercel"],
  authors: [{ name: "Personal AI Developer" }],
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className="dark">
      <body className="bg-dark-900 text-gray-100 min-h-screen flex flex-col font-sans antialiased">
        {/* Render halaman di dalam wrapper utama */}
        <div className="flex-1 flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
