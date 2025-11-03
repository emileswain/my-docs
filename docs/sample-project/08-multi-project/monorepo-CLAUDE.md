# Monorepo Structure

## Package Organization
```
packages/
├── ui/              # Shared UI components
├── utils/           # Shared utilities
├── types/           # Shared TypeScript types
└── config/          # Shared configs (ESLint, TS, etc.)

apps/
├── web/             # Main web application
├── admin/           # Admin dashboard
└── docs/            # Documentation site
```

## Package-Specific Instructions

### Root Level Commands
From repository root:
- `pnpm dev` - Start all apps
- `pnpm build` - Build all packages and apps
- `pnpm test` - Run all tests across packages
- `pnpm lint` - Lint entire monorepo
- `pnpm typecheck` - Type check all TypeScript code

### Package-Specific Commands
To work on specific package:
- `pnpm --filter @myorg/ui dev` - Start UI package in watch mode
- `pnpm --filter web test` - Test only web app
- `pnpm --filter admin build` - Build only admin app

## Workspace Dependencies
Internal packages reference each other:
```json
{
  "dependencies": {
    "@myorg/ui": "workspace:*",
    "@myorg/utils": "workspace:*"
  }
}
```

## Development Workflow

### Making Changes to Shared Package
1. Make changes in `packages/ui/`
2. Package auto-rebuilds (watch mode)
3. Apps hot-reload with changes
4. Test in apps before committing

### Adding New Package
```bash
# Create package directory
mkdir packages/new-package
cd packages/new-package

# Initialize package
pnpm init

# Set name to @myorg/new-package in package.json
# Add build scripts and dependencies
```

### Cross-Package Dependencies
When package A depends on package B:
- Build order handled automatically
- Use `workspace:*` version specifier
- Turborepo caches and parallelizes builds

## Code Sharing Guidelines

### Shared UI Components (packages/ui/)
- Reusable across all apps
- No app-specific logic
- Fully tested and documented
- Include Storybook stories

### Shared Utils (packages/utils/)
- Pure functions only
- Well-typed with TypeScript
- Include JSDoc comments
- Comprehensive tests

### Shared Types (packages/types/)
- Domain models
- API contracts
- Common interfaces
- Use in both frontend and backend

### Shared Config (packages/config/)
- ESLint configurations
- TypeScript configurations
- Prettier settings
- Import from apps: `extends: ["@myorg/config/eslint"]`

## Build Optimization
- Turborepo caching enabled
- Only rebuilds changed packages
- Parallel execution when possible
- Remote cache for CI (Vercel)

## Testing in Monorepo
- Unit tests at package level
- Integration tests at app level
- E2E tests only in apps
- Run `pnpm test` from root for full suite
