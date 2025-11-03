# Sample Project: Claude Instructions Examples

This folder contains practical, ready-to-use examples of Claude instruction files (CLAUDE.md) following Anthropic's 2025 best practices for prompt engineering and context engineering for AI agents.

## 📁 Folder Structure

Each numbered folder contains example files demonstrating specific aspects of writing effective Claude instructions:

### 01-basic-config
**Basic Project Configuration**
- `minimal-CLAUDE.md` - Small project with essential information
- `comprehensive-CLAUDE.md` - Complex project with detailed requirements
- Demonstrates concise vs. comprehensive approaches

### 02-code-style
**Code Style and Conventions**
- `react-CLAUDE.md` - Framework-specific React guidelines
- `fullstack-CLAUDE.md` - Multi-language project with frontend/backend
- Shows how to document coding standards effectively

### 03-testing
**Testing Instructions**
- `comprehensive-testing-CLAUDE.md` - Multi-strategy testing approach
- `tdd-CLAUDE.md` - Test-driven development workflow
- Covers unit, integration, and E2E testing patterns

### 04-workflow
**Workflow and Process**
- `git-workflow-CLAUDE.md` - Git branching and commit conventions
- `cicd-CLAUDE.md` - CI/CD pipeline documentation
- Demonstrates workflow and deployment processes

### 05-tools
**Tool and Command Documentation**
- `custom-scripts-CLAUDE.md` - Custom development tools and scripts
- `external-tools-CLAUDE.md` - Third-party tool integration
- Shows how to document tooling and commands

### 06-architecture
**Architecture and Design Patterns**
- `ddd-CLAUDE.md` - Domain-Driven Design architecture
- `microservices-CLAUDE.md` - Microservices architecture
- Demonstrates architectural documentation patterns

### 07-advanced-context
**Advanced Context Engineering**
- `context-loading-CLAUDE.md` - Just-in-time context loading strategies
- `docs/` - Example of detailed on-demand documentation
- `notes/` - Feature tracking across sessions
- `contexts/` - Domain-specific context files
- Shows how to manage context efficiently in large codebases

### 08-multi-project
**Multi-Project Configurations**
- `monorepo-CLAUDE.md` - Monorepo with multiple packages
- `multi-env-CLAUDE.md` - Multi-environment configuration
- Covers complex project structures

### 09-collaboration
**Team Collaboration Guidelines**
- `code-review-CLAUDE.md` - Code review standards and processes
- `onboarding-CLAUDE.md` - New developer onboarding guide
- Demonstrates team collaboration documentation

### 10-performance
**Performance Optimization**
- `performance-CLAUDE.md` - Performance guidelines and budgets
- `debugging-CLAUDE.md` - Debugging and troubleshooting guide
- Shows how to document performance and debugging

## 🎯 How to Use These Examples

### 1. Start with Your Project Type
- **Small/personal project?** Check `01-basic-config/minimal-CLAUDE.md`
- **Team/production project?** Check `01-basic-config/comprehensive-CLAUDE.md`
- **Specific architecture?** Check `06-architecture/`

### 2. Mix and Match
These examples are modular. Combine sections from different files to create your ideal CLAUDE.md:

```markdown
# Your CLAUDE.md

[Basic config from 01-basic-config]
[Code style from 02-code-style]
[Testing from 03-testing]
[Workflow from 04-workflow]
[Architecture from 06-architecture]
```

### 3. Adapt to Your Stack
Replace framework-specific examples with your own:
- React → Vue/Angular/Svelte
- Prisma → TypeORM/Sequelize
- Next.js → Remix/Nuxt
- pnpm → npm/yarn

### 4. Start Simple, Expand Later
1. Begin with minimal configuration
2. Add sections as your project grows
3. Use advanced context strategies only when needed

## 🌟 Key Principles Demonstrated

### 1. Be Specific and Direct
❌ "Use good naming conventions"
✅ "Components: PascalCase (e.g., `UserProfile.tsx`)"

### 2. Treat Context as Precious
❌ List all 50 API endpoints in CLAUDE.md
✅ "API documented in `api-docs/openapi.yml`. Run `pnpm api:docs` to view."

### 3. Include Actionable Examples
Every guideline should show code:
```typescript
// ✅ Good: Do this
const example = goodPattern()

// ❌ Bad: Not this
const example = badPattern()
```

### 4. Structure Logically
- Use clear section headers
- Group related information
- Prioritize most important info first

### 5. Document the "Why"
Don't just say what to do, explain why:
- "API responses are cached for 5 minutes in development" (helps with debugging)
- "Never commit directly to `main`" (protects production)

### 6. Think Hierarchically
- **Root CLAUDE.md:** Essential info only
- **Detailed docs:** Load on demand (see `07-advanced-context/`)
- **Sub-contexts:** Domain-specific (database, frontend, deployment)

## 📚 Best Practice Patterns

