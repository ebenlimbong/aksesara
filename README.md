# Aksesara — Ekstensi Browser Adaptif & Platform Aksesibilitas Formulir Web

**Aksesara** adalah ekstensi browser pendamping formulir digital untuk membantu pengisian formulir web secara bertahap, mudah dipahami, dan lebih aksesibel. Karya ini dikembangkan untuk Divisi Pengembangan Perangkat Lunak GEMASTIK XIX 2026.

---

## Arsitektur Monorepo

```text
aksesara/
├── apps/
│   ├── extension/          # WXT Manifest V3 Browser Extension (React + Tailwind CSS)
│   │   └── dist-extension/ # Folder build ekstensi siap pakai (Load Unpacked di Chrome)
│   ├── api/                # NestJS + Fastify REST API Backend (Swagger di /api/v1/docs)
│   └── web/                # Aksesara Landing Page, Developer Docs & AI Review Console
├── packages/
│   ├── form-schema/        # Zod schemas & TypeScript definitions
│   ├── form-parser/        # Pure DOM Scanner & Label Resolver (9-step priority)
│   ├── sync-engine/        # Two-Way DOM Synchronization & Focus Highlighter
│   ├── bridge-sdk/         # @aksesara/bridge SDK untuk integrasi situs resmi kampus
│   └── ui/                 # Accessible UI theme tokens & preferences
├── prisma/
│   ├── schema.prisma       # PostgreSQL Database Schema
│   └── seed.ts             # Script seed data awal
└── docs/                   # Dokumentasi arsitektur, ADR, progress, dan pengujian
```

---

## Panduan Memulai untuk Kolaborator (Collaborator Onboarding)

Bagi kolaborator yang baru saja me-clone repository ini, ikuti langkah-langkah penyiapan proyek berikut:

### 1. Prasyarat Sistem
- **Node.js**: v18+ atau v20+
- **PostgreSQL**: Pastikan service PostgreSQL sudah terinstal dan aktif di komputer lokal Anda.

### 2. Instalasi Dependensi Monorepo
Jalankan perintah berikut di folder utama (*root*) proyek:
```bash
npx pnpm@9 install
```

### 3. Konfigurasi Environment & Database PostgreSQL
Salin file template environment `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```

Buat user dan database PostgreSQL di komputer lokal Anda, lalu sesuaikan URL koneksi database pada file `.env` lokal Anda:
```env
DATABASE_URL="postgresql://<username>:<password>@localhost:5432/<database_name>?schema=public"
```

*(Contoh perintah pembuatan user dan database via `psql` atau PostgreSQL admin tool)*:
```sql
CREATE USER <username> WITH PASSWORD '<password>' SUPERUSER;
CREATE DATABASE <database_name> OWNER <username>;
```

Jalankan perintah Prisma untuk membuat struktur tabel dan mengisi data awal (*seed*):
```bash
npx pnpm@9 db:generate
npx pnpm@9 db:seed
```

### 4. Menjalankan Server Pengembang (Web Console & API Backend)
Jalankan dev server monorepo:
```bash
npx pnpm@9 dev
```
Aplikasi akan berjalan pada alamat berikut:
- **Web Console & Landing Page**: [http://localhost:3000](http://localhost:3000)
- **REST API Backend & Swagger**: [http://localhost:4000/api/v1/docs](http://localhost:4000/api/v1/docs)

### 5. Memuat Ekstensi Browser di Chrome
1. Jalankan perintah build ekstensi:
   ```bash
   npx pnpm@9 build
   ```
2. Buka **Google Chrome**, navigasi ke alamat: `chrome://extensions/`
3. Aktifkan **Developer mode** di sudut kanan atas.
4. Klik tombol **Load unpacked**, lalu pilih folder build ekstensi yang berada di:
   ```text
   /path-to-repository/aksesara/apps/extension/dist-extension
   ```

---

## Jaminan Keamanan & Privasi

1. **Zero Raw Value Transmission**: Jawaban pengguna, NIK, password, cookie, dan berkas tidak pernah dikirim ke AI atau server Aksesara.
2. **Sesi & Autentikasi Asli**: Pengguna tetap melakukan autentikasi dan pengiriman formulir langsung pada website institusi resmi.

---

## Dokumentasi

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — Arsitektur & Alur Data
- [docs/DECISIONS.md](docs/DECISIONS.md) — Architectural Decision Records (ADRs)
- [docs/PROGRESS.md](docs/PROGRESS.md) — Checklist Progres Fitur
