# Full-Stack Project Guidelines

## Frontend (React/TypeScript)
- **Location:** `apps/web/`
- **Style:** Functional components, TypeScript strict
- **Imports:** Use `@web/` for absolute imports
- **API calls:** Use `src/api/client.ts` wrapper (handles auth)

## Backend (Node.js/Express)
- **Location:** `apps/api/`
- **Style:** ES modules, async/await (no callbacks)
- **Error handling:** Use `ApiError` class from `src/errors.ts`
- **Database:** Prisma ORM (models in `prisma/schema.prisma`)
- **Authentication:** JWT tokens (utility in `src/auth/jwt.ts`)

## Shared Code
- **Location:** `packages/shared/`
- **Contains:** TypeScript types, validation schemas, constants
- **Import in apps:** `import { UserSchema } from '@shared/types'`

## API Conventions
- RESTful endpoints: `/api/v1/resource`
- Use plural nouns: `/users`, `/posts`
- HTTP methods: GET (read), POST (create), PATCH (update), DELETE (remove)
- Response format: `{ data: {...}, error: null }` or `{ data: null, error: {...} }`

## Database
- Use migrations for schema changes: `pnpm prisma migrate dev`
- Seed data for development: `pnpm prisma db seed`
- Never modify migration files after they're committed
