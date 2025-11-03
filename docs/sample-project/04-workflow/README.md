# Example 7-8: Workflow and Process

This folder demonstrates Git workflows and CI/CD process documentation.

## Files

### `git-workflow-CLAUDE.md`
**Use Case:** Team collaboration with git conventions

**Key Principles Demonstrated:**
- ✅ Complete workflow from start to finish
- ✅ Includes specific examples and commands
- ✅ Sets expectations for both code authors and reviewers
- ✅ Uses industry-standard conventions (Conventional Commits)
- ✅ Provides executable bash snippets

**What Makes This Effective:**
1. **Branch Strategy:** Clear naming and purpose for each branch type
2. **Step-by-Step Workflows:** Actual commands to copy/paste
3. **Commit Message Standards:** Examples of good vs. bad
4. **Review Guidelines:** For both reviewers and authors

---

### `cicd-CLAUDE.md`
**Use Case:** Automated deployment pipeline

**Key Principles Demonstrated:**
- ✅ Documents automated processes clearly
- ✅ Provides emergency rollback procedures
- ✅ Separates staging and production concerns
- ✅ Security reminders about secrets
- ✅ Lists monitoring tools and where to check them

**What Makes This Effective:**
1. **Automated Checks:** Lists what runs automatically
2. **Environment Separation:** Staging vs. Production clearly defined
3. **Rollback Instructions:** Emergency procedures documented
4. **Monitoring Integration:** Where to check for issues

---

## Best Practices from These Examples

### 1. Executable Workflows
Provide copy-pasteable bash commands:
```bash
# Start from develop
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/my-feature
```

### 2. Branch Naming Conventions
Document the strategy clearly:
- `main` - Production (protected)
- `develop` - Integration
- `feature/*` - New features
- `fix/*` - Bug fixes
- `hotfix/*` - Emergency fixes

### 3. Commit Message Standards
Use industry standards (Conventional Commits):
- Show the format: `type: description`
- List all types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- Provide good and bad examples

### 4. Pull Request Process
Document the full cycle:
1. Create PR
2. Fill template
3. Ensure CI passes
4. Request review
5. Address feedback
6. Merge

### 5. Code Review Guidelines
Provide guidance for BOTH sides:
- **When reviewing:** What to check, how to give feedback
- **When being reviewed:** How to respond, what's expected

### 6. CI/CD Automation
List what runs automatically:
- Linting
- Type checking
- Tests
- Build
- E2E tests (on PRs)

### 7. Deployment Triggers
Be explicit about what triggers deployments:
- **Staging:** Push to `develop` (automatic)
- **Production:** Tag push (manual approval required)

### 8. Environment Configuration
Document where secrets live:
- Development: `.env.local` (gitignored)
- Staging/Production: Platform settings (encrypted)
- Reminder: Never commit secrets

### 9. Monitoring and Alerts
Tell Claude where to check for issues:
- Error tracking: Sentry
- Performance: Vercel Analytics
- Uptime: Better Uptime
- Alerts: Slack #alerts channel

### 10. Emergency Procedures
Document rollback process:
```bash
# Exact commands for rollback
git checkout main
git tag v1.2.4-rollback v1.2.2
git push origin v1.2.4-rollback
```

Plus notification requirements: "Notify team in #engineering channel"

### 11. Step-by-Step Processes
Break down complex workflows:
```markdown
## Pull Request Process
1. Create PR from feature branch to `develop`
2. Fill out PR template completely
3. Ensure all CI checks pass
4. Request review from at least one team member
5. Address review feedback
6. Squash and merge when approved
```

### 12. Good vs. Bad Examples
Always show both:
```markdown
✅ `feat: add email validation to signup form`
❌ `updated files`
```

This helps Claude understand the pattern, not just the rule.
