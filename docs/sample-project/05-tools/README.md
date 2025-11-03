# Example 9-10: Tool and Command Documentation

This folder demonstrates how to document custom scripts and external tools.

## Files

### `custom-scripts-CLAUDE.md`
**Use Case:** Project with custom development tools

**Key Principles Demonstrated:**
- ✅ Groups commands by category
- ✅ Provides examples for complex commands
- ✅ Includes troubleshooting section
- ✅ Explains what each command does
- ✅ Shows command parameters and usage

**What Makes This Effective:**
1. **Categorization:** Database, Code Gen, Build, Dev Utils, Debugging, Docs, Troubleshooting
2. **Parameter Examples:** Shows how to use commands with arguments
3. **Output Descriptions:** Explains what each command creates/produces
4. **Troubleshooting Section:** Common issues and fixes

---

### `external-tools-CLAUDE.md`
**Use Case:** Project using multiple external tools

**Key Principles Demonstrated:**
- ✅ Documents all external dependencies
- ✅ Provides setup instructions
- ✅ Explains how tools integrate with project
- ✅ Includes practical usage examples
- ✅ Lists service URLs and ports

**What Makes This Effective:**
1. **Tool Inventory:** Lists all external tools upfront
2. **Service URLs:** Exact URLs for accessing services
3. **Integration Instructions:** How to set up and use each tool
4. **VS Code Integration:** Editor-specific guidance

---

## Best Practices from These Examples

### 1. Command Categorization
Group related commands logically:
```markdown
## Database Management
### Migrations
- `pnpm db:migrate`
- `pnpm db:migrate:reset`

### Seeding
- `pnpm db:seed`
- `pnpm db:seed:prod`
```

### 2. Parameter Documentation
Show commands with examples:
```markdown
- `pnpm generate:component <name>` - Scaffold new component
  - Example: `pnpm generate:component UserCard`
  - Creates: `UserCard.tsx`, `UserCard.test.tsx`, `UserCard.module.css`
```

### 3. Tool Purpose
Explain what each tool does:
```markdown
## GitHub CLI (gh)
Already installed. Used for PR management.
```

### 4. Service URLs
Document exact access points:
```markdown
### Service URLs
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`
- Mailhog (email testing): `http://localhost:8025`
```

### 5. Docker Integration
Provide docker-compose commands:
```bash
docker-compose up -d     # Start all services
docker-compose up -d db  # Start only database
docker-compose down      # Stop all services
```

### 6. Editor Integration
List recommended extensions:
```markdown
## VS Code Integration
Recommended extensions (see `.vscode/extensions.json`):
- ESLint - Code linting
- Prettier - Code formatting
- Prisma - Database schema
```

### 7. Step-by-Step Tool Usage
Provide workflows for tools:
```markdown
Example:
1. Open `api-tests/auth.http`
2. Click "Send Request" above any request
3. View response in side panel
```

### 8. Installation Instructions
Document setup for tools requiring installation:
```markdown
1. Install: `brew install direnv` (macOS)
2. Add to shell: `eval "$(direnv hook bash)"`
3. Allow directory: `direnv allow`
```

### 9. Troubleshooting Commands
Provide a numbered list of fixes:
```markdown
If you encounter issues:
1. `pnpm clean` - Remove node_modules, dist, .cache
2. `pnpm install` - Fresh install dependencies
3. `pnpm db:migrate:reset` - Reset database
```

### 10. Environment Management
Document environment variable tools:
```markdown
Environment files:
- `.env.local` - Your local overrides
- `.env.example` - Template (commit this)
- `.envrc` - Direnv config
```

### 11. Command Descriptions
Always explain what happens:
```markdown
- `pnpm analyze` - Analyze bundle size (opens visualization)
- `pnpm bundle:report` - Generate report in `dist/report.html`
```

### 12. Port Numbers
Document all ports used:
```markdown
- Development server: port 5173
- Mock API: port 3001
- Storybook: port 6006
- Prisma Studio: port 5555
```

This helps Claude understand the development environment and avoid port conflicts.
