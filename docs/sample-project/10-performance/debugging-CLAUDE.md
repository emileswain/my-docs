# Debugging and Troubleshooting Guide

## General Debugging Strategy
1. **Reproduce the issue** - Ensure you can make it happen consistently
2. **Isolate the problem** - Narrow down where the issue occurs
3. **Check the logs** - Look for error messages and stack traces
4. **Verify assumptions** - Test what you think is happening
5. **Fix and verify** - Implement fix and confirm it works

## Development Issues

### Application Won't Start

#### "Port already in use"
**Symptoms:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Find process using port
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or change port in .env.local
PORT=3001
```

#### "Module not found"
**Symptoms:** `Error: Cannot find module 'some-package'`

**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules
pnpm install

# Clear Next.js cache
rm -rf .next

# Restart dev server
pnpm dev
```

#### "Database connection failed"
**Symptoms:** `Error: Can't reach database server`

**Solution:**
```bash
# Check if Docker is running
docker ps

# Start database container
docker-compose up -d db

# Verify connection string in .env.local
DATABASE_URL=postgresql://user:pass@localhost:5432/myapp_dev

# Test connection
pnpm db:test-connection
```

### Test Failures

#### "Snapshot test failed"
**Symptoms:** Tests fail with snapshot mismatch

**Solution:**
```bash
# Review the diff
pnpm test

# If changes are intentional, update snapshots
pnpm test:update

# If not intentional, investigate what changed
```

#### "Cannot find test user"
**Symptoms:** Integration tests fail with "User not found"

**Solution:**
```bash
# Reset test database
NODE_ENV=test pnpm db:reset

# Reseed test data
NODE_ENV=test pnpm db:seed

# Run tests again
pnpm test:integration
```

## Runtime Issues

### Performance Problems

#### "Page loads slowly"
**Debugging steps:**
1. Open Chrome DevTools → Network tab
2. Check waterfall for slow requests
3. Look for large bundle sizes
4. Check for unnecessary re-renders (React DevTools Profiler)

**Common causes:**
- Large bundle sizes → Implement code splitting
- Slow API calls → Add caching or optimize queries
- Too many re-renders → Add memoization
- Large images → Use optimized formats and lazy loading

#### "API endpoint is slow"
**Debugging steps:**
```typescript
// Add logging to measure timing
console.time('API /users')
const users = await fetchUsers()
console.timeEnd('API /users')

// Check database queries
// Enable Prisma query logging in .env
DEBUG=prisma:query

// Profile with Chrome DevTools
// Add ?profile=1 to URL and check Performance tab
```

### Data Issues

#### "Data not updating in UI"
**Debugging steps:**
1. Check if API call succeeds (Network tab)
2. Verify state is being updated (React DevTools)
3. Check if component is re-rendering
4. Look for stale closures or missing dependencies

**Common fixes:**
```typescript
// ✅ Invalidate cache after mutation
const mutation = useMutation(updateUser, {
  onSuccess: () => {
    queryClient.invalidateQueries(['users'])
  }
})

// ✅ Include all dependencies
useEffect(() => {
  fetchData(userId)
}, [userId]) // Don't forget dependencies!
```

## Debugging Tools

### Browser DevTools
- **Console:** Logs, errors, warnings
- **Network:** API calls, timing, payload inspection
- **React DevTools:** Component tree, props, state
- **Performance:** Profiling, frame rate
- **Application:** LocalStorage, cookies, service workers

### VS Code Debugging
Launch configuration in `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Next.js",
  "runtimeExecutable": "pnpm",
  "runtimeArgs": ["dev"],
  "port": 9229,
  "skipFiles": ["<node_internals>/**"]
}
```

Set breakpoints and use F5 to start debugging.

### Server Logging
```typescript
// Structured logging
import { logger } from './lib/logger'

logger.info('User logged in', { userId })
logger.error('Failed to process order', { orderId, error })
logger.debug('Query executed', { query, duration })
```

Logs appear in:
- Development: Console
- Production: Vercel logs or Datadog

## Getting Help

### Before Asking for Help
1. ✅ Check this troubleshooting guide
2. ✅ Search codebase for similar solutions
3. ✅ Google the exact error message
4. ✅ Check GitHub issues in relevant libraries
5. ✅ Try to create minimal reproduction

### Where to Ask
- **Quick questions:** #engineering Slack channel
- **Bug reports:** Create GitHub issue (use template)
- **Architecture discussions:** Weekly tech sync or #tech-architecture
- **Blocked on task:** Tag your tech lead in Slack

### How to Ask
Provide:
- What you're trying to do
- What you expected to happen
- What actually happened
- Steps to reproduce
- Error messages (full stack trace)
- What you've tried so far

**Good example:**
```
I'm trying to implement user search, but the API is returning 500 errors.

Expected: GET /api/users?search=john returns matching users
Actual: 500 Internal Server Error

Error from logs:
PrismaClientKnownRequestError: Invalid `prisma.user.findMany()` invocation...

Steps to reproduce:
1. Start dev server
2. Navigate to /users
3. Type in search box
4. See error in network tab

I've tried:
- Checking the database connection (works)
- Testing the Prisma query in isolation (works)
- Looking at similar queries in codebase

Code: https://github.com/company/project/blob/feature/user-search/src/api/users.ts#L45
```

This helps others help you faster!
