# Testing Guidelines

## Test Structure
- Place tests next to source files: `feature.ts` → `feature.test.ts`
- Use describe blocks to group related tests
- Test file structure:
  ```typescript
  describe('ComponentName', () => {
    describe('method/feature', () => {
      it('should behave in specific way', () => {
        // test implementation
      })
    })
  })
  ```

## Unit Tests (Vitest)
- Test individual functions and components in isolation
- Mock external dependencies
- Aim for 80%+ code coverage
- Run: `pnpm test:unit`

## Integration Tests
- Test feature workflows end-to-end
- Use real API calls to test environment
- Located in `src/__tests__/integration/`
- Run: `pnpm test:integration`

## E2E Tests (Playwright)
- Test critical user journeys
- Located in `e2e/` directory
- Run against local dev server or staging
- Commands:
  - `pnpm test:e2e` - Headless mode
  - `pnpm test:e2e:ui` - UI mode for debugging

## Test Data
- Use factories from `src/test/factories.ts`
- Example: `createMockUser({ email: 'test@example.com' })`
- Reset test database before integration tests

## What to Test
✅ **Do test:**
- Business logic and algorithms
- Component behavior and user interactions
- Error handling and edge cases
- API integration points

❌ **Don't test:**
- Third-party library internals
- TypeScript types (type-check handles this)
- Simple getter/setter methods
- Generated code

## Test Workflow
Before committing:
1. Run `pnpm test:unit` - Should complete in <10s
2. Run `pnpm type-check` - Catch type errors
3. Run `pnpm test:integration` - If you modified API
4. Run `pnpm test:e2e` - If you modified critical flows

CI pipeline runs all tests automatically on PR.