### Command Documentation
```markdown
## Commands
- `pnpm dev` - Start dev server (port 5173)
- `pnpm test` - Run all tests
- `pnpm build` - Production build
```

### Code Examples
```markdown
## Pattern Name
Use for: [When to use this]

```typescript
// Code example
const example = implementation()
```

Why: [Explanation]
```

### Good vs. Bad Examples
```markdown
✅ Good:
- "feat: add email validation to signup form"

❌ Bad:
- "updated files"
```

### File Location Guidance
```markdown
## Architecture
- `src/components/` - Reusable UI components
- `src/features/` - Feature-based modules
- `src/lib/` - Utility functions
```

### Troubleshooting Format
```markdown
#### "Error message"
**Symptoms:** Description of the issue

**Solution:**
```bash
command to fix
```
```

## 🔄 Context Management Strategies

### For Small Projects (<50 files)
- Single comprehensive CLAUDE.md
- All information in one place
- See: `01-basic-config/comprehensive-CLAUDE.md`

### For Medium Projects (50-500 files)
- Core CLAUDE.md with essentials
- Link to detailed docs for deep dives
- See: `07-advanced-context/context-loading-CLAUDE.md`

### For Large Projects (500+ files)
- Minimal CLAUDE.md with pointers
- Detailed on-demand documentation
- Domain-specific context files
- Feature tracking across sessions
- See: `07-advanced-context/` folder structure

## 🛠️ Customization Guide

### Replace These Placeholders
When adapting examples to your project:

- `myapp` → Your app name
- `@myorg/package` → Your organization/package name
- `pnpm` → Your package manager (npm/yarn/bun)
- Port numbers → Your actual ports
- Tech stack → Your frameworks/libraries
- Team channels → Your Slack/Discord channels
- Deployment platforms → Your infrastructure

### Add Your Specifics
- **Commands:** Your actual npm scripts
- **Architecture:** Your folder structure
- **Conventions:** Your team's standards
- **Tools:** Your development tools
- **Processes:** Your workflows

## 📖 Reading the Examples

Each folder contains:

### 1. Example Files
Actual CLAUDE.md files you can copy and adapt

### 2. README.md
- Explains the example
- Lists key principles demonstrated
- Provides best practices
- Shows what makes each example effective

## 🚀 Quick Start

1. **Choose your starting point:**
   ```bash
   # For a new small project
   cp 01-basic-config/minimal-CLAUDE.md .claude/CLAUDE.md

   # For a team project
   cp 01-basic-config/comprehensive-CLAUDE.md .claude/CLAUDE.md
   ```

2. **Add sections as needed:**
   - Testing? Add from `03-testing/`
   - Architecture? Add from `06-architecture/`
   - Performance? Add from `10-performance/`

3. **Customize for your stack:**
   - Replace framework names
   - Update commands
   - Adjust file paths
   - Add your conventions

4. **Iterate and refine:**
   - Start minimal
   - Add detail as project grows
   - Remove outdated information
   - Keep it current

## 📊 Example Selection Matrix

| Project Type | Recommended Starting Point |
|--------------|---------------------------|
| Personal/hobby project | `01-basic-config/minimal-CLAUDE.md` |
| Small team project | `01-basic-config/comprehensive-CLAUDE.md` |
| React frontend | `02-code-style/react-CLAUDE.md` |
| Full-stack app | `02-code-style/fullstack-CLAUDE.md` |
| Microservices | `06-architecture/microservices-CLAUDE.md` |
| Complex domain logic | `06-architecture/ddd-CLAUDE.md` |
| Monorepo | `08-multi-project/monorepo-CLAUDE.md` |
| Large codebase | `07-advanced-context/context-loading-CLAUDE.md` |

## 💡 Tips for Success

### 1. Keep It Current
Update CLAUDE.md when:
- Adding new scripts or commands
- Changing architecture
- Adopting new tools
- Establishing new conventions

### 2. Make It Scannable
- Use headers and subheaders
- Include code examples
- Add bullet points
- Keep paragraphs short

### 3. Test with Claude
After creating your CLAUDE.md:
- Ask Claude to perform common tasks
- See if instructions are clear
- Refine based on results

### 4. Version Control
- Commit CLAUDE.md to your repository
- Review in PRs like regular code
- Update as part of feature work

### 5. Team Alignment
- Review CLAUDE.md in team meetings
- Get feedback from new developers
- Keep it aligned with actual practices

## 🔗 Related Resources

- Main documentation: `../agent/examples/claude-instructions-examples.md`
- Anthropic's official guides: https://docs.anthropic.com/
- Claude Code best practices: https://www.anthropic.com/engineering/claude-code-best-practices

## 📝 Contributing

These examples are based on Anthropic's 2025 best practices. As practices evolve:
- Update examples to reflect new guidance
- Add new categories as needed
- Improve examples based on real-world usage
- Share learnings with the team

---

**Remember:** The best CLAUDE.md is one that helps Claude help you effectively. Start simple, iterate based on results, and keep it aligned with how you actually work.
