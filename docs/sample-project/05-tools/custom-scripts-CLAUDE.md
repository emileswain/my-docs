# Custom Development Tools

## Database Management
### Migrations
- `pnpm db:migrate` - Create and apply new migration
- `pnpm db:migrate:reset` - Reset database and reapply all migrations
- `pnpm db:migrate:status` - Check migration status

### Seeding
- `pnpm db:seed` - Populate database with test data
- `pnpm db:seed:prod` - Minimal production seed data

### Utilities
- `pnpm db:studio` - Open Prisma Studio GUI (http://localhost:5555)
- `pnpm db:backup` - Create local backup in `backups/`

## Code Generation
- `pnpm generate:component <name>` - Scaffold new component with tests
  - Example: `pnpm generate:component UserCard`
  - Creates: `UserCard.tsx`, `UserCard.test.tsx`, `UserCard.module.css`
- `pnpm generate:api <resource>` - Generate CRUD API endpoints
  - Example: `pnpm generate:api product`
  - Creates: Routes, controller, validation, tests

## Build Tools
- `pnpm analyze` - Analyze bundle size (opens visualization)
- `pnpm bundle:report` - Generate bundle report in `dist/report.html`
- `pnpm check:deps` - Check for outdated dependencies
- `pnpm update:deps` - Interactive dependency updater

## Development Utilities
- `pnpm dev:https` - Run dev server with HTTPS (for OAuth testing)
- `pnpm dev:network` - Expose dev server on local network
- `pnpm mock:api` - Run mock API server standalone (port 3001)

## Debugging
- `pnpm debug:build` - Build with source maps and debug info
- `pnpm debug:test <file>` - Run single test file with debugger attached
  - Example: `pnpm debug:test src/components/Button.test.tsx`

## Documentation
- `pnpm docs:dev` - Start documentation site (port 4000)
- `pnpm docs:build` - Build static documentation
- `pnpm docs:api` - Generate API documentation from JSDoc comments

## Troubleshooting Commands
If you encounter issues:
1. `pnpm clean` - Remove node_modules, dist, .cache
2. `pnpm install` - Fresh install dependencies
3. `pnpm db:migrate:reset` - Reset database if schema issues
4. `rm -rf .vite` - Clear Vite cache
