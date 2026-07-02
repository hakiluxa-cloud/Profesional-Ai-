"use client";

/**
 * File: components/ChatBox.js
 * Fungsi: Komponen utama antarmuka pengguna (UI) untuk percakapan AI.
 * Bertanggung jawab mengelola state riwayat percakapan (useState), auto-scroll ke pesan terbaru (useRef),
 * indikator loading saat AI berpikir, penanganan error, serta komunikasi asinkron dengan API Route (/api/chat).
 */

import React, { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Bot, 
  User, 
  Trash2, 
  Copy, 
  Check, 
  AlertCircle, 
  RefreshCw, 
  Sparkles, 
  Info,
  ChevronDown
} from "lucide-react";

// Daftar model gratis OpenRouter populer yang dapat dipilih oleh pengguna
const AVAILABLE_MODELS = [
  { id: "meta-llama/llama-3.1-8b-instruct:free", name: "Llama 3.1 8B (Free)" },
  { id: "google/gemini-2.0-flash-lite-preview-02-05:free", name: "Gemini 2.0 Flash Lite (Free)" },
  { id: "deepseek/deepseek-chat:free", name: "DeepSeek V3 (Free)" },
  { id: "mistralai/mistral-7b-instruct:free", name: "Mistral 7B (Free)" },
];

// Contoh pertanyaan saran untuk memulai percakapan (Starter Prompts)
const STARTER_PROMPTS = [
  "Jelaskan konsep Artificial Intelligence secara sederhana",
  "Buatkan draf email profesional untuk pengajuan cuti",
  "Berikan 5 ide proyek portofolio Next.js modern",
  "Tuliskan fungsi JavaScript untuk format mata uang Rupiah",
];

