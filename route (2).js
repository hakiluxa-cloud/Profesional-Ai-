/**
 * File: app/api/chat/route.js
 * Fungsi: Backend API Route Handler untuk Next.js App Router (POST /api/chat).
 * Bertugas menerima riwayat percakapan ({ messages }) dari client, menambahkan header otentikasi rahasia
 * (OPENROUTER_API_KEY), meneruskannya ke OpenRouter API, dan mengembalikan balasan AI ke client.
 * 
 * KEAMANAN: API Key diproses eksklusif di server-side dan tidak pernah diekspos ke client browser.
 */

import { NextResponse } from "next/server";

/**
 * Fungsi POST Handler
 * Menangani request HTTP POST dari komponen antarmuka chat (ChatBox.js).
 * 
 * @param {Request} request - Objek request dari Next.js yang berisi body JSON { messages, model }
 * @returns {NextResponse} Response JSON berisikan teks jawaban AI ({ reply }) atau pesan error ({ error })
 */
export async function POST(request) {
  try {
    // 1. Ambil API Key dan Model dari Environment Variables di server
    const apiKey = process.env.OPENROUTER_API_KEY;
    const defaultModel = process.env.MODEL_NAME || "meta-llama/llama-3.1-8b-instruct:free";

    // Validasi keamanan & keberadaan API Key
    if (!apiKey || apiKey.includes("YOUR_OPENROUTER_API_KEY") || apiKey.includes("xxxx") || apiKey === "") {
      console.error("[API Error] OPENROUTER_API_KEY belum dikonfigurasi.");
      return NextResponse.json(
        { 
          error: "Konfigurasi Server Error: OPENROUTER_API_KEY belum diisi atau masih default di .env.local / Vercel Environment." 
        },
        { status: 500 }
      );
    }

    // 2. Parse body request dari client
    const body = await request.json();
    const { messages, model } = body;

    // Validasi format pesan
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Format request tidak valid: 'messages' harus berupa array percakapan yang tidak kosong." },
        { status: 400 }
      );
    }

    // Tentukan model yang dipakai (utamakan pilihan client jika ada, atau gunakan default dari .env)
    const selectedModel = model || defaultModel;

    // 3. Siapkan payload untuk dikirim ke OpenRouter API
    const payload = {
      model: selectedModel,
      messages: messages,
      temperature: 0.7,
      max_tokens: 2048,
    };

    // 4. Kirim request ke endpoint OpenRouter Chat Completions
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        // Header opsional tapi disarankan oleh OpenRouter untuk identifikasi aplikasi
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "Personal AI Chat Assistant",
      },
      body: JSON.stringify(payload),
    });

    // 5. Penanganan Error eksternal (Rate limit, Key invalid, Model error, dll.)
    if (!response.ok) {
      let errorMessage = `Gagal berkomunikasi dengan OpenRouter (Status: ${response.status})`;
      try {
        const errorData = await response.json();
        if (errorData?.error?.message) {
          errorMessage = `OpenRouter Error (${response.status}): ${errorData.error.message}`;
        }
      } catch (parseError) {
        // Jika response bukan JSON, ambil teks mentah
        const rawText = await response.text();
        if (rawText) errorMessage += ` - ${rawText.slice(0, 150)}`;
      }

      console.error("[OpenRouter Fetch Error]:", errorMessage);

      // Tangani kasus umum seperti Rate Limit (429) atau Unauthorized (401)
      if (response.status === 429) {
        return NextResponse.json(
          { error: "Batas permintaan (Rate Limit) tercapai pada OpenRouter API. Harap tunggu beberapa saat lalu coba lagi." },
          { status: 429 }
        );
      }
      if (response.status === 401) {
        return NextResponse.json(
          { error: "Otentikasi gagal: OPENROUTER_API_KEY tidak valid atau kadaluwarsa." },
          { status: 401 }
        );
      }

      return NextResponse.json({ error: errorMessage }, { status: response.status });
    }

    // 6. Parse response sukses dari OpenRouter
    const data = await response.json();

    // Pastikan struktur response memiliki isi jawaban
    const replyText = data?.choices?.[0]?.message?.content;
    if (!replyText && replyText !== "") {
      throw new Error("Response dari AI kosong atau strukturnya tidak dikenali.");
    }

    // 7. Kembalikan teks jawaban AI ke client
    return NextResponse.json(
      {
        reply: replyText,
        modelUsed: data?.model || selectedModel,
        usage: data?.usage || null,
      },
      { status: 200 }
    );

  } catch (error) {
    // Tangani exception tak terduga (misal koneksi terputus, JSON parse failure)
    console.error("[Internal API Handler Error]:", error);
    return NextResponse.json(
      { 
        error: `Terjadi kesalahan internal pada server: ${error.message || "Unknown error"}. Silakan periksa log server.` 
      },
      { status: 500 }
    );
  }
}
