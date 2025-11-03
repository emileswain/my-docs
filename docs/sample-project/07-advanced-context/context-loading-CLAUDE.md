# Context Management Strategy

## File Organization for Context Efficiency

### Core Documentation (Always Loaded)
Keep in CLAUDE.md:
- Essential commands (top 5-10 only)
- Critical warnings and gotchas
- Links to detailed documentation

### Detailed Documentation (Load on Demand)
Keep in separate files:
- `.claude/docs/architecture.md` - Detailed architecture
- `.claude/docs/testing.md` - Complete testing guide
- `.claude/docs/deployment.md` - Deployment procedures
- `.claude/docs/troubleshooting.md` - Common issues and solutions

## When to Reference Detailed Docs
Tell Claude to read specific docs when needed:
- "Check `.claude/docs/architecture.md` for the full service structure"
- "Reference `.claude/docs/testing.md` for integration test patterns"

## Lightweight Identifiers
Use identifiers instead of full context:

### Instead of listing all components:
❌ DON'T:
```markdown
Components:
- Button (src/components/Button.tsx) - A button component with 15 variants...
- Input (src/components/Input.tsx) - A text input with validation...
[50 more components...]
```

✅ DO:
```markdown
Components follow atomic design in `src/components/`.
See component documentation in Storybook.
```

### Instead of documenting all API endpoints:
❌ DON'T:
```markdown
API Endpoints:
- GET /api/users - Get all users...
- POST /api/users - Create user...
[30 more endpoints...]
```

✅ DO:
```markdown
API follows REST conventions.
Endpoints documented in `api-docs/openapi.yml`.
Use `pnpm api:docs` to view interactive documentation.
```

## Context Compaction Strategy
For long sessions, provide a summary prompt:

```markdown
# Session Summary Template
When context gets large, use this prompt:

"Please summarize what we've accomplished:
1. Files modified and key changes
2. Current task status
3. Next steps
4. Any blockers or decisions needed

Keep summary under 200 words."
```

## Structured Note-Taking
For complex features spanning multiple sessions:

```markdown
# Feature: User Authentication
## Status: In Progress

### Completed
- [x] Database schema for users table
- [x] JWT token generation
- [x] Login endpoint

### In Progress
- [ ] Password reset flow (started email service)

### Blocked
- [ ] OAuth integration (waiting for client credentials)

### Key Decisions
- Using bcrypt for password hashing (12 rounds)
- Token expiry: 7 days
- Refresh tokens stored in Redis

### Files Modified
- `src/auth/login.ts`
- `prisma/schema.prisma`
- `src/middleware/auth.ts`

Last updated: 2025-01-15
```

Store in `.claude/notes/` directory.

## Sub-Context Pattern
For specialized tasks, create focused context files:

```markdown
# .claude/contexts/database.md
Database-specific context loaded only when working on DB tasks.

# .claude/contexts/frontend.md
Frontend-specific context loaded only when working on UI.

# .claude/contexts/deployment.md
DevOps context loaded only when deploying.
```

Usage: "Load context from `.claude/contexts/database.md` before working on migrations."
