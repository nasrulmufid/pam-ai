# PAM AI — Programer Asisten Manager

PAM AI adalah aplikasi chatbot AI modern yang difokuskan sebagai **asisten pemrograman dan software development**. Aplikasi ini dibangun dengan React, TypeScript, Tailwind CSS, Express, dan Google Gemini API.

PAM AI dirancang untuk membantu aktivitas developer seperti menulis kode, debugging, refactoring, code review, perancangan API dan database, deployment, Git, terminal, serta dokumentasi teknis.

## Fitur Utama

- UI chat modern dan responsif untuk desktop maupun mobile.
- Mode terang dan gelap.
- Multi-conversation dengan fitur membuat, mencari, memilih, dan menghapus chat.
- Riwayat percakapan disimpan di browser menggunakan `localStorage`.
- Respons Gemini ditampilkan secara streaming.
- Mendukung Markdown dan GitHub Flavored Markdown.
- Tombol untuk menghentikan proses generate respons.
- API key Gemini hanya digunakan di backend dan tidak dikirim ke browser.
- Instruksi/role AI dapat diatur melalui `instructions-model.md`.
- Validasi request menggunakan Zod.
- Rate limiting pada endpoint API Express untuk local/VPS/Docker.
- Security headers menggunakan Helmet.
- Response compression.
- Siap dijalankan secara lokal, VPS, Docker, maupun Vercel.

## Screenshot

<p align="center">
  <img src="./file_000000005418820bb91b683b6ef25001.png" alt="PAM AI Android Mockup" width="900" />
</p>

<p align="center">
  Tampilan PAM AI pada perangkat Android.
</p>

## Tech Stack

### Frontend

- React 19
- TypeScript
- Vite 7
- Tailwind CSS 4
- Radix UI
- Lucide React
- React Markdown
- Remark GFM

### Backend

- Node.js 22+
- Express 5
- Google Gemini API melalui `@google/genai`
- Zod
- Helmet
- Express Rate Limit
- Compression

## Arsitektur Singkat

Pada mode development, frontend dan backend berjalan pada port yang berbeda:

```text
Browser
  |
  | http://localhost:5173
  v
Vite + React
  |
  | /api/*
  | Vite Proxy
  v
Express :3001
  |
  v
Google Gemini API
```

Pada mode production, Express juga melayani hasil build frontend dari folder `dist`, sehingga aplikasi cukup diakses melalui satu port:

```text
Browser
  |
  | http://localhost:3001
  v
Express
  |-- Static React build
  |-- /api/chat
  |-- /api/health
  |
  v
Google Gemini API
```

## Persyaratan

Untuk menjalankan secara lokal:

- Node.js 22 atau lebih baru direkomendasikan.
- npm.
- Git.
- Gemini API Key.

Untuk menjalankan dengan Docker:

- Docker.
- Docker Compose.
- Gemini API Key.

## Clone Repository

```bash
git clone https://github.com/nasrulmufid/pam-ai.git
cd pam-ai
```

## Konfigurasi Environment

Salin file contoh environment:

### Linux / macOS

```bash
cp .env.example .env
```

### Windows CMD

```cmd
copy .env.example .env
```

### Windows PowerShell

```powershell
Copy-Item .env.example .env
```

Kemudian edit file `.env`:

```env
GEMINI_API_KEY=your_google_ai_studio_api_key

GEMINI_MODEL=gemini-3.5-flash

PORT=3001

GEMINI_TEMPERATURE=0.7
GEMINI_MAX_OUTPUT_TOKENS=8192

RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=30
```

### Environment Variable

| Variable | Wajib | Default | Keterangan |
|---|---|---|---|
| `GEMINI_API_KEY` | Ya | - | API key Google Gemini. |
| `GEMINI_MODEL` | Tidak | `gemini-3.5-flash` | Model Gemini yang digunakan. |
| `PORT` | Tidak | `3001` | Port backend/production server. |
| `GEMINI_TEMPERATURE` | Tidak | `0.7` | Mengatur variasi respons model. |
| `GEMINI_MAX_OUTPUT_TOKENS` | Tidak | `8192` | Batas maksimum output model. |
| `RATE_LIMIT_WINDOW_MS` | Tidak | `60000` | Durasi window rate limit dalam milidetik. |
| `RATE_LIMIT_MAX` | Tidak | `30` | Maksimum request API per IP dalam satu window. |

