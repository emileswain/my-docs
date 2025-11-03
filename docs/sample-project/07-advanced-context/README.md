# Example 13-14: Advanced Context Engineering

This folder demonstrates advanced context management strategies for large codebases.

## Files

### `context-loading-CLAUDE.md`
**Use Case:** Large codebase with just-in-time context

**Key Principles Demonstrated:**
- ✅ Treats context as a finite resource
- ✅ Provides strategies for large codebases
- ✅ Uses just-in-time loading patterns
- ✅ Implements structured memory persistence
- ✅ Lightweight identifiers instead of full documentation

**What Makes This Effective:**
1. **Two-Tier Documentation:** Core CLAUDE.md + detailed on-demand docs
2. **Lightweight Identifiers:** Points to where info lives, doesn't duplicate it
3. **Session Summaries:** Template for compacting context
4. **Structured Notes:** Feature tracking across sessions
5. **Sub-Context Pattern:** Specialized context files for specific domains

---

### Supporting Files

#### `docs/architecture.md`
Example of detailed documentation loaded on-demand.

**When to Use:**
- Making architectural decisions
- Adding major features
- Refactoring large sections

#### `notes/user-authentication-feature.md`
Example of feature tracking across sessions.

**Contains:**
- Completed tasks
- In-progress work
- Blockers
- Key decisions
- Modified files
- Last updated timestamp

#### `contexts/database.md`
Example of domain-specific context.

**When to Load:**
- Working on migrations
- Optimizing queries
- Debugging database issues

---

## Best Practices from These Examples

### 1. Context as a Finite Resource
Treat context window like memory:
```markdown
Keep in CLAUDE.md:
- Essential commands (top 5-10 only)
- Critical warnings
- Links to detailed docs

Keep in separate files:
- Detailed architecture
- Complete testing guide
- Deployment procedures
```

### 2. Lightweight Identifiers
Point to information, don't duplicate it:

**❌ Don't:**
```markdown
Components:
- Button - A button with 15 variants including primary, secondary...
- Input - A text input with validation, error states...
[48 more components with full descriptions]
```

**✅ Do:**
```markdown
Components in `src/components/`.
See Storybook for documentation.
```

### 3. On-Demand Loading Instructions
Tell Claude when to load detailed docs:
```markdown
"Check `.claude/docs/architecture.md` for full service structure"
"Reference `.claude/docs/testing.md` for integration patterns"
```

### 4. Session Summary Template
Provide a template for context compaction:
```markdown
"Please summarize what we've accomplished:
1. Files modified and key changes
2. Current task status
3. Next steps
4. Any blockers or decisions needed

Keep summary under 200 words."
```

### 5. Structured Feature Notes
Track complex features across sessions:
```markdown
# Feature: [Name]
## Status: [In Progress/Blocked/Completed]

### Completed
- [x] Task 1
- [x] Task 2

### In Progress
- [ ] Task 3

### Blocked
- [ ] Task 4 (reason)

### Key Decisions
- Decision 1
- Decision 2

### Files Modified
- file1.ts
- file2.ts

Last updated: YYYY-MM-DD
```

### 6. Sub-Context Files
Create domain-specific context files:
```
.claude/contexts/
├── database.md      # DB-specific context
├── frontend.md      # UI-specific context
├── api.md          # API-specific context
└── deployment.md    # DevOps context
```

Usage instruction:
```markdown
"Load context from `.claude/contexts/database.md` before working on migrations."
```

### 7. Two-Tier Documentation Strategy

**Tier 1: Core CLAUDE.md (Always Loaded)**
- Essential commands
- Critical warnings
- Project overview
- Links to detailed docs

**Tier 2: Detailed Docs (Load on Demand)**
- Complete architecture guide
- Full testing documentation
- Deployment procedures
- Troubleshooting guides

### 8. Document When to Reference
In detailed docs, explain when to load them:
```markdown
## When to Reference This File
- When making architectural decisions
- When adding new major features
- When refactoring large sections
```

### 9. Avoid Context Bloat
**What NOT to include in CLAUDE.md:**
- Complete component catalogs
- All API endpoint documentation
- Full database schema
- Entire test suite documentation

**Instead:**
- Point to where this information lives
- Provide just enough to get started
- Reference external docs/tools

### 10. Context Retrieval Patterns

**Pattern 1: Just-in-Time**
```markdown
API endpoints documented in `api-docs/openapi.yml`.
Use `pnpm api:docs` to view.
```

**Pattern 2: External Tools**
```markdown
Component documentation in Storybook.
Run `pnpm storybook` to browse.
```

**Pattern 3: Generated Documentation**
```markdown
Database schema in Prisma Studio.
Run `pnpm db:studio` to explore.
```

### 11. Feature Lifecycle Tracking
Track features across multiple sessions:
- Status indicator (In Progress/Blocked/Completed)
- Completed tasks checklist
- Current work
- Blockers with reasons
- Key technical decisions
- Modified files list
- Last updated timestamp

### 12. Decision Documentation
Capture key decisions in feature notes:
```markdown
### Key Decisions
- Using bcrypt for hashing (12 rounds)
- Token expiry: 7 days
- Refresh tokens in Redis
```

This prevents re-discussing decisions across sessions.
