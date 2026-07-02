/**
 * File: app/page.js
 * Fungsi: Halaman utama aplikasi web (Route `/`).
 * Bertugas me-render komponen antarmuka percakapan utama (<ChatBox />) di dalam container
 * yang responsif untuk tampilan layar komputer maupun perangkat seluler (mobile responsive).
 */

import ChatBox from "@/components/ChatBox";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8 min-h-screen bg-gradient-to-b from-dark-900 via-dark-900 to-dark-800">
      {/* Container utama untuk ChatBox dengan batasan lebar responsif */}
      <div className="w-full max-w-4xl h-[92vh] sm:h-[88vh] flex flex-col">
        <ChatBox />
      </div>
    </main>
  );
}
