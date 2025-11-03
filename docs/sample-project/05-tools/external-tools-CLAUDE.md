# External Tools & Services

## GitHub CLI (gh)
Already installed. Used for PR management.

### Common Commands
- `gh pr create` - Create pull request
- `gh pr view` - View current PR in browser
- `gh pr checks` - View CI check status
- `gh issue list` - List open issues
- `gh repo view --web` - Open repo in browser

## Docker Services
Some services run in Docker containers.

### Starting Services
```bash
docker-compose up -d     # Start all services
docker-compose up -d db  # Start only database
```

### Service URLs
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`
- Mailhog (email testing): `http://localhost:8025`

### Stopping Services
```bash
docker-compose down      # Stop all services
docker-compose down -v   # Stop and remove volumes
```

## VS Code Integration
Recommended extensions (see `.vscode/extensions.json`):
- ESLint - Code linting
- Prettier - Code formatting
- Prisma - Database schema
- Error Lens - Inline errors
- REST Client - Test API endpoints

## API Testing
Use the REST Client extension with files in `api-tests/`:
- `api-tests/auth.http` - Authentication endpoints
- `api-tests/users.http` - User CRUD operations
- `api-tests/posts.http` - Post operations

Example:
1. Open `api-tests/auth.http`
2. Click "Send Request" above any request
3. View response in side panel

## Storybook
Component development environment.
- `pnpm storybook` - Start Storybook (port 6006)
- Stories located in `src/components/**/*.stories.tsx`
- Add story for every reusable component

## Environment Management
Use `direnv` for automatic environment variable loading:
1. Install: `brew install direnv` (macOS) or `apt install direnv` (Linux)
2. Add to shell: `eval "$(direnv hook bash)"` (or zsh/fish)
3. Allow directory: `direnv allow`

Environment files:
- `.env.local` - Your local development overrides
- `.env.example` - Template (commit this)
- `.envrc` - Direnv config (auto-loads .env.local)
