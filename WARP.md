# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Nova is an AI-powered email client built as a TypeScript monorepo using Turborepo. It provides Gmail integration with OAuth2 authentication and features a modern Next.js frontend with a tRPC API backend.

## Essential Commands

### Development Workflow
```bash
# Install dependencies (pnpm is required - uses workspaces)
pnpm install

# Start all development servers (both frontend and backend)
pnpm dev

# Build all packages for production
pnpm build

# Lint all packages
pnpm lint

# Format code (Prettier with tabs, 80-char width)
pnpm format

# Check formatting without fixing
pnpm format:check
```

### Package-Specific Commands
```bash
# Run server only (Express + tRPC backend)
pnpm --filter @nova/server dev

# Run web app only (Next.js frontend)
pnpm --filter @nova/web dev

# Build specific package
pnpm --filter @nova/web build

# Open Prisma Studio for database management
pnpm --filter @nova/server studio
```

### Adding UI Components
```bash
# Add shadcn components to the web app (run from project root)
pnpm dlx shadcn@latest add button -c apps/web
```

## Architecture Overview

### Monorepo Structure
- **`src/apps/server/`** - Express + tRPC API server with Prisma ORM
- **`src/apps/web/`** - Next.js 15 frontend with Turbopack dev server
- **`src/packages/mail/`** - Shared Gmail API client (`GoogleMailManager`)
- **`src/packages/ui/`** - Shared Radix UI + Tailwind components
- **`src/packages/{eslint-config,typescript-config}/`** - Shared tooling configurations

### Tech Stack
- **Frontend**: Next.js 15, React 19, TanStack Query, Zustand, Tailwind CSS
- **Backend**: Express, tRPC, Prisma ORM, PostgreSQL
- **Authentication**: NextAuth with Google OAuth2
- **Gmail Integration**: Google Gmail API with automatic batching
- **Package Management**: pnpm with workspaces
- **Build System**: Turborepo for task orchestration

## Key Patterns & Architecture

### Authentication Flow
- NextAuth session cookies (`next-auth.session-token`)
- Server middleware validates tokens and creates `GoogleMailManager` instances
- Access token refresh handled automatically in tRPC middleware
- User OAuth tokens stored in Prisma database

### tRPC API Design
- **Type-safe API**: Router types exported from `src/apps/server/src/routers/index.ts`
- **Protected procedures**: Use `protectedProcedure` which auto-injects `mailManager` and `userEmail`
- **Client setup**: Typed tRPC React client in `src/apps/web/src/lib/client.ts`
- **Provider pattern**: `TRPCProvider` wraps the entire app

### Gmail Integration
- **Core class**: `GoogleMailManager` handles all Gmail API operations
- **Batch requests**: Uses `@jrmdayn/googleapis-batcher` for efficient API calls
- **Thread-based**: All email operations work on Gmail threads, not individual messages
- **Auto-batching**: Multiple Gmail API calls are automatically batched for performance

### State Management
- **Server state**: TanStack Query for all API calls with automatic caching
- **Client state**: Zustand stores for UI state management
- **Infinite queries**: Cursor-based pagination for email lists

### UI Component System
- **Import pattern**: `import { Button } from "@nova/ui/components/button"`
- **Theme**: Dark theme by default (`className="dark"` on html)
- **Styling**: Tailwind CSS with custom scrollbar utilities
- **Icons**: Lucide React throughout the application

## Database & Schema

- **Prisma schema**: `src/apps/server/prisma/schema.prisma`
- **Generated client**: Custom output location at `src/apps/server/generated/prisma/`
- **Database**: PostgreSQL with connection string in `.env`
- **User model**: Stores OAuth tokens and user information

## Development Guidelines

### Package Structure Rules
- Use `@nova/package-name` imports between workspace packages
- Export server types from `src/apps/server/src/routers/index.ts` for client consumption
- Define shared schemas in `src/apps/server/src/schemas/` for both apps
- All UI components use explicit exports in `package.json` exports field

### Common Development Tasks
- **Add tRPC endpoint**: Create procedure in router, export types, use in client with `trpc.endpoint.useQuery()`
- **Add UI component**: Place in `src/packages/ui/src/components/`, add to package exports
- **Database changes**: Update Prisma schema, run migrations, regenerate client
- **Gmail operations**: Extend `GoogleMailManager` class, expose via tRPC procedures

### Environment Configuration
- **Environment files**: `.env` in project root contains Google OAuth credentials
- **Frontend URL**: `http://localhost:3000` (Next.js)
- **Backend URL**: `http://localhost:8000/trpc` (Express + tRPC)
- **Database**: PostgreSQL connection via `DATABASE_URL`

## Code Formatting & Standards

- **Prettier**: Configured with tabs, 80-character line width, semicolons enabled
- **ESLint**: Shared configuration across all packages
- **TypeScript**: Strict mode enabled with shared configurations
- **Git**: Includes `.gitignore` for Next.js, Node.js, and database files

This codebase emphasizes type safety, efficient Gmail API usage through batching, and a clean separation between the tRPC backend and Next.js frontend within a well-organized monorepo structure.
