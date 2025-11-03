# Example 3-4: Code Style and Conventions

This folder demonstrates framework-specific and multi-language coding conventions.

## Files

### `react-CLAUDE.md`
**Use Case:** React project with specific patterns

**Key Principles Demonstrated:**
- ✅ Specific, actionable guidelines
- ✅ Includes concrete examples
- ✅ Explains when to use each pattern
- ✅ Addresses common scenarios (errors, performance)
- ✅ Groups by concern (Components, State, Data, Styling, etc.)

**What Makes This Effective:**
1. **Concrete Examples:** Shows actual code, not just descriptions
2. **Clear Boundaries:** "Use X for Y, use Z for W"
3. **Performance Guidance:** Built into the conventions
4. **Error Handling:** Not an afterthought

---

### `fullstack-CLAUDE.md`
**Use Case:** Full-stack project with frontend and backend

**Key Principles Demonstrated:**
- ✅ Clear separation between frontend/backend
- ✅ Explains shared code organization
- ✅ Provides consistent patterns across stack
- ✅ Includes practical commands
- ✅ Documents conventions for each layer

**What Makes This Effective:**
1. **Location-First:** Tells you WHERE before HOW
2. **Consistency:** Same patterns on both sides where applicable
3. **Integration Points:** Shared types and API conventions
4. **Database Guidance:** Critical for full-stack apps

---

## Best Practices from These Examples

### 1. Framework-Specific Guidelines
Don't write generic advice. Be specific to your stack:
- React: Component patterns, hooks, state management
- Node.js: Async patterns, error handling
- Database: Prisma conventions, migration rules

### 2. Pattern Over Rules
Instead of "don't do X," explain what TO do:
- ✅ "Use React Query for all API calls"
- ❌ "Don't use fetch directly"

### 3. Examples Are Essential
Every pattern should have a code example showing:
```typescript
// ✅ Good: This
const example = goodPattern()

// ❌ Bad: Not this
const example = badPattern()
```

### 4. Organization by Concern
Group related guidelines:
- Component Patterns
- State Management
- Data Fetching
- Styling
- Error Handling
- Performance

### 5. Explain the "When"
Not just HOW to use something, but WHEN:
- "Use `useState` for local component state"
- "Use `useContext` for shared state within feature modules"
- "Use Zustand for global application state"

### 6. Multi-Language Projects
For full-stack projects:
1. Clearly separate frontend/backend sections
2. Document shared code location and patterns
3. Explain how layers communicate
4. Include conventions for each language/framework

### 7. API Conventions Matter
Document:
- URL structure
- HTTP method usage
- Request/response formats
- Error handling patterns
