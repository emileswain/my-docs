# Performance Optimization Guidelines

## Performance Budgets
- **Time to First Byte (TTFB):** < 200ms
- **First Contentful Paint (FCP):** < 1.5s
- **Largest Contentful Paint (LCP):** < 2.5s
- **Total Blocking Time (TBT):** < 300ms
- **Cumulative Layout Shift (CLS):** < 0.1
- **First Input Delay (FID):** < 100ms

Check current metrics: `pnpm analyze:perf`

## Frontend Performance

### Bundle Size
- Main bundle: < 200KB gzipped
- Route chunks: < 100KB each
- Third-party libraries: Only if necessary

**Check bundle size:**
```bash
pnpm build
pnpm bundle:analyze
```

### Code Splitting
Split code at route level:
```typescript
// ✅ Good: Lazy load route components
const Dashboard = lazy(() => import('./pages/Dashboard'))

// ❌ Bad: Import everything upfront
import Dashboard from './pages/Dashboard'
```

### Image Optimization
- Use Next.js Image component
- Provide width and height
- Use WebP format
- Implement lazy loading
- Optimize images before committing (use `pnpm optimize:images`)

```tsx
// ✅ Good
import Image from 'next/image'
<Image
  src="/hero.jpg"
  alt="Hero"
  width={800}
  height={600}
  loading="lazy"
/>

// ❌ Bad
<img src="/hero.jpg" alt="Hero" />
```

### Memoization
Memoize expensive computations:
```typescript
// ✅ Good: Memoize expensive calculation
const sortedData = useMemo(
  () => data.sort((a, b) => a.value - b.value),
  [data]
)

// ✅ Good: Memoize callbacks
const handleClick = useCallback(() => {
  doSomething(id)
}, [id])

// ❌ Bad: Recalculate every render
const sortedData = data.sort((a, b) => a.value - b.value)
```

### Virtual Scrolling
Use virtual scrolling for long lists:
```typescript
// For lists > 100 items, use react-window
import { FixedSizeList } from 'react-window'

<FixedSizeList
  height={600}
  itemCount={items.length}
  itemSize={50}
>
  {Row}
</FixedSizeList>
```

## Backend Performance

### Database Queries
- Use indexes on frequently queried columns
- Avoid N+1 queries (use `include` or `select`)
- Limit result sets
- Use cursor pagination for large datasets

```typescript
// ✅ Good: Single query with include
const users = await prisma.user.findMany({
  include: { posts: true }
})

// ❌ Bad: N+1 query
const users = await prisma.user.findMany()
for (const user of users) {
  user.posts = await prisma.post.findMany({ where: { userId: user.id } })
}
```

### Caching Strategy
- **Memory (Redis):** Hot data, sessions, rate limits
- **CDN:** Static assets, images
- **Browser:** Cache-Control headers

```typescript
// Cache frequently accessed data
import { cache } from './lib/redis'

const cachedUser = await cache.get(`user:${id}`)
if (cachedUser) return cachedUser

const user = await db.user.findUnique({ where: { id } })
await cache.set(`user:${id}`, user, { ex: 3600 }) // 1 hour
return user
```

### API Response Size
- Paginate large datasets
- Use field selection (don't return everything)
- Compress responses (gzip/brotli)

```typescript
// ✅ Good: Allow field selection
GET /api/users?fields=id,name,email

// ✅ Good: Paginate results
GET /api/users?page=1&limit=20

// ❌ Bad: Return everything
GET /api/users (returns 10,000 users with all fields)
```

### Async Processing
Move slow operations to background jobs:
- Email sending
- Image processing
- Report generation
- Data exports

```typescript
// ✅ Good: Queue background job
await queue.add('send-email', { to, subject, body })
return { success: true, message: 'Email queued' }

// ❌ Bad: Block request
await sendEmail(to, subject, body) // Takes 2-3 seconds
return { success: true }
```

## Monitoring

### Performance Monitoring
- Vercel Analytics (automatic)
- Sentry Performance (errors + performance)
- Custom metrics in `lib/analytics.ts`

### Setting Up Alerts
Alerts configured for:
- LCP > 3s (warning)
- API response time > 1s (warning)
- Error rate > 1% (critical)
- Server CPU > 80% (warning)

Check alerts: Slack #alerts channel

### Regular Performance Audits
Run weekly performance audit:
```bash
pnpm perf:audit
```

This generates a report with:
- Lighthouse scores
- Bundle size changes
- Slow API endpoints
- Largest pages

## Performance Checklist
Before merging performance-sensitive PRs:
- [ ] Run `pnpm build` and check bundle size
- [ ] Run Lighthouse audit
- [ ] Test on slow 3G network (Chrome DevTools)
- [ ] Check database query counts (logs)
- [ ] Verify images are optimized
- [ ] Test with large datasets
- [ ] Review memoization usage

## Quick Wins
Easy performance improvements:
1. Add `loading="lazy"` to all images
2. Implement code splitting for routes
3. Add indexes to database columns used in WHERE clauses
4. Enable response compression
5. Use `next/image` instead of `<img>`
6. Memoize expensive components
7. Debounce search inputs
8. Cache API responses
