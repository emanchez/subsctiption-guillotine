# Sub Guillotine 🗡️

A subscription management app to track, manage, and cut unnecessary subscriptions before they renew.

## Overview

Sub Guillotine helps you monitor recurring subscriptions, track renewal dates, and avoid surprise charges. Built as a full-stack Next.js application with TypeScript, Prisma, and SQLite.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: SQLite (local dev) via Prisma ORM
- **Testing**: Vitest
- **Styling**: Tailwind CSS

## Features

- Dashboard view of active subscriptions
- Track subscription cost, cycle (monthly/yearly), and renewal dates
- (IN PROGRESS)Server-side validation and mapping (API ↔ Domain)
- (TODO)Add/edit subscriptions
- (TODO)Renewal reminders (scheduled job)
- (TODO)Total spend calculation

## Getting Started

### Prerequisites

- Node.js 18+ (tested on Node 20)
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Seed the local database
npx prisma db seed
```

### Development

```bash
# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Testing

```bash
# Run tests
npm test

# or with Vitest directly
npx vitest
```

### Database

The project uses SQLite for local development. The database file is located at `src/backend/dev.db`.

```bash
# View database in Prisma Studio
npx prisma studio

# Re-seed database
npx prisma db seed

# Run migrations
npx prisma migrate dev
```

## Project Structure

```
src/
├── app/
│   ├── api/subscriptions/     # API routes
│   ├── dashboard/             # Dashboard page (bare bones/no styling yet)
│   └── page.tsx               # Home page (still standard Next.js at the moment)
├── lib/
│   ├── mappers/               # DB ↔ Domain mapping
│   ├── serializers/           # Domain ↔ API serialization
│   ├── validators/            # Runtime validation
│   ├── types/                 # TypeScript types
│   └── util/                  # Helper functions
└── components/                # React components

prisma/
├── schema.prisma              # Database schema
└── seed.ts                    # Seed script
```

## License

MIT
