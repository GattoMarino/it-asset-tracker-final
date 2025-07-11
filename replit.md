# PC Asset Manager - Replit.md

## Overview
This is a full-stack PC Asset Management application built with React (frontend) and Express.js (backend). The application allows organizations to track and manage computer assets across different clients, including detailed information about hardware specifications, warranties, assignments, and maintenance history.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack Query (React Query) for server state
- **UI Components**: Radix UI primitives with custom shadcn/ui components
- **Styling**: Tailwind CSS with CSS variables for theming
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM with migrations support
- **API**: RESTful endpoints with proper error handling
- **Session Management**: PostgreSQL-backed sessions (connect-pg-simple)

### Key Technologies
- **Language**: TypeScript throughout the entire stack
- **Database**: PostgreSQL with Drizzle ORM
- **Validation**: Zod schemas shared between frontend and backend
- **Date Handling**: date-fns library
- **Icons**: Lucide React

## Key Components

### Database Schema
Located in `shared/schema.ts` with three main entities:
- **Clients**: Organizations that own computers
- **Computers**: Individual PC assets with specifications, status, and assignments
- **Computer History**: Audit trail of all changes and actions

### Frontend Pages
- **Dashboard**: Overview with statistics and recent activity
- **Computers**: Searchable/filterable list of all PCs with detailed view modal
- **Clients**: Client management with statistics per client
- **Add PC**: Form for adding new computer assets
- **Reports**: Report generation functionality

### Backend Services
- **Storage Layer**: Abstracted database operations in `server/storage.ts`
- **Routes**: RESTful API endpoints in `server/routes.ts`
- **Database Connection**: Neon PostgreSQL setup in `server/db.ts`

## Data Flow

### Frontend Data Management
1. TanStack Query handles all server state with automatic caching and synchronization
2. Forms use React Hook Form with Zod validation for type safety
3. Shared schema types ensure consistency between client and server
4. Optimistic updates and error handling through query mutations

### Backend Data Management
1. Express middleware handles request parsing and logging
2. Zod schemas validate incoming data at API boundaries
3. Drizzle ORM provides type-safe database operations
4. Storage layer abstracts database logic from route handlers

### Authentication & Sessions
- PostgreSQL-backed sessions using connect-pg-simple
- Session middleware configured for secure cookie handling
- Ready for authentication implementation

## External Dependencies

### UI & Styling
- Radix UI: Accessible component primitives
- Tailwind CSS: Utility-first styling framework
- Lucide React: Icon library
- shadcn/ui: Pre-built component library

### Data & State Management
- TanStack Query: Server state management
- React Hook Form: Form handling
- Zod: Runtime type validation
- Drizzle ORM: Type-safe database operations

### Development Tools
- Vite: Fast build tool and dev server
- TypeScript: Type safety across the stack
- Replit integrations: Error overlay and cartographer plugins

## Deployment Strategy

### Development Setup
- Vite dev server with HMR for frontend development
- tsx for running TypeScript server code directly
- Replit-specific plugins for enhanced development experience

### Production Build
- Frontend: Vite builds optimized React bundle to `dist/public`
- Backend: esbuild bundles server code to `dist/index.js`
- Database: Drizzle migrations handle schema changes

### Environment Configuration
- DATABASE_URL: PostgreSQL connection string (required)
- NODE_ENV: Environment detection for development/production features
- Replit-specific environment variables for tooling integration

### Database Management
- Drizzle Kit handles migrations with `db:push` command
- PostgreSQL schema defined in shared directory for consistency
- Neon serverless PostgreSQL recommended for deployment

The application follows a conventional full-stack TypeScript architecture with strong type safety, modern tooling, and a clean separation of concerns between frontend presentation, backend API, and data persistence layers.