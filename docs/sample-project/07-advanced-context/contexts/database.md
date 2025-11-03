# Database Context

Load this context when working on database-related tasks.

## Database Technology
- PostgreSQL 15
- Prisma ORM
- Connection pooling via PgBouncer

## Schema Conventions
- Table names: lowercase, plural (e.g., `users`, `orders`)
- Primary keys: `id` (UUID v4)
- Timestamps: `createdAt`, `updatedAt` (auto-managed)
- Soft deletes: `deletedAt` nullable timestamp

## Migration Workflow
1. Modify `prisma/schema.prisma`
2. Run `pnpm prisma migrate dev --name descriptive-name`
3. Review generated SQL in `prisma/migrations/`
4. Test migration on local database
5. Commit migration files

## Indexing Strategy
- Add index on foreign keys
- Add index on frequently queried columns
- Use composite indexes for multi-column queries
- Monitor query performance with `EXPLAIN ANALYZE`

## Common Queries
[Database-specific patterns and optimizations...]