> Jangan pernah menaruh `GEMINI_API_KEY` pada variable dengan prefix `VITE_`, karena variable tersebut dapat ikut masuk ke bundle frontend dan terlihat oleh pengguna browser.

## Menjalankan di Local — Development

Install dependency:

```bash
npm install
```

Pastikan file `.env` sudah berisi `GEMINI_API_KEY`, lalu jalankan:

```bash
npm run dev
```

Perintah tersebut menjalankan:

- Vite frontend di `http://localhost:5173`.
- Express API di `http://localhost:3001`.
- Proxy Vite dari `/api` menuju backend port `3001`.

Buka aplikasi:

```text
http://localhost:5173
```

Untuk menghentikan development server tekan:

```text
Ctrl + C
```

## Menjalankan Production Tanpa Docker

Install dependency:

```bash
npm install
```

Build frontend:

```bash
npm run build
```

Hasil build akan dibuat pada folder:

```text
dist/
```

Jalankan production server:

```bash
npm start
```

Buka:

```text
http://localhost:3001
```

Pada mode production, Express akan melayani frontend hasil build sekaligus endpoint API.

## Deploy ke Vercel

Repository ini sudah mendukung deployment langsung ke Vercel.

Pada Vercel, frontend tetap dibangun menggunakan Vite, sedangkan backend menggunakan Vercel Functions:

```text
Browser
  |
  | https://domain-vercel.app
  v
React + Vite
  |
  | /api/chat
  v
Vercel Function
  |
  v
Google Gemini API
```

File yang digunakan khusus untuk Vercel:

```text
api/
├── chat.mjs       # POST /api/chat
└── health.mjs     # GET /api/health

vercel.json         # Konfigurasi Vercel Functions
```

### 1. Import Repository ke Vercel

Buka Vercel Dashboard lalu pilih:

```text
Add New
→ Project
→ Import Git Repository
→ nasrulmufid/pam-ai
```

Vercel akan mendeteksi project sebagai Vite.

Pengaturan build yang digunakan:

```text
Framework Preset : Vite
Build Command    : npm run build
Output Directory : dist
Install Command  : npm install
```

Biasanya pengaturan tersebut terdeteksi otomatis sehingga tidak perlu diubah.

### 2. Tambahkan Environment Variables

Masuk ke:

```text
Vercel Dashboard
→ Project PAM AI
→ Settings
→ Environment Variables
```

Tambahkan minimal:

```env
GEMINI_API_KEY=API_KEY_GEMINI_ANDA
```

Environment variable tambahan yang dapat digunakan:

```env
GEMINI_MODEL=gemini-3.5-flash
GEMINI_TEMPERATURE=0.7
GEMINI_MAX_OUTPUT_TOKENS=8192
```

Sebaiknya aktifkan variable tersebut untuk environment:

```text
Production
Preview
Development
```

> Jangan menggunakan `VITE_GEMINI_API_KEY`. API key harus tetap menjadi server-side environment variable agar tidak masuk ke bundle frontend.

### 3. Deploy

Jika project sudah terhubung dengan GitHub, push ke branch yang digunakan Vercel akan memicu deployment baru secara otomatis.

Anda juga dapat menjalankan redeploy dari:

```text
Vercel Dashboard
→ Deployments
→ pilih deployment
→ Redeploy
```

### 4. Cek Health Endpoint

Setelah deployment selesai, buka:

```text
https://DOMAIN_ANDA.vercel.app/api/health
```

Contoh response:

```json
{
  "ok": true,
  "model": "gemini-3.5-flash",
  "runtime": "vercel"
}
```

Jika endpoint tersebut mengembalikan JSON di atas, Vercel Function sudah aktif.

### 5. Tes Chat

Frontend menggunakan endpoint:

```text
POST /api/chat
```

Karena menggunakan relative URL, frontend otomatis memanggil domain Vercel yang sama:

```text
https://DOMAIN_ANDA.vercel.app/api/chat
```

