# Example 15-16: Multi-Project Configurations

This folder demonstrates monorepo and multi-environment configurations.

## Files

### `monorepo-CLAUDE.md`
**Use Case:** Multiple packages in single repository

**Key Principles Demonstrated:**
- ✅ Explains monorepo structure clearly
- ✅ Provides specific commands for working within monorepo
- ✅ Documents dependency management
- ✅ Includes workflow for common tasks
- ✅ Shows package organization patterns

**What Makes This Effective:**
1. **Visual Structure:** ASCII tree showing package organization
2. **Command Matrix:** Root-level vs. package-specific commands
3. **Workspace Dependencies:** How packages reference each other
4. **Development Workflow:** Step-by-step for common tasks
5. **Code Sharing Guidelines:** What goes in each package

---

### `multi-env-CLAUDE.md`
**Use Case:** Different configurations per environment

**Key Principles Demonstrated:**
- ✅ Clear separation of environments
- ✅ Security best practices
- ✅ Practical examples for each environment
- ✅ Explains priority and loading order
- ✅ Environment-specific behavior documented

**What Makes This Effective:**
1. **Environment Inventory:** Lists all environments upfront
2. **File Priority:** Clear loading order (local > env-specific > defaults)
3. **Variable Examples:** Actual .env file contents
4. **Behavior Differences:** What changes between environments
5. **Secrets Management:** Security best practices

---

## Best Practices from These Examples

### 1. Monorepo Package Organization
Use clear directory structure:
```
packages/       # Shared packages
├── ui/
├── utils/
└── types/

apps/           # Applications
├── web/
└── admin/
```

### 2. Workspace Commands
Provide both root and filtered commands:
```bash
# Root level
pnpm dev              # All apps

# Package-specific
pnpm --filter web dev # Single app
```

### 3. Workspace Dependencies
Show how to reference internal packages:
```json
{
  "dependencies": {
    "@myorg/ui": "workspace:*"
  }
}
```

### 4. Code Sharing Guidelines
Define what goes in each package:
```markdown
### Shared UI (packages/ui/)
- Reusable across all apps
- No app-specific logic
- Fully tested and documented

### Shared Utils (packages/utils/)
- Pure functions only
- Well-typed with TypeScript
```

### 5. Environment File Inventory
List all environment files:
```markdown
.env.development      # Local development
.env.staging         # Staging environment
.env.production      # Production environment
.env.example         # Template (commit this)
.env.local           # Personal overrides (gitignored)
```

### 6. Configuration Priority
Explain loading order:
```markdown
1. `.env.local` (highest priority, never commit)
2. `.env.[environment]` (environment-specific)
3. `.env` (defaults)
```

### 7. Environment Variable Examples
Show actual .env contents for each environment:
```bash
### Development
NEXT_PUBLIC_API_URL=http://localhost:3001
DEBUG=true

### Production
NEXT_PUBLIC_API_URL=https://api.app.com
DEBUG=false
```

### 8. Variable Usage Patterns
Distinguish public vs. server-only:
```typescript
// Public (exposed to browser)
const apiUrl = process.env.NEXT_PUBLIC_API_URL

// Server-only (never sent to browser)
const stripeKey = process.env.STRIPE_KEY
```

### 9. Environment-Specific Behavior
Document what changes between environments:
```markdown
### Development
- Detailed error messages
- Source maps enabled
- Hot module reloading

### Production
- Minimal error details (security)
- No source maps
- Performance monitoring enabled
```

### 10. Environment Switching
Show how to test different environments locally:
```bash
# Development (default)
pnpm dev

# Test staging locally
NODE_ENV=staging pnpm dev

# Test production build
pnpm build && pnpm start
```

### 11. Secrets Management
Security best practices:
```markdown
- **Never** commit secrets to git
- Development: `.env.local`
- Staging/Production: Platform settings (encrypted)
- Rotate secrets every 90 days
```

### 12. Build Optimization (Monorepo)
Document build tooling:
```markdown
- Turborepo caching enabled
- Only rebuilds changed packages
- Parallel execution when possible
- Remote cache for CI
```

### 13. Testing Strategy (Monorepo)
Explain test organization:
```markdown
- Unit tests: At package level
- Integration tests: At app level
- E2E tests: Only in apps
- Run `pnpm test` from root for full suite
```

### 14. Adding New Packages
Step-by-step workflow:
```bash
mkdir packages/new-package
cd packages/new-package
pnpm init
# Set name to @myorg/new-package
```

### 15. Environment Validation
Document how env vars are validated:
```markdown
App validates required variables on startup:
- See `src/config/env.ts` for logic
- Missing variables cause startup failure
- Type-safe access to environment variables
```

### 16. Cross-Package Dependencies
Explain dependency management:
```markdown
When package A depends on package B:
- Build order handled automatically
- Use `workspace:*` version specifier
- Turborepo caches and parallelizes
```

This helps Claude understand how to work with internal dependencies.
