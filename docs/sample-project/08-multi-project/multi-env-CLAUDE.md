# Multi-Environment Setup

## Environments
- **Development** - Local development (localhost)
- **Staging** - QA and testing (staging.app.com)
- **Production** - Live application (app.com)

## Environment-Specific Files
```
.env.development      # Local development
.env.staging         # Staging environment
.env.production      # Production environment
.env.example         # Template (commit this)
.env.local           # Personal overrides (gitignored)
```

## Configuration Loading
Environment files loaded in priority order:
1. `.env.local` (highest priority, never commit)
2. `.env.[environment]` (environment-specific)
3. `.env` (defaults)

## Environment Variables

### All Environments
```bash
# Application
NEXT_PUBLIC_APP_NAME=MyApp
NEXT_PUBLIC_API_VERSION=v1

# Feature Flags (override in .env.local)
FEATURE_NEW_DASHBOARD=false
FEATURE_ANALYTICS=false
```

### Development (.env.development)
```bash
# API
NEXT_PUBLIC_API_URL=http://localhost:3001
API_TIMEOUT=30000

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/myapp_dev

# External Services (mock/sandbox)
STRIPE_KEY=sk_test_...
SENDGRID_API_KEY=SG.test...

# Debug
DEBUG=true
LOG_LEVEL=debug
```

### Staging (.env.staging)
```bash
# API
NEXT_PUBLIC_API_URL=https://api-staging.app.com
API_TIMEOUT=10000

# Database
DATABASE_URL=postgresql://user:pass@staging-db.app.com:5432/myapp_staging

# External Services (test mode)
STRIPE_KEY=sk_test_...
SENDGRID_API_KEY=SG.staging...

# Debug
DEBUG=false
LOG_LEVEL=info
```

### Production (.env.production)
```bash
# API
NEXT_PUBLIC_API_URL=https://api.app.com
API_TIMEOUT=5000

# Database
DATABASE_URL=postgresql://user:pass@prod-db.app.com:5432/myapp_prod

# External Services (live)
STRIPE_KEY=sk_live_...
SENDGRID_API_KEY=SG.prod...

# Debug
DEBUG=false
LOG_LEVEL=error
SENTRY_DSN=https://...
```

## Usage in Code
```typescript
// Public variables (exposed to browser)
const apiUrl = process.env.NEXT_PUBLIC_API_URL

// Server-only variables (never sent to browser)
const stripeKey = process.env.STRIPE_KEY
```

## Environment-Specific Behavior

### Development
- Detailed error messages
- Source maps enabled
- Hot module reloading
- Mock external services available
- Relaxed CORS

### Staging
- Similar to production
- Extended logging
- Real external services (test mode)
- Accessible only via VPN or IP whitelist

### Production
- Minimal error details (security)
- No source maps
- Strict CORS
- Real external services (live mode)
- Performance monitoring enabled

## Switching Environments Locally
```bash
# Development (default)
pnpm dev

# Test staging configuration locally
NODE_ENV=staging pnpm dev

# Test production build locally
pnpm build
pnpm start
```

## Environment Validation
App validates required environment variables on startup:
- See `src/config/env.ts` for validation logic
- Missing variables cause startup failure
- Type-safe access to environment variables

## Secrets Management
- **Never** commit secrets to git
- Development secrets in `.env.local`
- Staging/Production secrets in deployment platform (Vercel/AWS)
- Rotate secrets every 90 days
- Use different keys per environment
