# React MVVM Project Template

A production-ready React project template using **Model-View-ViewModel (MVVM)** architecture with factory-based VMs, zero-hooks views, and a multi-provider API layer.

## Architecture

```
Feature/
├── model/          # Data layer: types, schemas, store, clientAPI, mocks
├── vm/             # ViewModel: factory-created hooks (createListVM, createDetailVM)
├── view/           # View: zero-hooks presentational components + configs
└── routes/         # Route definitions wiring VM to View via loader
```

### Key Patterns

- **Zero-Hooks Views**: View components have NO React hooks. All state/logic lives in VMs, enforced by ESLint.
- **Factory VMs**: `createListVM()` and `createDetailVM()` compose ViewModels from configuration objects.
- **VM Context**: Route loaders inject VM hooks via `VMProvider` → child components call `useVM()`.
- **Multi-Provider API**: Requests route through REST, tRPC, GraphQL, or Mock providers based on config priority.
- **Config-Driven Sidebar**: Navigation items defined in a config array, not hardcoded imports.

### Layer Rules

| Layer | Can Import From | Cannot Import From |
|-------|----------------|-------------------|
| View | VM, Infrastructure | Model (use VM instead) |
| VM | Model, Infrastructure | View |
| Model | Infrastructure | VM, View |
| Routes | View, VM, Infrastructure | Model |

## Quick Start

```bash
npm install
npm run dev
```

Login with `admin@example.com` or `user@example.com` (any password).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint with MVVM boundary checks |
| `npm run test` | Run Vitest tests |
| `npm run test:coverage` | Tests with coverage report |
| `npm run preview` | Preview production build |

## Tech Stack

- **React 19** + TypeScript (strict mode)
- **TanStack Router** - Type-safe file-based routing
- **TanStack Query** - Server state management
- **TanStack Table** - Headless data tables
- **TanStack Form** - Headless form management
- **Zustand** - Client state management
- **Zod** - Schema validation
- **shadcn/ui** + Radix UI - Component library
- **Tailwind CSS v4** - Styling (OKLch color system)
- **Vite** - Build tool
- **Vitest** + MSW - Testing
- **tRPC** - Type-safe API calls
- **graphql-request** - GraphQL client

## How to Add a Feature

### 1. Create the Model Layer

```
src/features/my-feature/model/
├── types.ts           # TypeScript interfaces
├── schemas.ts         # Zod validation schemas
├── store.ts           # Zustand store (via createListStore factory)
├── detailStore.ts     # Detail UI state store
├── clientAPI.ts       # API client extending BaseClientAPI
├── endpointConfig.ts  # Multi-provider endpoint definitions
└── mocks/
    ├── data.ts        # Mock data for development
    └── filterOptions.ts
```

### 2. Create the VM Layer

```
src/features/my-feature/vm/
├── listVM.ts    # useMyFeatureListVM via createListVM factory
└── detailVM.ts  # useMyFeatureDetailVM via createDetailVM factory
```

### 3. Create the View Layer

```
src/features/my-feature/view/
├── listConfig.tsx    # Column, filter, card configurations
├── detailConfig.tsx  # Detail page section configurations
├── ListPage.tsx      # <ListTemplate /> (zero hooks!)
└── DetailPage.tsx    # Detail view using VM state
```

### 4. Create Routes

```
src/features/my-feature/routes/
├── listRoute.tsx     # loader: () => ({ useVM: useMyFeatureListVM })
└── detailRoute.tsx   # loader with prefetch + VM injection
```

### 5. Wire Into App

1. Add routes to `src/infrastructure/routing/router.tsx`
2. Add nav item to `src/infrastructure/constants/sidebarConfig.ts`

## Provider Configuration

Set `VITE_PROVIDER_TYPE` in `.env` to control the default API provider:

- `mock` - Uses in-memory mock data (default for development)
- `rest` - REST API via fetch
- `trpc` - tRPC client
- `graphql` - GraphQL via graphql-request

Each endpoint can override the default with per-endpoint provider config in `endpointConfig.ts`.

## Auth

The template includes working mock authentication via Zustand with persist. To swap for real auth:

1. Replace `useAuthStore.ts` login/logout with real API calls
2. Update the JWT token handling
3. Modify `authGuard.ts` if needed
4. Update `LoginPage.tsx` form as needed

Mock users: `admin@example.com` (admin role), `user@example.com` (user role). Any password works.

## Project Structure

```
src/
├── features/           # Feature modules (MVVM slices)
│   └── users/          # Reference implementation
│       ├── model/
│       ├── vm/
│       ├── view/
│       └── routes/
├── infrastructure/     # Shared infrastructure
│   ├── api/            # Multi-provider API layer
│   ├── components/     # UI components (shadcn, app, skeletons, form)
│   ├── constants/      # App-wide config (sidebar nav items)
│   ├── hooks/          # Shared React hooks
│   ├── layouts/        # Page layouts (Main, Auth, Grid)
│   ├── lib/            # Utilities (cn, queryClient)
│   ├── pages/          # Infrastructure pages (Login, LoginFailed)
│   ├── routing/        # Router config, guards, error boundaries
│   ├── stores/         # Global stores (auth, theme, notifications)
│   ├── templates/      # Page templates (List, Detail)
│   ├── types/          # Shared TypeScript types
│   └── utils/          # Factory functions, helpers
├── testing/            # Test utilities
│   ├── builders/       # Test data builders
│   ├── helpers/        # Assertion helpers
│   ├── msw-handlers.ts # MSW request handlers
│   ├── setup.ts        # Test setup
│   └── test-utils.tsx  # Custom render with providers
├── App.tsx
├── main.tsx
└── index.css
```
