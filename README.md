# 🎵 myPod Pro

> **Lossless Streaming & Retro iPod Music Player** featuring interactive **3D Cover Flow**, dual themes (**Classic iPod & AMOLED Pitch Black**), comprehensive music search, artist discography, album views, and cloud library synchronization powered by **Neon PostgreSQL** and **BetterAuth**.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16.4-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3-blue)](https://react.dev/)

---

## ✨ Features

- **💿 Interactive 3D Cover Flow**: Authentic retro iPod Cover Flow experience with 3D album carousel, smooth animations, flip-to-tracklist inspection, and album playback.
- **🎨 Dual Themes**:
  - **Classic iPod**: Silver metallic finish, signature iPod display styling, high-contrast dark typography, authentic click-wheel feedback.
  - **AMOLED Pitch Black**: Modern edge-to-edge dark aesthetic designed for OLED screens.
- **🎧 Lossless Audio Streaming Engine**:
  - Multi-client streaming fallback pipeline (VisionOS, Android VR, iOS, Web, YT Music).
  - Configurable streaming quality tiers (Lossless, High, Medium, Low).
  - Dynamic byte-range proxying with high-speed in-memory caching.
- **🔍 Comprehensive Music Search**:
  - Dedicated tabs for **Songs**, **Albums**, and **Artists** (20+ results per category).
  - Sorting controls: Relevance, Title (A-Z), Artist (A-Z), Duration, Album (A-Z).
- **🎤 Artist Profiles & Full Discographies**:
  - 20+ top tracks with expandable catalog view.
  - Complete studio album discography with direct drill-down.
  - Play All, Shuffle, and Bio.
- **📀 Full Album Screen**:
  - Complete numbered tracklists with durations and release metadata.
  - Sequential playback, shuffle, and single-click "Like All" batching to Cover Flow.
- **☁️ Cloud Sync & Authentication**:
  - User authentication with **BetterAuth**.
  - Serverless PostgreSQL persistence with **Neon Database**.
  - Auto-sync for liked songs, playlists, and user settings.
- **🔋 Functional Status Bar**: Real-time battery status indicator (including iPod charging bolt animation when plugged in) and theme switcher.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.18+ or v20+)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)
- A free [Neon Database](https://neon.tech) PostgreSQL project (optional for local playback, required for library sync)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Piyush-Fr/mypodpro.git
   cd mypodpro
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your configuration:
   ```env
   # Neon PostgreSQL Database URL
   DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@ep-sample-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require

   # Better Auth Secret (32+ characters)
   BETTER_AUTH_SECRET=your_32_character_minimum_random_secret_string_here

   # Application Base URL
   BETTER_AUTH_URL=http://localhost:3000
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Initialize Database Tables (if using Neon DB):**
   Execute the schema found in [`scripts/init_neon_db.sql`](scripts/init_neon_db.sql) in your Neon SQL editor, or run:
   ```bash
   node scripts/migrate_neon.js
   ```

5. **Start Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

6. **Build for Production:**
   ```bash
   npm run build
   npm run start
   ```

---

## 🔒 Security & Privacy

- **Safe Credential Handling**: All sensitive environment variables (`.env*`) are strictly gitignored. Real database strings and secrets are never committed.
- **SSRF Mitigation**: Audio streaming proxy validates endpoint URLs against trusted CDN hostname allowlists.
- **Input Validation**: Video IDs are validated against strict alphanumeric patterns; query inputs and category selectors are strictly bounded.
- **Memory Bounded Caches**: In-memory caching uses size-bounded evictions to prevent denial-of-service via memory exhaustion.
- **Security Headers**: Production builds enforce `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, and `X-XSS-Protection`.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **Frontend**: [React](https://react.dev/), [GSAP](https://gsap.com/) (animations), [Lucide React](https://lucide.dev/) (icons)
- **Database**: [Neon Serverless PostgreSQL](https://neon.tech/)
- **Auth**: [BetterAuth](https://better-auth.com/)
- **Audio & Metadata**: [YouTube.js / InnerTube](https://github.com/LuanRT/YouTube.js)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
