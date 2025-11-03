# Git Workflow

## Branch Strategy
- `main` - Production-ready code (protected)
- `develop` - Integration branch for features
- `feature/*` - New features (e.g., `feature/user-authentication`)
- `fix/*` - Bug fixes (e.g., `fix/login-error`)
- `hotfix/*` - Emergency production fixes

## Creating a Feature
```bash
# Start from develop
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/my-feature

# Work on feature...
git add .
git commit -m "feat: add user profile page"

# Push and create PR
git push -u origin feature/my-feature
```

## Commit Message Format
Follow Conventional Commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, no logic change)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:
- ✅ `feat: add email validation to signup form`
- ✅ `fix: resolve infinite loop in data fetching`
- ✅ `refactor: extract authentication logic to custom hook`
- ❌ `updated files`
- ❌ `fix bug`

## Pull Request Process
1. Create PR from feature branch to `develop`
2. Fill out PR template completely
3. Ensure all CI checks pass (tests, linting, type-check)
4. Request review from at least one team member
5. Address review feedback
6. Squash and merge when approved

## Code Review Guidelines
When reviewing:
- Check for code style consistency
- Verify tests are included and passing
- Look for potential edge cases
- Suggest improvements kindly
- Approve if changes are minor or optional

When being reviewed:
- Respond to all comments
- Ask questions if feedback is unclear
- Make requested changes or explain why not
- Thank reviewers for their time
