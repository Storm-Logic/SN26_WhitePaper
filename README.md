# Perturb AI — Frontend

The official website and playground for **Perturb AI**, a decentralized adversarial robustness network built on Bittensor. The platform allows users to stress-test AI image classifiers against adversarial perturbation attacks.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI Components | [shadcn/ui](https://ui.shadcn.com/) + Radix UI |
| Animations | Framer Motion |
| State / Data Fetching | TanStack Query v5 |
| Forms | React Hook Form + Zod |
| Internationalisation | i18next |
| Auth | JWT (httpOnly cookie) + Google OAuth |
| Image Hosting | Cloudflare R2 (via presigned URLs) |

---

## Project Structure

```
app/                   # Next.js App Router pages
├── page.tsx           # Landing page
├── playground/        # Adversarial playground & job history
├── blog/              # Blog
├── whitepaper/        # Whitepaper viewer
├── profile/           # User profile
├── admin/             # Admin dashboard
├── login/             # Auth pages
└── register/

src/
├── components/
│   ├── perturb/       # Feature-specific components (Hero, Navbar, Playground, …)
│   └── ui/            # shadcn/ui primitives
├── hooks/             # Custom React hooks
├── i18n/              # Translation resources (en + additional locales)
└── lib/
    ├── api.ts         # Typed API client (wraps REST calls to the backend)
    └── utils.ts       # Shared utilities

public/
├── assets/            # Static images and media
├── downloads/         # Whitepaper HTML
└── logo/              # Brand assets
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm, yarn, or pnpm

### Install dependencies

```bash
npm install
```

### Environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:4001
```

> For production, point this at `https://api.perturbai.io`.

### Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format all files with Prettier |

---

## API

The frontend communicates with a separate REST backend. Full API documentation is available in [API.md](./API.md).

**Base URL:** `https://api.perturbai.io`  
**Local dev:** `http://localhost:4001`

### Authentication

- **JWT cookie** — set automatically on login/register (`httpOnly` cookie named `token`).
- **Google OAuth** — available via `/auth/google`.

### User Roles

| Role | Capabilities |
|---|---|
| `general` | Browse the site; cannot submit jobs |
| `granted` | Submit images for adversarial processing |
| `admin` | Full access including admin dashboard |

---

## Key Features

- **Adversarial Playground** — Upload an image, classify it with an AI model, then trigger an adversarial perturbation to see how the model can be fooled.
- **Job History** — View all previously submitted jobs and their results.
- **Dark / Light Theme** — System-aware with manual toggle.
- **Internationalisation** — Multi-language support via i18next.
- **Whitepaper** — Embedded HTML whitepaper viewer.
- **Blog** — Editorial content section.
- **Admin Dashboard** — Manage users and jobs (admin role required).

---

## Deployment

The project is a standard Next.js application and can be deployed to any platform that supports it (Vercel, AWS, Docker, etc.).

```bash
npm run build
npm run start
```
