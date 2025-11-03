# CI/CD Pipeline

## Automated Checks (GitHub Actions)
Every push and PR triggers:
1. **Lint** - ESLint checks code style
2. **Type Check** - TypeScript compilation
3. **Unit Tests** - Vitest test suite
4. **Build** - Vite production build
5. **E2E Tests** - Playwright critical paths (PR only)

All checks must pass before merge is allowed.

## Deployment Process

### Staging (Automatic)
- Triggers on: Push to `develop` branch
- Deploys to: https://staging.myapp.com
- Use for: QA testing, client demos
- Data: Staging database (refreshed weekly)

### Production (Manual)
- Triggers on: Tag push (e.g., `v1.2.3`)
- Deploys to: https://myapp.com
- Requires: Manual approval from tech lead
- Process:
  ```bash
  # Create release tag
  git checkout main
  git tag v1.2.3
  git push origin v1.2.3
  ```

## Monitoring
- Error tracking: Sentry (check #alerts channel)
- Performance: Vercel Analytics
- Uptime: Better Uptime (pings every 30s)

## Rollback Process
If production deployment fails:
```bash
# Revert to previous version
git checkout main
git tag v1.2.4-rollback v1.2.2
git push origin v1.2.4-rollback
```
Notify team in #engineering channel.

## Environment Variables
- Development: `.env.local` (not committed)
- Staging: Set in Vercel project settings
- Production: Set in Vercel project settings (encrypted)
- Never commit secrets to repository
