# Example 5-6: Testing Instructions

This folder demonstrates comprehensive testing strategies and TDD workflows.

## Files

### `comprehensive-testing-CLAUDE.md`
**Use Case:** Project with multiple testing strategies

**Key Principles Demonstrated:**
- ✅ Clear distinction between test types
- ✅ Provides concrete examples and structure
- ✅ Includes dos and don'ts
- ✅ Integrates with development workflow
- ✅ Specifies test location conventions
- ✅ Documents test data management

**What Makes This Effective:**
1. **Three-Tier Testing:** Unit, Integration, E2E clearly separated
2. **What to Test Guidance:** Explicit lists of what should/shouldn't be tested
3. **Workflow Integration:** Pre-commit checklist included
4. **Tool-Specific Commands:** Exact commands for each test type

---

### `tdd-CLAUDE.md`
**Use Case:** Team practicing test-driven development

**Key Principles Demonstrated:**
- ✅ Teaches methodology, not just mechanics
- ✅ Provides clear workflow steps
- ✅ Shows examples of good vs. bad practices
- ✅ Sets clear expectations for coverage
- ✅ Explains when to use TDD

**What Makes This Effective:**
1. **Red-Green-Refactor:** Classic TDD cycle explained
2. **Practical Workflow:** Actual bash commands to follow
3. **Naming Conventions:** Behavior-driven test names
4. **Coverage Expectations:** Different for features vs. fixes

---

## Best Practices from These Examples

### 1. Separate Test Types Clearly
Define each type with:
- Purpose (what it tests)
- Location (where files go)
- Tools (what framework)
- Commands (how to run)

Example:
```markdown
## Unit Tests (Vitest)
- Test individual functions and components in isolation
- Mock external dependencies
- Aim for 80%+ code coverage
- Run: `pnpm test:unit`
```

### 2. Test Placement Conventions
Be explicit about file organization:
- Unit tests: `feature.ts` → `feature.test.ts` (co-located)
- Integration tests: `src/__tests__/integration/`
- E2E tests: `e2e/` directory

### 3. What to Test (and What Not To)
Provide explicit guidance with examples:
```markdown
✅ Do test: Business logic, user interactions, edge cases
❌ Don't test: Library internals, TypeScript types, getters/setters
```

### 4. Test Data Management
Document test data strategies:
- Factories for creating test objects
- Database seeding for integration tests
- Mock data location and usage

### 5. Test Structure Templates
Show the expected structure:
```typescript
describe('ComponentName', () => {
  describe('method/feature', () => {
    it('should behave in specific way', () => {
      // implementation
    })
  })
})
```

### 6. TDD Workflow Steps
For TDD-focused teams, provide:
1. The TDD cycle (Red-Green-Refactor)
2. When to use TDD vs. when not to
3. Step-by-step workflow with commands
4. Naming conventions for behavior-driven tests

### 7. Coverage Expectations
Set clear coverage goals:
- Overall project: 80%+
- New features: 100%
- Bug fixes: Must include regression test
- Refactoring: Maintain or improve coverage

### 8. Pre-Commit Testing Workflow
Provide a checklist:
```markdown
Before committing:
1. Run `pnpm test:unit` - Should complete in <10s
2. Run `pnpm type-check` - Catch type errors
3. Run `pnpm test:integration` - If you modified API
4. Run `pnpm test:e2e` - If you modified critical flows
```

### 9. Command Reference
Always include exact commands:
- How to run tests (`pnpm test`)
- Watch mode (`pnpm test:watch`)
- Coverage report (`pnpm test:coverage`)
- UI mode for debugging (`pnpm test:e2e:ui`)

### 10. CI Integration Note
Mention automated testing:
```markdown
CI pipeline runs all tests automatically on PR.
```

This sets expectations about what happens automatically vs. manually.
