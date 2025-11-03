# Example 19-20: Performance Optimization

This folder demonstrates performance guidelines and debugging documentation.

## Files

### `performance-CLAUDE.md`
**Use Case:** Performance-critical application

**Key Principles Demonstrated:**
- ✅ Sets measurable performance targets
- ✅ Provides specific techniques with examples
- ✅ Includes monitoring and auditing strategy
- ✅ Easy wins for quick improvements
- ✅ Shows good vs. bad patterns

**What Makes This Effective:**
1. **Performance Budgets:** Concrete metrics to target
2. **Frontend & Backend:** Separate sections for each
3. **Code Examples:** Good vs. bad for every technique
4. **Monitoring Strategy:** Tools and alerts configured
5. **Checklist:** Pre-merge performance review
6. **Quick Wins:** Easy improvements to start with

---

### `debugging-CLAUDE.md`
**Use Case:** Common issues and solutions

**Key Principles Demonstrated:**
- ✅ Organizes issues by category
- ✅ Provides specific debugging steps
- ✅ Includes common solutions
- ✅ Shows how to use debugging tools
- ✅ Sets expectations for asking for help

**What Makes This Effective:**
1. **Debugging Strategy:** General approach first
2. **Issue Categories:** Development, Tests, Runtime
3. **Symptom-Solution Format:** Easy to scan
4. **Tool Documentation:** How to use DevTools, VS Code debugger
5. **Help Guidelines:** When and how to ask for help

---

## Best Practices from These Examples

### 1. Performance Budgets
Set concrete targets:
```markdown
- TTFB: < 200ms
- FCP: < 1.5s
- LCP: < 2.5s
- TBT: < 300ms
```

### 2. Measurement Commands
Provide commands to check metrics:
```bash
pnpm analyze:perf
pnpm build && pnpm bundle:analyze
```

### 3. Good vs. Bad Code Examples
Always show both:
```typescript
// ✅ Good: Lazy load route components
const Dashboard = lazy(() => import('./pages/Dashboard'))

// ❌ Bad: Import everything upfront
import Dashboard from './pages/Dashboard'
```

### 4. Frontend vs. Backend Separation
Organize by layer:
```markdown
## Frontend Performance
- Bundle size
- Code splitting
- Image optimization

## Backend Performance
- Database queries
- Caching
- API response size
```

### 5. Caching Strategy
Document caching layers:
```markdown
- Memory (Redis): Hot data, sessions
- CDN: Static assets, images
- Browser: Cache-Control headers
```

### 6. N+1 Query Examples
Show the anti-pattern and fix:
```typescript
// ❌ Bad: N+1 query
const users = await prisma.user.findMany()
for (const user of users) {
  user.posts = await prisma.post.findMany(...)
}

// ✅ Good: Single query
const users = await prisma.user.findMany({
  include: { posts: true }
})
```

### 7. Monitoring Setup
Document tools and alerts:
```markdown
### Performance Monitoring
- Vercel Analytics (automatic)
- Sentry Performance
- Custom metrics in `lib/analytics.ts`

### Alerts
- LCP > 3s (warning)
- API response time > 1s (warning)
```

### 8. Performance Checklist
Pre-merge review items:
```markdown
- [ ] Run `pnpm build` and check bundle size
- [ ] Run Lighthouse audit
- [ ] Test on slow 3G network
- [ ] Check database query counts
```

### 9. Quick Wins List
Easy improvements to start:
```markdown
1. Add `loading="lazy"` to images
2. Implement code splitting
3. Add database indexes
4. Enable compression
```

### 10. Symptom-Solution Format
For debugging, use this pattern:
```markdown
#### "Port already in use"
**Symptoms:** Error: listen EADDRINUSE...

**Solution:**
```bash
lsof -i :3000
kill -9 <PID>
```
```

### 11. Debugging Strategy
Provide general approach:
```markdown
1. Reproduce the issue
2. Isolate the problem
3. Check the logs
4. Verify assumptions
5. Fix and verify
```

### 12. Issue Categories
Organize by type:
```markdown
## Development Issues
- Application Won't Start
- Module Not Found

## Test Failures
- Snapshot Mismatch
- Missing Test Data

## Runtime Issues
- Performance Problems
- Data Issues
```

### 13. Debugging Steps
Numbered, actionable steps:
```markdown
**Debugging steps:**
1. Open Chrome DevTools → Network tab
2. Check waterfall for slow requests
3. Look for large bundle sizes
4. Check for re-renders
```

### 14. Tool Documentation
Show how to use debugging tools:
```markdown
### VS Code Debugging
Launch configuration in `.vscode/launch.json`:
[config example]

Set breakpoints and use F5 to start debugging.
```

### 15. Help Guidelines
Structured approach to asking for help:
```markdown
### Before Asking
1. ✅ Check this guide
2. ✅ Search codebase
3. ✅ Google the error
4. ✅ Try minimal reproduction

### Where to Ask
- Quick questions: #engineering Slack
- Bug reports: GitHub issue
- Architecture: Weekly tech sync

### How to Ask
Provide:
- What you're trying to do
- Expected vs. actual
- Steps to reproduce
- What you've tried
```

### 16. Good Help Request Example
Show a well-formed question:
```markdown
I'm trying to implement user search, but API returns 500.

Expected: GET /api/users?search=john returns users
Actual: 500 Internal Server Error

Error from logs: [full stack trace]

Steps to reproduce:
1. Start dev server
2. Navigate to /users
3. Type in search box

I've tried:
- Checking DB connection (works)
- Testing query in isolation (works)
```

This template helps Claude structure help requests properly.