export default function ChatBox() {
  /**
   * 1. STATE MANAGEMENT
   * - messages: Menyimpan daftar riwayat pesan dengan format { role: 'user' | 'assistant', content: string, timestamp: string }
   * - input: Menyimpan teks yang sedang diketik pengguna di kotak input
   * - isLoading: Status boolean apakah aplikasi sedang menunggu jawaban dari server AI
   * - errorMessage: Menyimpan pesan error jika terjadi kegagalan jaringan atau API
   * - selectedModel: Model AI yang dipilih untuk percakapan
   * - copiedIndex: Index pesan yang baru saja disalin ke clipboard (untuk feedback visual copy)
   */
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Halo! Saya adalah Personal AI Assistant Anda. Ada yang bisa saya bantu hari ini?",
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0].id);
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Referensi DOM untuk elemen paling bawah list pesan guna fitur auto-scroll
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  /**
   * Fungsi: scrollToBottom
   * Menggulir (scroll) antarmuka pesan secara halus (smooth) ke elemen paling bawah.
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto-scroll setiap kali daftar pesan bertambah atau status loading berubah
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  /**
   * Fungsi: handleSendMessage
   * Menangani proses pengiriman pesan pengguna ke server, menambahkan pesan ke state client,
   * dan menerima balasan AI.
   * 
   * @param {string|null} customText - Opsional: Teks langsung jika dipicu oleh tombol Starter Prompt
   */
  const handleSendMessage = async (customText = null) => {
    const textToSend = typeof customText === "string" ? customText : input;
    if (!textToSend || !textToSend.trim() || isLoading) return;

    // Bersihkan error sebelumnya jika ada
    setErrorMessage(null);

    // Buat objek pesan user baru
    const userMessage = {
      role: "user",
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    };

    // Update state messages: Tambahkan pesan user ke riwayat yang ada
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      // Format payload messages agar sesuai dengan spesifikasi OpenRouter (hanya kirim role dan content)
      const apiMessages = updatedMessages.map(({ role, content }) => ({
        role,
        content,
      }));

      // Panggil API Route internal Next.js (/api/chat)
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: apiMessages,
          model: selectedModel,
        }),
      });

      const data = await response.json();

      // Tangani respons error dari API
      if (!response.ok) {
        throw new Error(data.error || `Terjadi kesalahan HTTP: ${response.status}`);
      }

      // Buat objek balasan AI
      const aiMessage = {
        role: "assistant",
        content: data.reply,
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      };

      // Tambahkan balasan AI ke riwayat percakapan di client state
      setMessages((prevMessages) => [...prevMessages, aiMessage]);
    } catch (error) {
      console.error("[Chat UI Error]:", error);
      setErrorMessage(error.message || "Gagal menghubungi AI. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
      // Kembalikan fokus ke input box setelah selesai
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  /**
   * Fungsi: handleKeyDown
   * Mendeteksi tombol Enter pada keyboard untuk mengirim pesan (Shift+Enter untuk baris baru).
   */
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /**
   * Fungsi: handleClearChat
   * Menghapus seluruh riwayat percakapan dan mengembalikan pesan sambutan awal.
   */
  const handleClearChat = () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus seluruh riwayat percakapan ini?")) {
      setMessages([
        {
          role: "assistant",
          content: "Riwayat percakapan telah dibersihkan. Ada hal baru yang ingin Anda diskusikan?",
          timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setErrorMessage(null);
    }
  };

  /**
   * Fungsi: handleCopyText
   * Menyalin teks pesan ke clipboard sistem pengguna.
   * 
   * @param {string} text - Teks yang akan disalin
   * @param {number} index - Index pesan untuk memunculkan ikon centang sukses
   */
  const handleCopyText = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error("Gagal menyalin teks:", err);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full bg-dark-900 border border-dark-700 rounded-2xl shadow-2xl overflow-hidden">
      
      {/* ====================================================================
          HEADER CHATBOX
          Menampilkan judul, pemilih model AI, dan tombol hapus riwayat
          ==================================================================== */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-4 bg-dark-800/90 border-b border-dark-700 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-brand-600/30">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              Personal AI Assistant
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-400 font-semibold border border-brand-500/30">
                Pro
              </span>
            </h1>
            <p className="text-xs text-gray-400">Didukung oleh OpenRouter & Next.js App Router</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          {/* Dropdown Pemilih Model */}
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={isLoading}
              aria-label="Pilih model AI"
              className="w-full sm:w-auto appearance-none bg-dark-900 border border-dark-700 text-gray-300 text-xs rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:border-brand-500 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {AVAILABLE_MODELS.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Tombol Hapus Percakapan */}
          <button
            onClick={handleClearChat}
            disabled={isLoading || messages.length <= 1}
            title="Hapus riwayat percakapan"
            className="p-2 rounded-lg bg-dark-900 border border-dark-700 text-gray-400 hover:text-red-400 hover:border-red-500/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ====================================================================
          AREA PESAN / CHAT HISTORY
          Menampilkan daftar bubble chat (User vs Assistant) dengan scroll otomatis
          ==================================================================== */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        
        {/* Banner Error Handling (Jika fetch gagal, tampilkan pesan jelas di UI) */}
        {errorMessage && (
          <div className="animate-fade-in p-4 bg-red-500/10 border border-red-500/40 rounded-xl flex items-start space-x-3 text-red-300">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm">
              <p className="font-semibold text-red-200">Terjadi Kesalahan</p>
              <p className="mt-1 text-red-300/90 leading-relaxed">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs text-red-400 hover:text-white underline self-start"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Daftar Pesan */}
        {messages.map((msg, idx) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={idx}
              className={`flex items-start gap-3.5 ${isUser ? "flex-row-reverse" : "flex-row"} animate-fade-in`}
            >
              {/* Avatar Icon */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ${
                  isUser
                    ? "bg-brand-600 text-white"
                    : "bg-dark-700 border border-dark-600 text-brand-400"
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Bubble Chat */}
              <div
                className={`group relative max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 shadow-md ${
                  isUser
                    ? "bg-gradient-to-br from-brand-600 to-indigo-700 text-white rounded-tr-sm"
                    : "bg-dark-800 border border-dark-700 text-gray-200 rounded-tl-sm"
                }`}
              >
                {/* Isi Konten Pesan */}
                <div className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
                  {msg.content}
                </div>

                {/* Footer Message: Timestamp & Copy Button */}
                <div
                  className={`mt-2 flex items-center justify-between gap-4 text-[10px] ${
                    isUser ? "text-indigo-200" : "text-gray-500"
                  }`}
                >
                  <span>{msg.timestamp || ""}</span>

                  {/* Tombol Copy (Muncul pada balasan AI) */}
                  {!isUser && (
                    <button
                      onClick={() => handleCopyText(msg.content, idx)}
                      className="opacity-70 group-hover:opacity-100 transition-opacity flex items-center gap-1 hover:text-gray-300"
                      title="Salin pesan ini"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-3 h-3 text-green-400" />
                          <span className="text-green-400">Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Indikator Loading Saat AI Sedang Berpikir (Dots Animasi & Spinner) */}
        {isLoading && (
          <div className="flex items-start gap-3.5 animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-dark-700 border border-dark-600 text-brand-400 flex items-center justify-center flex-shrink-0 shadow-md">
              <Bot className="w-4 h-4 animate-bounce" />
            </div>
            <div className="bg-dark-800 border border-dark-700 rounded-2xl rounded-tl-sm px-5 py-4 shadow-md flex items-center space-x-3">
              <RefreshCw className="w-4 h-4 text-brand-400 animate-spin" />
              <div className="flex items-center space-x-1.5">
                <span className="text-xs text-gray-400 font-medium mr-1">AI sedang berpikir</span>
                <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse-fast"></span>
                <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse-fast [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse-fast [animation-delay:0.4s]"></span>
              </div>
            </div>
          </div>
        )}

        {/* Anchor point untuk Auto-Scroll */}
        <div ref={messagesEndRef} />
      </div>

      {/* ====================================================================
          STARTER PROMPTS
          Saran pertanyaan cepat untuk membantu pengguna saat riwayat masih sedikit
          ==================================================================== */}
      {messages.length === 1 && !isLoading && (
        <div className="px-6 pb-2">
          <p className="text-xs text-gray-500 font-medium mb-2 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-brand-400" />
            Coba mulai percakapan dengan topik populer:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {STARTER_PROMPTS.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handleSendMessage(prompt)}
                className="text-left text-xs p-2.5 rounded-xl bg-dark-800/60 hover:bg-dark-800 border border-dark-700/80 hover:border-brand-500/40 text-gray-300 hover:text-white transition-all line-clamp-1 group flex items-center justify-between"
              >
                <span>{prompt}</span>
                <Sparkles className="w-3 h-3 opacity-0 group-hover:opacity-100 text-brand-400 transition-opacity flex-shrink-0 ml-2" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ====================================================================
          FOOTER INPUT AREA
          Kotak teks dan tombol pengiriman pesan
          ==================================================================== */}
      <footer className="p-4 sm:p-6 bg-dark-800/50 border-t border-dark-700">
        <div className="relative flex items-end gap-2 bg-dark-900 border border-dark-700 focus-within:border-brand-500 rounded-xl p-2 shadow-inner transition-colors">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="Tulis pesan Anda di sini... (Enter untuk kirim, Shift+Enter baris baru)"
            className="w-full bg-transparent text-sm sm:text-base text-gray-100 placeholder-gray-500 px-2 py-1.5 resize-none max-h-32 focus:outline-none disabled:opacity-50"
            style={{ minHeight: "40px" }}
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || isLoading}
            title="Kirim Pesan"
            className="p-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white disabled:bg-dark-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-brand-600/30 flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500 px-1">
          <span>Tekan <kbd className="px-1 py-0.5 bg-dark-800 border border-dark-700 rounded text-gray-400">Enter</kbd> untuk mengirim</span>
          <span>Keamanan: API Key tersembunyi di server</span>
        </div>
      </footer>
    </div>
  );
}
