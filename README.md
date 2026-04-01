
## Project Overview

Nclusion-Rent is a full-stack TypeScript application for real estate/property management. The codebase lives under `ui/` with separate packages for the backend API and React frontend.

## Repository Structure

```
ui/
├── api/          # Express.js backend (Node 18, TypeScript)
├── rent/         # React 19 frontend (Vite, "ecme" package)
├── retool/       # Tailwind CSS framework for Retool
├── template/demo/# Demo template app
└── report/       # Reporting module
```

## Development Commands

### Backend (`ui/api/`)
```bash
npm run dev          # Start dev server with nodemon + ts-node (watches src/)
npm run build        # TypeScript compile + tsc-alias path resolution
npm start            # Run compiled output (node src/index.js)
npm run format       # Prettier format
npm run format:check # Prettier check
```

### Frontend (`ui/rent/`)
```bash
npm run dev      # Vite dev server (port 5173)
npm run build    # Production build → ./build/
npm run preview  # Preview production build
npm run format   # Prettier + ESLint fix
```

### Testing
No test framework is configured in either package. Husky pre-commit hooks reference `npm test` but the script does not exist — commits may require `--no-verify` or the hook needs to be updated.

## Architecture

### Backend (Damba Framework)
The API uses Express.

**API base path**: `/api/v1` (configured via `BASE_PATH` env var).

### Frontend
- **State management**: Zustand stores in `src/store/` (authStore, themeStore, localeStore, routeKeyStore)
- **Auth**: Firebase Authentication with multiple providers (Google, GitHub) via `src/auth/` (AuthContext, AuthProvider, useAuth hook) and `src/services/firebase/`
- **Routing**: React Router v6 with protected/public route configs in `src/configs/routes.config/`
- **i18n**: react-i18next with locale files in `src/locales/lang/`
- **Feature flags**: Statsig SDK
- **Path alias**: `@/*` maps to `src/*`

### Dev Proxy
Vite proxies `/api` requests to `http://localhost:3000` during development.

## Key Conventions

### TypeScript & Formatting
- **Backend**: Semicolons, single quotes, trailing commas, 100 char width
- **Frontend**: No semicolons, single quotes, 4-space tabs
- Backend uses `src/*` path alias; frontend uses `@/*` path alias

### Deployment
- Vercel serverless deployment (see `vercel.json`)
- API builds to `api/dist/` as serverless functions (Node 18.x)
- All routes funnel to `/api/dist/index.js`
- Docker also available via `ui/api/Dockerfile` (exposes port 3005)
