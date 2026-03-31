# AJI Mobile

AJI Mobile is a property management and financial operations platform built for **NYLC (Nclusion)**. It provides tools for managing bank locations, landlords, expense requests, lease contracts, and operational reporting across multiple regions in Haiti.

## Tech Stack

- **React 19** with TypeScript
- **Vite** for build and dev server
- **Tailwind CSS 4** for styling
- **Firebase** (Firestore, Authentication, Storage)
- **Zustand** for state management
- **React Router v6** for routing
- **react-i18next** for internationalization (French)
- **ApexCharts** for data visualization
- **React Hook Form + Zod** for form validation
- **TanStack Table** for data tables
- **Statsig** for feature flags

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Firebase project with Firestore, Auth, and Storage enabled

### Installation

```bash
cd ui/rent
npm install
```

### Environment Variables

Create a `.env` file in `ui/rent/` with your Firebase and API configuration:

```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### Development

```bash
npm run dev      # Start Vite dev server on port 5173
```

The dev server proxies `/api` requests to `http://localhost:3000`.

### Build

```bash
npm run build    # Production build → ./build/
npm run preview  # Preview production build locally
```

### Formatting

```bash
npm run format   # Run Prettier + ESLint fix
```

## Project Structure

```
src/
├── @types/              # Global TypeScript type definitions
├── assets/styles/       # Tailwind CSS and component styles
├── auth/                # AuthContext, AuthProvider, useAuth hook
├── components/
│   ├── shared/          # Reusable shared components (DebounceInput, DataTable, etc.)
│   └── ui/              # UI component library (Button, Card, Tabs, Dialog, etc.)
├── configs/
│   ├── app.config.ts    # App-level config (API prefix, locale, auth paths)
│   ├── routes.config/   # Route definitions with lazy loading and role-based access
│   └── navigation.config/ # Sidebar navigation structure
├── constants/           # Roles, navigation types, chart colors
├── locales/lang/        # i18n translation files (fr.json)
├── services/
│   └── firebase/        # Firestore collections, CRUD operations
├── store/               # Zustand stores (auth, theme, locale, routeKey)
├── utils/               # Hooks, helpers, RoleChecker
└── views/
    ├── Home.tsx          # Dashboard with KPIs, charts, request stats
    ├── bank/             # Bank location management (add, show, approval, review)
    ├── proprio/          # Landlord/entity management (add, show, edit)
    ├── request/          # Expense request workflow (add, show, approve, report)
    ├── report/           # Operational reporting
    ├── vendor/           # Vendor and contract management
    ├── Charts/           # Chart components (SimplePie)
    ├── Entity/           # Shared entities, regions, report steps
    └── shared/           # Shared view components
```

## Core Modules

### Bank Management

Manage bank locations through a multi-step workflow:

- **Add Bank** — Submit new bank locations with photos, map coordinates, and details
- **Approval Pipeline** — Banks progress through: Submitted → Approved → Contract → Renovation → Ready to Use
- **Review** — Detailed submission review with photos, documents, comments, and timeline
- **Operations** — View and manage operational (active) banks

### Landlord / Entity Management

- **Add/Edit Entities** — Register landlords, agents, and other entities
- **Search** — Case-insensitive search via `fullName_lower` field
- **Filter** — By region, role, and name
- **Admin Tools** — Data migration utilities

### Expense Requests

Multi-type request system supporting 10 categories:

| Type | Description |
|------|-------------|
| Transport & Logistique | Moving materials, POS, or personnel |
| OPEX | Operational purchases and supplies |
| Telecom | Internet/phone subscriptions |
| Locomotif | Motorcycle fuel and maintenance |
| CapEx | Equipment and long-term investments |
| Loyer (Lease) | Rent/lease payments |
| Renovation | Bank location repairs |
| Bills | Operational invoices |
| Divers | Miscellaneous expenses |
| Legal | Legal expenses |

**Workflow**: Create → Regional Approval → Manager Approval → Accountant Action → Paid/Rejected

**Reports**: Filterable by date range, region, type, status, and demandeur. Breakdown by currency (HTG, USD).

### Reporting

- **Dashboard** — KPIs, bank distribution by region, status breakdown
- **Weekly Reports** — Bank activity reports by week
- **Expense Reports** — Financial summaries grouped by type, status, and currency

## Roles & Permissions

The app uses role-based access control. Key roles:

| Role | Access |
|------|--------|
| `admin` | Full access to all features |
| `super_manager` | Management dashboard, approvals, reports |
| `manager` / `assist_manager` | Bank approvals, request management |
| `coordonator` / `assist_coordonator` | Bank coordination, field operations |
| `coordonator_agent_immobilier` | Real estate agent coordination |
| `agent_immobilier` | Add banks and entities (simplified dashboard) |
| `accountant` / `super_accountant` | Request payment processing |
| `operation` | Operational bank management |
| `vendor_management` | Vendor |

## Deployment

The app deploys to **Vercel** as part of the monorepo:

- Frontend builds to `ui/rent/build/`
- API deploys as serverless functions at `/api/`
- See `vercel.json` in the project root for configuration

## Path Aliases

- `@/*` maps to `src/*` (configured in `tsconfig.json` and `vite.config.ts`)