Tidak perlu mengubah `src/lib/api.ts`.

### Troubleshooting Vercel

#### `/api/chat` menghasilkan 404

Pastikan repository yang di-deploy sudah memiliki:

```text
api/chat.mjs
api/health.mjs
vercel.json
```

Kemudian lakukan redeploy.

#### Chat menghasilkan error konfigurasi server

Pastikan `GEMINI_API_KEY` sudah ditambahkan pada Environment Variables Vercel.

Setelah menambah atau mengubah environment variable, lakukan deployment ulang agar nilai terbaru digunakan oleh function.

#### Health endpoint bekerja tetapi chat gagal

Pastikan `GEMINI_MODEL` di Vercel menggunakan model yang tersedia untuk project/API key Anda. Untuk project baru, gunakan model Gemini generasi terbaru, misalnya:

```env
GEMINI_MODEL=gemini-3.5-flash
```

Periksa Function Logs pada:

```text
Vercel Dashboard
→ Project
→ Logs
```

Kemungkinan penyebab antara lain API key tidak valid, quota Gemini habis, model tidak tersedia pada API key tersebut, atau request ke provider AI gagal.

### Catatan Arsitektur Vercel

Vercel tidak menggunakan `server/index.mjs` untuk melayani aplikasi production.

Pembagiannya adalah:

```text
Local development
    Vite :5173
       ↓
    Express :3001

VPS / Docker
    Express :3001
       ├── React dist
       └── Gemini API

Vercel
    Vite static build
       ↓
    /api/*.mjs
       ↓
    Vercel Functions
       ↓
    Gemini API
```

Dengan struktur ini, repository yang sama dapat digunakan untuk local development, VPS, Docker, dan Vercel tanpa mengubah URL API pada frontend.

## Menjalankan dengan Docker Compose

Pastikan file `.env` sudah dibuat dan `GEMINI_API_KEY` sudah diisi.

Build image dan jalankan container:

```bash
docker compose up -d --build
```

Cek container:

```bash
docker compose ps
```

Lihat log:

```bash
docker compose logs -f
```

Buka aplikasi:

```text
http://localhost:3001
```

Jika dijalankan pada VPS/server:

```text
http://IP_SERVER:3001
```

Menghentikan container:

```bash
docker compose down
```

Restart container:

```bash
docker compose restart
```

Build ulang setelah ada perubahan source code:

```bash
docker compose up -d --build
```

## Menjalankan dengan Docker Tanpa Compose

Build image:

```bash
docker build -t pam-ai .
```

Jalankan container menggunakan file `.env`:

```bash
docker run -d \
  --name pam-ai \
  --restart unless-stopped \
  --env-file .env \
  -p 3001:3001 \
  pam-ai
```

Cek log:

```bash
docker logs -f pam-ai
```

Menghentikan container:

```bash
docker stop pam-ai
```

Menjalankan kembali:

```bash
docker start pam-ai
```

Menghapus container:

```bash
docker rm -f pam-ai
```

## Mengecek API

PAM AI menyediakan health check:

```bash
curl http://localhost:3001/api/health
```

Contoh response:

```json
{
  "ok": true,
  "model": "gemini-3.5-flash"
}
```

Endpoint utama chat:

```text
POST /api/chat
```

Frontend menggunakan endpoint tersebut untuk mengirim riwayat percakapan dan menerima respons Gemini secara streaming.

## Mengatur Role dan Instruksi PAM AI

Perilaku utama model didefinisikan melalui:

```text
instructions-model.md
```

File ini digunakan sebagai `systemInstruction` ketika backend memanggil Gemini.

Anda dapat mengubah file tersebut untuk menyesuaikan:

- identitas PAM AI;
- ruang lingkup bantuan;
- gaya respons;
- aturan coding;
- batasan model;
- aturan keamanan.

Setelah mengubah `instructions-model.md`, restart backend karena file dibaca ketika Node.js server mulai berjalan.

### Local development

Server menggunakan `node --watch`, sehingga perubahan file dapat menyebabkan backend restart otomatis. Jika diperlukan, restart manual dengan menghentikan `npm run dev` lalu jalankan kembali.

