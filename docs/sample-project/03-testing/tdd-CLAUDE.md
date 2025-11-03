# Test-Driven Development Workflow

## TDD Cycle
1. **Red:** Write a failing test that describes desired behavior
2. **Green:** Write minimal code to make the test pass
3. **Refactor:** Improve code while keeping tests green

## When to Use TDD
- Implementing new features with clear requirements
- Fixing bugs (write failing test first, then fix)
- Refactoring existing code (tests provide safety net)

## Test-First Guidelines
- Write tests before implementation code
- Each test should focus on one specific behavior
- Start with the simplest test case
- Gradually add more complex scenarios

## Example Workflow
```bash
# 1. Create test file
touch src/features/cart/calculateTotal.test.ts

# 2. Write failing test
pnpm test:watch  # Runs in watch mode

# 3. Implement minimal solution
# Edit src/features/cart/calculateTotal.ts

# 4. Refactor when green
# Improve implementation while tests pass
```

## Test Naming Convention
Use "should" statements that describe behavior:
- ✅ `should return zero for empty cart`
- ✅ `should apply 10% discount for premium users`
- ❌ `test calculateTotal`
- ❌ `discount test`

## Coverage Goals
- New features: 100% coverage required
- Bug fixes: Add test that would have caught the bug
- Refactoring: Maintain or improve existing coverage
