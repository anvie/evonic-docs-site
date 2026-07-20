---
title: Troubleshooting — Agent Image Processing Failure
description: Langkah demi langkah mengatasi masalah saat agen gagal memproses gambar di Evonic.
sidebar:
  order: 5
---

Saat menggunakan agen dengan kemampuan vision (pengenalan gambar), kamu mungkin mengalami situasi di mana agen gagal memproses atau "melihat" gambar yang dikirim. Panduan ini akan membantumu mendiagnosis dan memperbaiki masalah tersebut secara sistematis.

## Gejala Umum

Sebelum masuk ke langkah perbaikan, kenali dulu gejala-gejala berikut:

- Agen membalas seolah-olah tidak menerima gambar sama sekali
- Agen merespons dengan teks seperti "Saya tidak bisa melihat gambar yang kamu kirim"
- Agen hanya membaca teks tetapi mengabaikan attachment gambar
- Tidak ada error yang terlihat, tapi agen tidak mendeskripsikan isi gambar

---

## Penyebab Utama

Masalah ini hampir selalu disebabkan oleh **konfigurasi vision yang belum diaktifkan** di salah satu (atau beberapa) dari tiga tempat berikut:

1. **Pengaturan Model** — Model yang digunakan harus mendukung dan mengaktifkan fitur vision
2. **Pengaturan Umum (General Settings)** — Fitur vision harus diaktifkan di level sistem
3. **Pengaturan Agen** — Setiap agen individual harus mengaktifkan pemrosesan gambar

Ketiga pengaturan ini harus **semuanya enabled**. Jika salah satu saja mati, agen tidak akan bisa memproses gambar.

---

## Langkah 1: Periksa Pengaturan Model

Pastikan model yang kamu gunakan mendukung vision dan fiturnya sudah diaktifkan.

### Cara Memeriksa:

1. Buka halaman **Model Settings** di dashboard Evonic
2. Pilih model yang digunakan oleh agen kamu (misalnya: Mimo v2.5, GPT-4 Vision, Claude, dll.)
3. Cari toggle atau checkbox untuk **Vision** atau **Image Processing**
4. Pastikan toggle tersebut dalam posisi **Enabled**

> **Catatan**: Tidak semua model mendukung vision. Model seperti GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro, dan Llama 3.2 Vision memiliki kemampuan ini. Model text-only seperti GPT-3.5 atau Llama 3.1 (non-vision) tidak bisa memproses gambar.

### Jika Model Tidak Mendukung Vision:

- Ganti ke model yang mendukung vision dari daftar model yang tersedia
- Untuk model lokal, pastikan kamu menggunakan varian vision (misal: `llava` atau `llama3.2-vision` alih-alih varian text-only)

---

## Langkah 2: Periksa Pengaturan Umum (General Settings)

Setelah model diaktifkan, pastikan fitur vision juga diaktifkan di level sistem.

### Cara Memeriksa:

1. Buka halaman **General Settings** di dashboard Evonic
2. Cari bagian yang berkaitan dengan **Vision**, **Image**, atau **Multimodal**
3. Pastikan toggle atau opsi untuk pemrosesan gambar dalam posisi **Enabled**

Pengaturan ini berlaku secara global — jika dinonaktifkan di sini, tidak ada agen yang bisa memproses gambar meskipun pengaturan model dan agen sudah benar.

---

## Langkah 3: Periksa Pengaturan Agen

Langkah terakhir dan paling sering terlewat: pastikan agen spesifik yang kamu gunakan sudah diaktifkan untuk memproses gambar.

### Cara Memeriksa:

1. Buka halaman **Agents** di dashboard Evonic
2. Pilih agen yang mengalami masalah
3. Buka tab **Settings** atau **Configuration**
4. Cari pengaturan untuk **Image Processing**, **Vision**, atau **Attachment Handling**
5. Pastikan opsi tersebut dalam posisi **Enabled**

> **Tips**: Jika kamu menggunakan banyak agen, periksa pengaturan ini untuk setiap agen yang perlu memproses gambar. Pengaturan vision bersifat per-agen.

---

## Langkah 4: Verifikasi Setelah Perbaikan

Setelah memastikan ketiga pengaturan di atas sudah enabled:

1. **Restart agen** jika perlu (beberapa perubahan memerlukan restart)
2. Kirim gambar uji ke agen melalui channel yang biasa kamu gunakan
3. Minta agen untuk mendeskripsikan isi gambar
4. Jika agen berhasil mendeskripsikan gambar, masalah sudah teratasi

---

## Checklist Cepat

Gunakan checklist ini untuk memastikan tidak ada yang terlewat:

- [ ] Model mendukung vision (GPT-4o, Claude, Gemini Vision, Llama Vision, dll.)
- [ ] Vision diaktifkan di **Model Settings**
- [ ] Vision diaktifkan di **General Settings**
- [ ] Image processing diaktifkan di **Agent Settings**
- [ ] Agen sudah di-restart setelah perubahan
- [ ] Gambar uji berhasil diproses

---

## Masih Mengalami Masalah?

Jika ketiga pengaturan di atas sudah benar tetapi agen tetap tidak bisa memproses gambar:

- **Cek format gambar**: Pastikan format gambar didukung (JPEG, PNG, GIF, WebP umumnya didukung; format khusus seperti HEIC mungkin tidak)
- **Cek ukuran gambar**: Beberapa model memiliki batasan ukuran gambar. Coba kirim gambar dengan resolusi lebih kecil
- **Cek koneksi model**: Jika menggunakan model cloud (API), pastikan koneksi internet stabil dan API key valid
- **Cek log agen**: Buka log agen untuk melihat apakah ada error spesifik terkait pemrosesan gambar
- **Coba channel berbeda**: Jika kamu menggunakan WhatsApp, coba kirim gambar melalui Telegram atau web chat untuk mengisolasi apakah masalahnya di channel atau di agen

---

## Referensi

Solusi ini didasarkan pada [GitHub Issue #90](https://github.com/anvie/evonic/issues/90#issuecomment-5025562704) di repositori Evonic. Jika kamu menemukan pola kegagalan baru, silakan laporkan melalui GitHub Issues.