### Docker

Setelah mengubah instruksi, image perlu dibangun ulang karena file tersebut disalin ke image:

```bash
docker compose up -d --build
```

## Penyimpanan Riwayat Chat

Saat ini riwayat percakapan disimpan pada `localStorage` browser.

Konsekuensinya:

- riwayat hanya tersedia di browser/perangkat yang sama;
- data tidak tersinkronisasi antar perangkat;
- menghapus site data/browser storage akan menghapus riwayat chat;
- backend saat ini tidak menggunakan database untuk menyimpan percakapan.

## Perintah npm

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Menjalankan Vite dan Express dalam mode development. |
| `npm run build` | Membuat production build frontend. |
| `npm start` | Menjalankan Express dalam mode production. |
| `npm run preview` | Preview hasil build Vite. |
| `npm run typecheck` | Menjalankan TypeScript type checking tanpa menghasilkan file build. |

Sebelum deployment, disarankan menjalankan:

```bash
npm run typecheck
npm run build
```

## Struktur Project

```text
pam-ai/
├── api/
│   ├── chat.mjs               # Vercel Function untuk chat
│   └── health.mjs             # Vercel health endpoint
├── server/
│   └── index.mjs              # Express API + integrasi Gemini
├── src/
│   ├── components/            # Komponen UI
│   ├── lib/                   # API client, storage, dan utility
│   ├── App.tsx                # Aplikasi utama
│   └── types.ts               # TypeScript types
├── .env.example               # Contoh environment variable
├── docker-compose.yml         # Docker Compose
├── Dockerfile                 # Multi-stage Docker image
├── instructions-model.md      # System instruction PAM AI
├── package.json
├── vite.config.ts
├── vercel.json                # Konfigurasi Vercel Functions
└── README.md
```

## Keamanan

Beberapa perlindungan yang sudah tersedia:

- Gemini API key hanya digunakan oleh backend.
- Helmet untuk HTTP security headers.
- Content Security Policy.
- Rate limiting pada route `/api`.
- Validasi request dengan Zod.
- Batas ukuran JSON request.
- Batas jumlah dan panjang pesan.
- Compression response.
- Header `X-Powered-By` Express dinonaktifkan.

Untuk deployment ke internet, gunakan HTTPS melalui reverse proxy seperti Nginx atau Caddy dan pertimbangkan menambahkan authentication jika aplikasi tidak dimaksudkan untuk penggunaan publik bebas.

## Troubleshooting

### Error `Missing GEMINI_API_KEY`

Pastikan file `.env` tersedia pada root project:

```bash
ls -la .env
```

Kemudian pastikan:

```env
GEMINI_API_KEY=API_KEY_ANDA
```

Setelah itu restart aplikasi.

### Port 3001 sudah digunakan

Ubah:

```env
PORT=3002
```

Untuk local production, aplikasi kemudian dapat diakses melalui port tersebut.

Untuk Docker Compose, jika hanya ingin mengganti port yang diekspos ke host, ubah bagian:

```yaml
ports:
  - "3002:3001"
```

Container tetap mendengarkan port `3001`, sedangkan host mengaksesnya melalui `3002`.

### Frontend development tidak dapat mengakses API

Pastikan backend port `3001` ikut berjalan melalui:

```bash
npm run dev
```

Konfigurasi Vite saat ini melakukan proxy:

```text
/api -> http://localhost:3001
```

### Docker container terus restart

Periksa log:

```bash
docker compose logs -f
```

Penyebab yang paling umum adalah `GEMINI_API_KEY` belum tersedia atau file `.env` belum dibuat.

## Deployment

Untuk deployment pada VPS, alur sederhana yang disarankan:

```text
Internet
   |
HTTPS :443
   |
Nginx / Caddy
   |
PAM AI :3001
   |
Gemini API
```

Port `3001` sebaiknya tidak diekspos langsung ke internet jika sudah menggunakan reverse proxy. Gunakan HTTPS pada deployment publik.

## Lisensi

Belum ada file lisensi khusus pada repository ini. Tambahkan `LICENSE` jika project akan didistribusikan atau digunakan oleh pihak lain dengan ketentuan lisensi tertentu.
