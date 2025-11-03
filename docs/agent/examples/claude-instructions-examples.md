# Claude Instructions Examples

This document provides comprehensive examples of Claude instructions following Anthropic's 2025 best practices for prompt engineering and context engineering for AI agents.

## Table of Contents

- [Basic Project Configuration](#basic-project-configuration)
- [Code Style and Conventions](#code-style-and-conventions)
- [Testing Instructions](#testing-instructions)
- [Workflow and Process](#workflow-and-process)
- [Tool and Command Documentation](#tool-and-command-documentation)
- [Architecture and Design Patterns](#architecture-and-design-patterns)
- [Advanced Context Engineering](#advanced-context-engineering)
- [Multi-Project Configurations](#multi-project-configurations)
- [Team Collaboration Guidelines](#team-collaboration-guidelines)
- [Performance Optimization](#performance-optimization)

---

## Basic Project Configuration

### Example 1: Minimal Starter CLAUDE.md

**Use Case:** Small project with basic needs

```markdown
# Project: my-app

## Commands
- `npm run dev` - Start development server on port 3000
- `npm run build` - Build for production
- `npm test` - Run test suite

## Code Style
- Use TypeScript strict mode
- Prefer functional components with hooks
- Use named exports

## Key Files
- `src/App.tsx` - Main application entry
- `src/lib/utils.ts` - Common utilities
```

**Why This Works:**
- Concise and focused on essentials
- Uses clear section headers
- Lists only the most common commands

---

### Example 2: Comprehensive Project Setup

**Use Case:** Complex project with detailed requirements

```markdown
# Project: enterprise-dashboard

## Overview
A React-based enterprise dashboard with real-time analytics. Uses TypeScript, Vite, and TailwindCSS.

## Environment Setup
- Node version: 20.x (use nvm: `nvm use`)
- Package manager: pnpm (not npm or yarn)
- Required env vars: Copy `.env.example` to `.env.local`

## Commands
### Development
- `pnpm dev` - Start dev server (port 5173)
- `pnpm dev:api` - Start mock API server (port 3001)
- `pnpm dev:all` - Start both dev and API servers concurrently

### Building
- `pnpm build` - Production build
- `pnpm build:staging` - Staging build with source maps
- `pnpm preview` - Preview production build locally

### Testing
- `pnpm test` - Run all tests
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:coverage` - Generate coverage report
- `pnpm test:e2e` - Run Playwright E2E tests

### Quality
- `pnpm lint` - Lint with ESLint
- `pnpm type-check` - TypeScript type checking
- `pnpm format` - Format with Prettier

## Code Style
- TypeScript strict mode enabled
- Use ES modules (import/export)
- Prefer arrow functions for components
- Destructure props at function signature
- Use absolute imports via `@/` alias
- Max line length: 100 characters
- Use single quotes for strings
- Always add semicolons

## Architecture
### Directory Structure
- `src/components/` - Reusable UI components
- `src/features/` - Feature-based modules
- `src/hooks/` - Custom React hooks
- `src/lib/` - Utility functions and shared logic
- `src/services/` - API integration layer
- `src/types/` - TypeScript type definitions

### Naming Conventions
- Components: PascalCase (e.g., `UserProfile.tsx`)
- Hooks: camelCase starting with 'use' (e.g., `useAuth.ts`)
- Utils: camelCase (e.g., `formatDate.ts`)
- Constants: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)

## Important Notes
- Always run type-check before committing
- Never commit directly to `main` - use feature branches
- API responses are cached for 5 minutes in development
- The `deprecated/` folder contains legacy code - do not modify
```

**Why This Works:**
- Provides comprehensive context without being overwhelming
- Groups related information logically
- Includes crucial warnings and constraints
- Explains the "why" behind conventions

---

## Code Style and Conventions

### Example 3: Framework-Specific Guidelines

**Use Case:** React project with specific patterns

```markdown
# React Best Practices

## Component Patterns
- Use functional components exclusively
- Co-locate component files: `Button.tsx`, `Button.test.tsx`, `Button.module.css`
- Keep components under 200 lines; split if larger

## State Management
- Use `useState` for local component state
- Use `useContext` for shared state within feature modules
- Use Zustand for global application state (store in `src/stores/`)

## Data Fetching
- Use React Query for all API calls
- Query keys follow pattern: `['resource', id, filters]`
- Mutations should invalidate related queries
- Example:
  ```typescript
  const { data } = useQuery(['users', userId], () => fetchUser(userId))
  ```

## Styling
- Use CSS modules (`.module.css` extension)
- Prefix utility classes with `u-` (e.g., `u-mt-4`)
- Prefix component-specific classes with component name (e.g., `button-primary`)
- Use TailwindCSS utility classes for spacing and layout
- Custom styles only for complex components

## Error Handling
- Always provide user-friendly error messages
- Log errors to console in development
- Use Error Boundary components for component tree errors
- Network errors should display retry option

## Performance
- Memoize expensive calculations with `useMemo`
- Memoize callbacks passed to children with `useCallback`
- Lazy load route components with `React.lazy()`
- Use virtual scrolling for lists over 100 items
```

**Why This Works:**
- Specific, actionable guidelines
- Includes concrete examples
- Explains when to use each pattern
- Addresses common scenarios (errors, performance)

---

### Example 4: Multi-Language Project

**Use Case:** Full-stack project with frontend and backend

```markdown
# Full-Stack Project Guidelines

## Frontend (React/TypeScript)
- **Location:** `apps/web/`
- **Style:** Functional components, TypeScript strict
- **Imports:** Use `@web/` for absolute imports
- **API calls:** Use `src/api/client.ts` wrapper (handles auth)

## Backend (Node.js/Express)
- **Location:** `apps/api/`
- **Style:** ES modules, async/await (no callbacks)
- **Error handling:** Use `ApiError` class from `src/errors.ts`
- **Database:** Prisma ORM (models in `prisma/schema.prisma`)
- **Authentication:** JWT tokens (utility in `src/auth/jwt.ts`)

## Shared Code
- **Location:** `packages/shared/`
- **Contains:** TypeScript types, validation schemas, constants
- **Import in apps:** `import { UserSchema } from '@shared/types'`

## API Conventions
- RESTful endpoints: `/api/v1/resource`
- Use plural nouns: `/users`, `/posts`
- HTTP methods: GET (read), POST (create), PATCH (update), DELETE (remove)
- Response format: `{ data: {...}, error: null }` or `{ data: null, error: {...} }`

## Database
- Use migrations for schema changes: `pnpm prisma migrate dev`
- Seed data for development: `pnpm prisma db seed`
- Never modify migration files after they're committed
```

**Why This Works:**
- Clear separation between frontend/backend
- Explains shared code organization
- Provides consistent patterns across stack
- Includes practical commands

---

## Testing Instructions

### Example 5: Comprehensive Testing Guide

**Use Case:** Project with multiple testing strategies

```markdown
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
```

**Why This Works:**
- Clear distinction between test types
- Provides concrete examples and structure
- Includes dos and don'ts
- Integrates with development workflow

---

### Example 6: TDD-Focused Instructions

**Use Case:** Team practicing test-driven development

```markdown
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
```

**Why This Works:**
- Teaches methodology, not just mechanics
- Provides clear workflow steps
- Shows examples of good vs. bad practices
- Sets clear expectations for coverage

---

## Workflow and Process

### Example 7: Git Workflow Instructions

**Use Case:** Team collaboration with git conventions

```markdown
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
```

**Why This Works:**
- Complete workflow from start to finish
- Includes specific examples and commands
- Sets expectations for both code authors and reviewers
- Uses industry-standard conventions

---

### Example 8: CI/CD Process Documentation

**Use Case:** Automated deployment pipeline

```markdown
# CI/CD Pipeline

## Automated Checks (GitHub Actions)
Every push and PR triggers:
1. **Lint** - ESLint checks code style
2. **Type Check** - TypeScript compilation
3. **Unit Tests** - Vitest test suite
4. **Build** - Vite production build
5. **E2E Tests** - Playwright critical paths (PR only)

All checks must pass before merge is allowed.

## Deployment Process

### Staging (Automatic)
- Triggers on: Push to `develop` branch
- Deploys to: https://staging.myapp.com
- Use for: QA testing, client demos
- Data: Staging database (refreshed weekly)

### Production (Manual)
- Triggers on: Tag push (e.g., `v1.2.3`)
- Deploys to: https://myapp.com
- Requires: Manual approval from tech lead
- Process:
  ```bash
  # Create release tag
  git checkout main
  git tag v1.2.3
  git push origin v1.2.3
  ```

## Monitoring
- Error tracking: Sentry (check #alerts channel)
- Performance: Vercel Analytics
- Uptime: Better Uptime (pings every 30s)

## Rollback Process
If production deployment fails:
```bash
# Revert to previous version
git checkout main
git tag v1.2.4-rollback v1.2.2
git push origin v1.2.4-rollback
```
Notify team in #engineering channel.

## Environment Variables
- Development: `.env.local` (not committed)
- Staging: Set in Vercel project settings
- Production: Set in Vercel project settings (encrypted)
- Never commit secrets to repository
```

**Why This Works:**
- Documents automated processes clearly
- Provides emergency rollback procedures
- Separates staging and production concerns
- Security reminders about secrets

---

## Tool and Command Documentation

### Example 9: Custom Scripts and Tools

**Use Case:** Project with custom development tools

```markdown
# Custom Development Tools

## Database Management
### Migrations
- `pnpm db:migrate` - Create and apply new migration
- `pnpm db:migrate:reset` - Reset database and reapply all migrations
- `pnpm db:migrate:status` - Check migration status

### Seeding
- `pnpm db:seed` - Populate database with test data
- `pnpm db:seed:prod` - Minimal production seed data

### Utilities
- `pnpm db:studio` - Open Prisma Studio GUI (http://localhost:5555)
- `pnpm db:backup` - Create local backup in `backups/`

## Code Generation
- `pnpm generate:component <name>` - Scaffold new component with tests
  - Example: `pnpm generate:component UserCard`
  - Creates: `UserCard.tsx`, `UserCard.test.tsx`, `UserCard.module.css`
- `pnpm generate:api <resource>` - Generate CRUD API endpoints
  - Example: `pnpm generate:api product`
  - Creates: Routes, controller, validation, tests

## Build Tools
- `pnpm analyze` - Analyze bundle size (opens visualization)
- `pnpm bundle:report` - Generate bundle report in `dist/report.html`
- `pnpm check:deps` - Check for outdated dependencies
- `pnpm update:deps` - Interactive dependency updater

## Development Utilities
- `pnpm dev:https` - Run dev server with HTTPS (for OAuth testing)
- `pnpm dev:network` - Expose dev server on local network
- `pnpm mock:api` - Run mock API server standalone (port 3001)

## Debugging
- `pnpm debug:build` - Build with source maps and debug info
- `pnpm debug:test <file>` - Run single test file with debugger attached
  - Example: `pnpm debug:test src/components/Button.test.tsx`

## Documentation
- `pnpm docs:dev` - Start documentation site (port 4000)
- `pnpm docs:build` - Build static documentation
- `pnpm docs:api` - Generate API documentation from JSDoc comments

## Troubleshooting Commands
If you encounter issues:
1. `pnpm clean` - Remove node_modules, dist, .cache
2. `pnpm install` - Fresh install dependencies
3. `pnpm db:migrate:reset` - Reset database if schema issues
4. `rm -rf .vite` - Clear Vite cache
```

**Why This Works:**
- Groups commands by category
- Provides examples for complex commands
- Includes troubleshooting section
- Explains what each command does

---

### Example 10: External Tools Integration

**Use Case:** Project using multiple external tools

```markdown
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
```

**Why This Works:**
- Documents all external dependencies
- Provides setup instructions
- Explains how tools integrate with project
- Includes practical usage examples

---

## Architecture and Design Patterns

### Example 11: Domain-Driven Design

**Use Case:** Complex application with domain logic

```markdown
# Architecture: Domain-Driven Design

## Project Structure
```
src/
├── domain/          # Core business logic
│   ├── entities/    # Business entities
│   ├── valueObjects/ # Immutable value types
│   ├── services/    # Domain services
│   └── events/      # Domain events
├── application/     # Use cases and application services
├── infrastructure/  # External services (DB, API, etc.)
└── presentation/    # UI layer (React components)
```

## Layer Responsibilities

### Domain Layer (src/domain/)
- Contains core business logic
- No dependencies on other layers
- Pure TypeScript (no React, no database)
- Example entities: `User`, `Order`, `Product`

```typescript
// domain/entities/Order.ts
export class Order {
  constructor(
    public readonly id: OrderId,
    public readonly items: OrderItem[],
    public readonly status: OrderStatus
  ) {}

  calculateTotal(): Money {
    // Pure business logic
  }

  canBeCancelled(): boolean {
    return this.status === 'pending' || this.status === 'confirmed'
  }
}
```

### Application Layer (src/application/)
- Orchestrates domain objects
- Implements use cases
- Coordinates transactions
- Example services: `CreateOrderUseCase`, `CancelOrderUseCase`

```typescript
// application/useCases/CreateOrder.ts
export class CreateOrderUseCase {
  async execute(input: CreateOrderInput): Promise<OrderDto> {
    // 1. Load domain objects
    // 2. Execute business logic
    // 3. Persist changes
    // 4. Return DTO
  }
}
```

### Infrastructure Layer (src/infrastructure/)
- Implements interfaces defined by domain
- Database access (repositories)
- External API calls
- File system access
- Example: `PostgresOrderRepository`, `StripePaymentGateway`

### Presentation Layer (src/presentation/)
- React components
- Calls application layer use cases
- Displays data to users
- Handles user input

## Key Patterns

### Repository Pattern
Abstracts data access:
```typescript
// domain/repositories/OrderRepository.ts (interface)
export interface OrderRepository {
  findById(id: OrderId): Promise<Order | null>
  save(order: Order): Promise<void>
}

// infrastructure/repositories/PostgresOrderRepository.ts (implementation)
export class PostgresOrderRepository implements OrderRepository {
  // Prisma implementation
}
```

### Value Objects
Immutable types with behavior:
```typescript
// domain/valueObjects/Money.ts
export class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: Currency
  ) {
    if (amount < 0) throw new Error('Amount cannot be negative')
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot add different currencies')
    }
    return new Money(this.amount + other.amount, this.currency)
  }
}
```

### Domain Events
Communicate between bounded contexts:
```typescript
// domain/events/OrderPlaced.ts
export class OrderPlaced implements DomainEvent {
  constructor(
    public readonly orderId: OrderId,
    public readonly occurredAt: Date
  ) {}
}

// Publish after order creation
eventBus.publish(new OrderPlaced(order.id, new Date()))
```

## Guidelines
- Domain layer should have no framework dependencies
- Use cases should be thin orchestrators
- Repositories abstract all data access
- Value objects for concepts with behavior but no identity
- Domain events for cross-boundary communication
```

**Why This Works:**
- Provides clear architectural vision
- Explains layer responsibilities with examples
- Shows concrete code patterns
- Guides developers on where to put new code

---

### Example 12: Microservices Architecture

**Use Case:** Multiple services in a monorepo

```markdown
# Microservices Architecture

## Services Overview
```
services/
├── auth-service/       # Authentication & authorization
├── user-service/       # User profile management
├── order-service/      # Order processing
├── payment-service/    # Payment processing
├── notification-service/ # Email & SMS notifications
└── api-gateway/        # Public API & routing
```

## Service Communication

### Synchronous (REST)
Use for: Immediate response needed
- HTTP calls between services
- Use shared types from `packages/types`
- Implement circuit breakers (all configured in service code)

### Asynchronous (Message Queue)
Use for: Fire-and-forget operations
- RabbitMQ for message bus
- Each service subscribes to relevant queues
- Example: Order created → Payment service processes → Notification service emails

## Service Structure
Each service follows this pattern:
```
service-name/
├── src/
│   ├── api/           # REST endpoints
│   ├── domain/        # Business logic
│   ├── infrastructure/ # Database, message queue
│   ├── messaging/     # Message handlers
│   └── index.ts       # Service entry point
├── prisma/            # Database schema
├── Dockerfile
└── package.json
```

## Development Workflow

### Running All Services
```bash
pnpm dev:all  # Starts all services + gateway
```

### Running Single Service
```bash
cd services/auth-service
pnpm dev
```

### Service Ports
- API Gateway: 4000
- Auth Service: 4001
- User Service: 4002
- Order Service: 4003
- Payment Service: 4004
- Notification Service: 4005

## Inter-Service Communication

### Direct HTTP Call Example
```typescript
// In order-service
import { userServiceClient } from '@shared/clients'

const user = await userServiceClient.getUserById(userId)
```

### Message Publishing Example
```typescript
// In order-service
import { publishEvent } from './messaging'

await publishEvent('order.created', {
  orderId: order.id,
  userId: order.userId,
  amount: order.total
})
```

### Message Subscription Example
```typescript
// In notification-service
import { subscribeToEvent } from './messaging'

subscribeToEvent('order.created', async (event) => {
  await sendOrderConfirmationEmail(event.data)
})
```

## Service Dependencies
- Auth Service: No dependencies (base service)
- User Service: Depends on Auth
- Order Service: Depends on Auth, User
- Payment Service: Depends on Order
- Notification Service: Subscribes to all events

## Database Strategy
- Each service has its own database
- No direct database access between services
- Use events to sync data across services
- Shared database for read models (CQRS pattern)

## Testing
- Unit tests: Test domain logic in isolation
- Integration tests: Test with real database
- Contract tests: Verify service interfaces
- E2E tests: Test through API gateway

## Deployment
Each service deploys independently:
- Docker containers
- Kubernetes orchestration
- Auto-scaling based on CPU/memory
- Health checks at `/health` endpoint
```

**Why This Works:**
- Clear service boundaries and responsibilities
- Explains communication patterns
- Provides concrete examples
- Documents dependencies and deployment

---

## Advanced Context Engineering

### Example 13: Dynamic Context Loading

**Use Case:** Large codebase with just-in-time context

```markdown
# Context Management Strategy

## File Organization for Context Efficiency

### Core Documentation (Always Loaded)
Keep in CLAUDE.md:
- Essential commands (top 5-10 only)
- Critical warnings and gotchas
- Links to detailed documentation

### Detailed Documentation (Load on Demand)
Keep in separate files:
- `.claude/docs/architecture.md` - Detailed architecture
- `.claude/docs/testing.md` - Complete testing guide
- `.claude/docs/deployment.md` - Deployment procedures
- `.claude/docs/troubleshooting.md` - Common issues and solutions

## When to Reference Detailed Docs
Tell Claude to read specific docs when needed:
- "Check `.claude/docs/architecture.md` for the full service structure"
- "Reference `.claude/docs/testing.md` for integration test patterns"

## Lightweight Identifiers
Use identifiers instead of full context:

### Instead of listing all components:
❌ DON'T:
```markdown
Components:
- Button (src/components/Button.tsx) - A button component with 15 variants...
- Input (src/components/Input.tsx) - A text input with validation...
[50 more components...]
```

✅ DO:
```markdown
Components follow atomic design in `src/components/`.
See component documentation in Storybook.
```

### Instead of documenting all API endpoints:
❌ DON'T:
```markdown
API Endpoints:
- GET /api/users - Get all users...
- POST /api/users - Create user...
[30 more endpoints...]
```

✅ DO:
```markdown
API follows REST conventions.
Endpoints documented in `api-docs/openapi.yml`.
Use `pnpm api:docs` to view interactive documentation.
```

## Context Compaction Strategy
For long sessions, provide a summary prompt:

```markdown
# Session Summary Template
When context gets large, use this prompt:

"Please summarize what we've accomplished:
1. Files modified and key changes
2. Current task status
3. Next steps
4. Any blockers or decisions needed

Keep summary under 200 words."
```

## Structured Note-Taking
For complex features spanning multiple sessions:

```markdown
# Feature: User Authentication
## Status: In Progress

### Completed
- [x] Database schema for users table
- [x] JWT token generation
- [x] Login endpoint

### In Progress
- [ ] Password reset flow (started email service)

### Blocked
- [ ] OAuth integration (waiting for client credentials)

### Key Decisions
- Using bcrypt for password hashing (12 rounds)
- Token expiry: 7 days
- Refresh tokens stored in Redis

### Files Modified
- `src/auth/login.ts`
- `prisma/schema.prisma`
- `src/middleware/auth.ts`

Last updated: 2025-01-15
```

Store in `.claude/notes/` directory.

## Sub-Context Pattern
For specialized tasks, create focused context files:

```markdown
# .claude/contexts/database.md
Database-specific context loaded only when working on DB tasks.

# .claude/contexts/frontend.md
Frontend-specific context loaded only when working on UI.

# .claude/contexts/deployment.md
DevOps context loaded only when deploying.
```

Usage: "Load context from `.claude/contexts/database.md` before working on migrations."
```

**Why This Works:**
- Treats context as a finite resource
- Provides strategies for large codebases
- Uses just-in-time loading patterns
- Implements structured memory persistence

---

### Example 14: Multi-Agent Coordination

**Use Case:** Complex tasks requiring specialized agents

```markdown
# Multi-Agent Workflow Patterns

## When to Use Sub-Agents
Use specialized agents for:
- Complex research tasks (gathering information)
- Focused refactoring (specific file or module)
- Parallel independent tasks (multiple features)

## Agent Specialization Examples

### Research Agent Pattern
```markdown
Prompt: "Research how pagination is implemented in this codebase.
Check:
1. Backend API pagination patterns
2. Frontend pagination components
3. Any shared pagination utilities
4. Database query optimization

Summarize findings with file locations and code examples."
```

### Refactoring Agent Pattern
```markdown
Prompt: "Refactor the authentication module in src/auth/ to use async/await instead of callbacks.

Requirements:
- Maintain all existing functionality
- Update tests accordingly
- Keep same API surface
- Add error handling for async operations

Report:
- Files modified
- Breaking changes (if any)
- Test results"
```

### Parallel Feature Agent Pattern
```markdown
Task 1: "Implement email validation on signup form"
Task 2: "Add password strength indicator"
Task 3: "Implement 'remember me' checkbox"

These tasks are independent and can be done in parallel.
Each agent should:
- Implement the feature
- Add tests
- Update related documentation
- Report completion status
```

## Agent Coordination Guidelines

### Clear Inputs and Outputs
Each agent should receive:
- Specific, focused task
- Clear success criteria
- Required context files
- Expected deliverable format

### Minimal Overlap
Design agent tasks to minimize conflicts:
- Different files when possible
- Different modules in same file
- Independent features

### Consolidation Strategy
After parallel agents complete:
1. Review all changes
2. Check for conflicts
3. Run full test suite
4. Verify integration points
5. Create unified commit

## Example: Large Feature with Sub-Agents

Main task: "Implement user dashboard with analytics"

### Agent 1: Backend API
```markdown
Create analytics API endpoints:
- GET /api/analytics/summary
- GET /api/analytics/activity
- GET /api/analytics/growth

Include:
- Database queries
- Caching layer
- Input validation
- Tests
```

### Agent 2: Frontend Components
```markdown
Create React components:
- AnalyticsDashboard (container)
- SummaryCard (display metric)
- ActivityChart (line chart)
- GrowthTable (data table)

Include:
- Component implementation
- Storybook stories
- Unit tests
```

### Agent 3: Data Visualization
```markdown
Set up charting library and utilities:
- Install and configure Chart.js
- Create chart utility functions
- Implement responsive design
- Add loading states and error handling
```

### Integration (Main Agent)
After sub-agents complete:
- Connect components to API
- Add routing for dashboard page
- Implement error boundaries
- Create E2E tests for full flow
- Update navigation menu
```

**Why This Works:**
- Breaks complex tasks into manageable pieces
- Leverages parallelization
- Provides clear coordination patterns
- Includes integration strategy

---

## Multi-Project Configurations

### Example 15: Monorepo Configuration

**Use Case:** Multiple packages in single repository

```markdown
# Monorepo Structure

## Package Organization
```
packages/
├── ui/              # Shared UI components
├── utils/           # Shared utilities
├── types/           # Shared TypeScript types
└── config/          # Shared configs (ESLint, TS, etc.)

apps/
├── web/             # Main web application
├── admin/           # Admin dashboard
└── docs/            # Documentation site
```

## Package-Specific Instructions

### Root Level Commands
From repository root:
- `pnpm dev` - Start all apps
- `pnpm build` - Build all packages and apps
- `pnpm test` - Run all tests across packages
- `pnpm lint` - Lint entire monorepo
- `pnpm typecheck` - Type check all TypeScript code

### Package-Specific Commands
To work on specific package:
- `pnpm --filter @myorg/ui dev` - Start UI package in watch mode
- `pnpm --filter web test` - Test only web app
- `pnpm --filter admin build` - Build only admin app

## Workspace Dependencies
Internal packages reference each other:
```json
{
  "dependencies": {
    "@myorg/ui": "workspace:*",
    "@myorg/utils": "workspace:*"
  }
}
```

## Development Workflow

### Making Changes to Shared Package
1. Make changes in `packages/ui/`
2. Package auto-rebuilds (watch mode)
3. Apps hot-reload with changes
4. Test in apps before committing

### Adding New Package
```bash
# Create package directory
mkdir packages/new-package
cd packages/new-package

# Initialize package
pnpm init

# Set name to @myorg/new-package in package.json
# Add build scripts and dependencies
```

### Cross-Package Dependencies
When package A depends on package B:
- Build order handled automatically
- Use `workspace:*` version specifier
- Turborepo caches and parallelizes builds

## Code Sharing Guidelines

### Shared UI Components (packages/ui/)
- Reusable across all apps
- No app-specific logic
- Fully tested and documented
- Include Storybook stories

### Shared Utils (packages/utils/)
- Pure functions only
- Well-typed with TypeScript
- Include JSDoc comments
- Comprehensive tests

### Shared Types (packages/types/)
- Domain models
- API contracts
- Common interfaces
- Use in both frontend and backend

### Shared Config (packages/config/)
- ESLint configurations
- TypeScript configurations
- Prettier settings
- Import from apps: `extends: ["@myorg/config/eslint"]`

## Build Optimization
- Turborepo caching enabled
- Only rebuilds changed packages
- Parallel execution when possible
- Remote cache for CI (Vercel)

## Testing in Monorepo
- Unit tests at package level
- Integration tests at app level
- E2E tests only in apps
- Run `pnpm test` from root for full suite
```

**Why This Works:**
- Explains monorepo structure clearly
- Provides specific commands for working within monorepo
- Documents dependency management
- Includes workflow for common tasks

---

### Example 16: Multi-Environment Configuration

**Use Case:** Different configurations per environment

```markdown
# Multi-Environment Setup

## Environments
- **Development** - Local development (localhost)
- **Staging** - QA and testing (staging.app.com)
- **Production** - Live application (app.com)

## Environment-Specific Files
```
.env.development      # Local development
.env.staging         # Staging environment
.env.production      # Production environment
.env.example         # Template (commit this)
.env.local           # Personal overrides (gitignored)
```

## Configuration Loading
Environment files loaded in priority order:
1. `.env.local` (highest priority, never commit)
2. `.env.[environment]` (environment-specific)
3. `.env` (defaults)

## Environment Variables

### All Environments
```bash
# Application
NEXT_PUBLIC_APP_NAME=MyApp
NEXT_PUBLIC_API_VERSION=v1

# Feature Flags (override in .env.local)
FEATURE_NEW_DASHBOARD=false
FEATURE_ANALYTICS=false
```

### Development (.env.development)
```bash
# API
NEXT_PUBLIC_API_URL=http://localhost:3001
API_TIMEOUT=30000

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/myapp_dev

# External Services (mock/sandbox)
STRIPE_KEY=sk_test_...
SENDGRID_API_KEY=SG.test...

# Debug
DEBUG=true
LOG_LEVEL=debug
```

### Staging (.env.staging)
```bash
# API
NEXT_PUBLIC_API_URL=https://api-staging.app.com
API_TIMEOUT=10000

# Database
DATABASE_URL=postgresql://user:pass@staging-db.app.com:5432/myapp_staging

# External Services (test mode)
STRIPE_KEY=sk_test_...
SENDGRID_API_KEY=SG.staging...

# Debug
DEBUG=false
LOG_LEVEL=info
```

### Production (.env.production)
```bash
# API
NEXT_PUBLIC_API_URL=https://api.app.com
API_TIMEOUT=5000

# Database
DATABASE_URL=postgresql://user:pass@prod-db.app.com:5432/myapp_prod

# External Services (live)
STRIPE_KEY=sk_live_...
SENDGRID_API_KEY=SG.prod...

# Debug
DEBUG=false
LOG_LEVEL=error
SENTRY_DSN=https://...
```

## Usage in Code
```typescript
// Public variables (exposed to browser)
const apiUrl = process.env.NEXT_PUBLIC_API_URL

// Server-only variables (never sent to browser)
const stripeKey = process.env.STRIPE_KEY
```

## Environment-Specific Behavior

### Development
- Detailed error messages
- Source maps enabled
- Hot module reloading
- Mock external services available
- Relaxed CORS

### Staging
- Similar to production
- Extended logging
- Real external services (test mode)
- Accessible only via VPN or IP whitelist

### Production
- Minimal error details (security)
- No source maps
- Strict CORS
- Real external services (live mode)
- Performance monitoring enabled

## Switching Environments Locally
```bash
# Development (default)
pnpm dev

# Test staging configuration locally
NODE_ENV=staging pnpm dev

# Test production build locally
pnpm build
pnpm start
```

## Environment Validation
App validates required environment variables on startup:
- See `src/config/env.ts` for validation logic
- Missing variables cause startup failure
- Type-safe access to environment variables

## Secrets Management
- **Never** commit secrets to git
- Development secrets in `.env.local`
- Staging/Production secrets in deployment platform (Vercel/AWS)
- Rotate secrets every 90 days
- Use different keys per environment
```

**Why This Works:**
- Clear separation of environments
- Security best practices
- Practical examples for each environment
- Explains priority and loading order

---

## Team Collaboration Guidelines

### Example 17: Code Review Standards

**Use Case:** Establishing review culture

```markdown
# Code Review Guidelines

## Purpose of Code Review
- Catch bugs and edge cases
- Ensure code quality and consistency
- Share knowledge across team
- Improve codebase architecture
- Mentor junior developers

## When to Request Review
Request review when:
- Feature is complete and tested
- All CI checks pass
- Code is self-reviewed first
- PR description is filled out

Don't request review if:
- Work in progress (use draft PR)
- CI checks failing
- You haven't tested locally

## What to Review

### Functionality
- ✅ Code does what PR description says
- ✅ Edge cases are handled
- ✅ Error handling is appropriate
- ✅ Tests cover new functionality

### Code Quality
- ✅ Code is readable and maintainable
- ✅ Functions are single-purpose and small
- ✅ Names are descriptive and clear
- ✅ No unnecessary complexity

### Consistency
- ✅ Follows project style guide
- ✅ Matches existing patterns
- ✅ Uses established utilities
- ✅ File structure follows conventions

### Architecture
- ✅ Fits into existing architecture
- ✅ Doesn't create tight coupling
- ✅ Reuses existing code when possible
- ✅ Introduces patterns that make sense

### Security
- ✅ No secrets in code
- ✅ Input validation present
- ✅ Authentication/authorization correct
- ✅ No SQL injection or XSS vulnerabilities

### Performance
- ✅ No obvious performance issues
- ✅ Expensive operations are cached
- ✅ Database queries are optimized
- ✅ Bundle size impact is acceptable

## How to Give Feedback

### Be Kind and Constructive
✅ Good:
- "Consider extracting this logic into a separate function for reusability"
- "This could lead to a race condition. What if we..."
- "Great solution! Minor suggestion: we could simplify this by..."

❌ Bad:
- "This is wrong"
- "Why didn't you just..."
- "This is terrible"

### Be Specific
✅ Good:
- "Line 45: This function could throw if userId is null"
- "Consider adding a test case for when the array is empty"

❌ Bad:
- "Something seems off"
- "I don't like this"

### Distinguish Between Issues and Suggestions
- **Blocker:** Must be fixed before merge (e.g., security issue, breaks functionality)
- **Issue:** Should be fixed (e.g., bug, incorrect pattern)
- **Suggestion:** Nice to have (e.g., minor refactor, alternative approach)
- **Nit:** Trivial (e.g., typo, formatting) - don't block on these

Use labels:
- `[BLOCKER]` Critical security issue here
- `[ISSUE]` This doesn't handle the empty case
- `[SUGGESTION]` Consider using a switch statement instead
- `[NIT]` Typo: "recieve" → "receive"

### Praise Good Work
- Call out clever solutions
- Appreciate thorough testing
- Recognize good documentation
- Thank for cleanup and refactoring

## How to Receive Feedback

### Respond to All Comments
- If you made the change: "Done ✅"
- If you disagree: Explain why respectfully
- If unclear: Ask questions
- If it's optional: Acknowledge and decide

### Don't Take It Personally
- Review is about code, not you
- Everyone's code gets reviewed
- Feedback makes you better
- Team goal is quality codebase

### Ask Questions
- "Could you explain more about the race condition?"
- "I'm not familiar with that pattern. Can you point me to an example?"
- "What do you think about approach X instead?"

### Make Changes Promptly
- Address feedback within 24 hours
- Push changes quickly
- Re-request review when ready

## Review Turnaround Time
- Small PRs (<200 lines): Review within 4 hours
- Medium PRs (<500 lines): Review within 1 day
- Large PRs (>500 lines): Review within 2 days
- Urgent PRs: Tag as urgent and notify in Slack

## Review Checklist
Before approving:
- [ ] I understand what the code does
- [ ] I've checked for edge cases
- [ ] Tests are adequate
- [ ] Code style is consistent
- [ ] No security concerns
- [ ] Documentation is updated if needed

## Approval Process
- **1 approval required** for minor changes
- **2 approvals required** for major features
- **Tech lead approval required** for:
  - Architecture changes
  - New dependencies
  - Database migrations
  - Security-related changes

## Merge Strategy
- Squash and merge (default)
- Keep individual commits for large feature branches
- Delete branch after merge
```

**Why This Works:**
- Sets clear expectations for reviewers
- Provides examples of good vs. bad feedback
- Creates consistent review process
- Balances thoroughness with velocity

---

### Example 18: Onboarding New Team Members

**Use Case:** Helping new developers get started

```markdown
# New Developer Onboarding

## Welcome! 👋
This guide will get you from zero to productive in one day.

## Prerequisites
Before starting, install:
- Node.js 20.x (use [nvm](https://github.com/nvm-sh/nvm))
- pnpm 9.x (`npm install -g pnpm`)
- Docker Desktop
- VS Code (or preferred editor)

## Day 1: Setup

### Morning (9am-12pm)

#### 1. Repository Access (15 min)
- Get added to GitHub organization
- Clone repository:
  ```bash
  git clone git@github.com:company/project.git
  cd project
  ```

#### 2. Local Environment (30 min)
```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with values from 1Password (search "dev environment")

# Start database
docker-compose up -d

# Run migrations
pnpm db:migrate

# Seed test data
pnpm db:seed

# Start development server
pnpm dev
```

Open http://localhost:3000 - you should see the app!

#### 3. First Code Change (45 min)
**Goal:** Make a small change to verify your setup works.

Task: Change the homepage welcome message
1. Open `src/pages/index.tsx`
2. Find the `<h1>` element
3. Change the text to "Hello [Your Name]!"
4. Save and verify change appears in browser
5. Run tests: `pnpm test`
6. Create a branch and push:
   ```bash
   git checkout -b onboarding-[yourname]
   git add .
   git commit -m "chore: onboarding test change"
   git push -u origin onboarding-[yourname]
   ```
7. Create PR and request review from your mentor

#### 4. Tooling Setup (30 min)
- Install VS Code extensions (see `.vscode/extensions.json`)
- Configure Prettier to format on save
- Set up ESLint in your editor
- Join Slack channels: #engineering, #deployments, #github

### Afternoon (1pm-5pm)

#### 5. Codebase Tour (1 hour)
Meet with your mentor to review:
- Project structure (`/src` organization)
- Key files and directories
- How to run tests
- Common development tasks
- Where to find documentation

#### 6. First Real Task (2-3 hours)
Your mentor will assign a "good first issue":
- Small, well-defined task
- Touches multiple parts of codebase
- Has clear acceptance criteria
- Good learning opportunity

Don't hesitate to ask questions!

#### 7. Team Intros (30 min)
Meet the team in daily standup at 3pm:
- Introduce yourself
- Share your background
- Ask questions

#### 8. End of Day Reflection (30 min)
- Review what you learned
- Write down questions for tomorrow
- Update your onboarding checklist (in Notion)

## Week 1 Goals
By end of week, you should:
- ✅ Complete local environment setup
- ✅ Merge your first PR
- ✅ Attend all team meetings
- ✅ Complete 2-3 "good first issues"
- ✅ Understand development workflow
- ✅ Know who to ask for what

## Common First-Day Issues

### "pnpm install fails"
- Make sure you're using Node 20.x: `node --version`
- Clear cache: `pnpm store prune`
- Try again: `pnpm install --force`

### "Database connection failed"
- Ensure Docker is running: `docker ps`
- Check services are up: `docker-compose ps`
- Verify environment variables in `.env.local`

### "Port already in use"
- Check what's using port: `lsof -i :3000`
- Kill the process or change port in `.env.local`

### "Tests are failing"
- Run `pnpm test:update` to update snapshots
- Make sure database is seeded: `pnpm db:seed`
- Ask in #engineering Slack channel

## Resources
- [Architecture Overview](./.claude/docs/architecture.md)
- [Code Style Guide](./.claude/docs/style-guide.md)
- [Testing Guide](./.claude/docs/testing.md)
- [Deployment Process](./.claude/docs/deployment.md)
- [Troubleshooting](./.claude/docs/troubleshooting.md)

## Your Mentor
- Name: [Assigned mentor]
- Slack: @mentor
- When to reach out: Anytime! No question is too small.

## Checkpoints
Your mentor will check in with you:
- End of Day 1 (5pm)
- End of Week 1 (Friday afternoon)
- End of Month 1 (schedule 1-on-1)

Welcome to the team! 🚀
```

**Why This Works:**
- Structured day-by-day onboarding
- Hands-on learning with real tasks
- Includes troubleshooting common issues
- Sets clear expectations and milestones
- Provides support resources

---

## Performance Optimization

### Example 19: Performance Guidelines

**Use Case:** Performance-critical application

```markdown
# Performance Optimization Guidelines

## Performance Budgets
- **Time to First Byte (TTFB):** < 200ms
- **First Contentful Paint (FCP):** < 1.5s
- **Largest Contentful Paint (LCP):** < 2.5s
- **Total Blocking Time (TBT):** < 300ms
- **Cumulative Layout Shift (CLS):** < 0.1
- **First Input Delay (FID):** < 100ms

Check current metrics: `pnpm analyze:perf`

## Frontend Performance

### Bundle Size
- Main bundle: < 200KB gzipped
- Route chunks: < 100KB each
- Third-party libraries: Only if necessary

**Check bundle size:**
```bash
pnpm build
pnpm bundle:analyze
```

### Code Splitting
Split code at route level:
```typescript
// ✅ Good: Lazy load route components
const Dashboard = lazy(() => import('./pages/Dashboard'))

// ❌ Bad: Import everything upfront
import Dashboard from './pages/Dashboard'
```

### Image Optimization
- Use Next.js Image component
- Provide width and height
- Use WebP format
- Implement lazy loading
- Optimize images before committing (use `pnpm optimize:images`)

```tsx
// ✅ Good
import Image from 'next/image'
<Image
  src="/hero.jpg"
  alt="Hero"
  width={800}
  height={600}
  loading="lazy"
/>

// ❌ Bad
<img src="/hero.jpg" alt="Hero" />
```

### Memoization
Memoize expensive computations:
```typescript
// ✅ Good: Memoize expensive calculation
const sortedData = useMemo(
  () => data.sort((a, b) => a.value - b.value),
  [data]
)

// ✅ Good: Memoize callbacks
const handleClick = useCallback(() => {
  doSomething(id)
}, [id])

// ❌ Bad: Recalculate every render
const sortedData = data.sort((a, b) => a.value - b.value)
```

### Virtual Scrolling
Use virtual scrolling for long lists:
```typescript
// For lists > 100 items, use react-window
import { FixedSizeList } from 'react-window'

<FixedSizeList
  height={600}
  itemCount={items.length}
  itemSize={50}
>
  {Row}
</FixedSizeList>
```

## Backend Performance

### Database Queries
- Use indexes on frequently queried columns
- Avoid N+1 queries (use `include` or `select`)
- Limit result sets
- Use cursor pagination for large datasets

```typescript
// ✅ Good: Single query with include
const users = await prisma.user.findMany({
  include: { posts: true }
})

// ❌ Bad: N+1 query
const users = await prisma.user.findMany()
for (const user of users) {
  user.posts = await prisma.post.findMany({ where: { userId: user.id } })
}
```

### Caching Strategy
- **Memory (Redis):** Hot data, sessions, rate limits
- **CDN:** Static assets, images
- **Browser:** Cache-Control headers

```typescript
// Cache frequently accessed data
import { cache } from './lib/redis'

const cachedUser = await cache.get(`user:${id}`)
if (cachedUser) return cachedUser

const user = await db.user.findUnique({ where: { id } })
await cache.set(`user:${id}`, user, { ex: 3600 }) // 1 hour
return user
```

### API Response Size
- Paginate large datasets
- Use field selection (don't return everything)
- Compress responses (gzip/brotli)

```typescript
// ✅ Good: Allow field selection
GET /api/users?fields=id,name,email

// ✅ Good: Paginate results
GET /api/users?page=1&limit=20

// ❌ Bad: Return everything
GET /api/users (returns 10,000 users with all fields)
```

### Async Processing
Move slow operations to background jobs:
- Email sending
- Image processing
- Report generation
- Data exports

```typescript
// ✅ Good: Queue background job
await queue.add('send-email', { to, subject, body })
return { success: true, message: 'Email queued' }

// ❌ Bad: Block request
await sendEmail(to, subject, body) // Takes 2-3 seconds
return { success: true }
```

## Monitoring

### Performance Monitoring
- Vercel Analytics (automatic)
- Sentry Performance (errors + performance)
- Custom metrics in `lib/analytics.ts`

### Setting Up Alerts
Alerts configured for:
- LCP > 3s (warning)
- API response time > 1s (warning)
- Error rate > 1% (critical)
- Server CPU > 80% (warning)

Check alerts: Slack #alerts channel

### Regular Performance Audits
Run weekly performance audit:
```bash
pnpm perf:audit
```

This generates a report with:
- Lighthouse scores
- Bundle size changes
- Slow API endpoints
- Largest pages

## Performance Checklist
Before merging performance-sensitive PRs:
- [ ] Run `pnpm build` and check bundle size
- [ ] Run Lighthouse audit
- [ ] Test on slow 3G network (Chrome DevTools)
- [ ] Check database query counts (logs)
- [ ] Verify images are optimized
- [ ] Test with large datasets
- [ ] Review memoization usage

## Quick Wins
Easy performance improvements:
1. Add `loading="lazy"` to all images
2. Implement code splitting for routes
3. Add indexes to database columns used in WHERE clauses
4. Enable response compression
5. Use `next/image` instead of `<img>`
6. Memoize expensive components
7. Debounce search inputs
8. Cache API responses
```

**Why This Works:**
- Sets measurable performance targets
- Provides specific techniques with examples
- Includes monitoring and auditing strategy
- Easy wins for quick improvements
- Shows good vs. bad patterns

---

### Example 20: Debugging and Troubleshooting

**Use Case:** Common issues and solutions

```markdown
# Debugging and Troubleshooting Guide

## General Debugging Strategy
1. **Reproduce the issue** - Ensure you can make it happen consistently
2. **Isolate the problem** - Narrow down where the issue occurs
3. **Check the logs** - Look for error messages and stack traces
4. **Verify assumptions** - Test what you think is happening
5. **Fix and verify** - Implement fix and confirm it works

## Development Issues

### Application Won't Start

#### "Port already in use"
**Symptoms:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Find process using port
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or change port in .env.local
PORT=3001
```

#### "Module not found"
**Symptoms:** `Error: Cannot find module 'some-package'`

**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules
pnpm install

# Clear Next.js cache
rm -rf .next

# Restart dev server
pnpm dev
```

#### "Database connection failed"
**Symptoms:** `Error: Can't reach database server`

**Solution:**
```bash
# Check if Docker is running
docker ps

# Start database container
docker-compose up -d db

# Verify connection string in .env.local
DATABASE_URL=postgresql://user:pass@localhost:5432/myapp_dev

# Test connection
pnpm db:test-connection
```

### Test Failures

#### "Snapshot test failed"
**Symptoms:** Tests fail with snapshot mismatch

**Solution:**
```bash
# Review the diff
pnpm test

# If changes are intentional, update snapshots
pnpm test:update

# If not intentional, investigate what changed
```

#### "Cannot find test user"
**Symptoms:** Integration tests fail with "User not found"

**Solution:**
```bash
# Reset test database
NODE_ENV=test pnpm db:reset

# Reseed test data
NODE_ENV=test pnpm db:seed

# Run tests again
pnpm test:integration
```

### Build Errors

#### "Type error: Property 'foo' does not exist"
**Symptoms:** TypeScript compilation errors

**Solution:**
```bash
# Run type check to see all errors
pnpm type-check

# Common fixes:
# 1. Add property to interface/type
# 2. Use optional chaining: obj?.foo
# 3. Add type guard or assertion
```

#### "Out of memory" during build
**Symptoms:** `FATAL ERROR: Reached heap limit`

**Solution:**
```bash
# Increase Node memory limit
NODE_OPTIONS=--max_old_space_size=4096 pnpm build

# Or add to package.json scripts:
"build": "NODE_OPTIONS=--max_old_space_size=4096 next build"
```

## Runtime Issues

### Performance Problems

#### "Page loads slowly"
**Debugging steps:**
1. Open Chrome DevTools → Network tab
2. Check waterfall for slow requests
3. Look for large bundle sizes
4. Check for unnecessary re-renders (React DevTools Profiler)

**Common causes:**
- Large bundle sizes → Implement code splitting
- Slow API calls → Add caching or optimize queries
- Too many re-renders → Add memoization
- Large images → Use optimized formats and lazy loading

#### "API endpoint is slow"
**Debugging steps:**
```typescript
// Add logging to measure timing
console.time('API /users')
const users = await fetchUsers()
console.timeEnd('API /users')

// Check database queries
// Enable Prisma query logging in .env
DEBUG=prisma:query

// Profile with Chrome DevTools
// Add ?profile=1 to URL and check Performance tab
```

### Data Issues

#### "Data not updating in UI"
**Debugging steps:**
1. Check if API call succeeds (Network tab)
2. Verify state is being updated (React DevTools)
3. Check if component is re-rendering
4. Look for stale closures or missing dependencies

**Common fixes:**
```typescript
// ✅ Invalidate cache after mutation
const mutation = useMutation(updateUser, {
  onSuccess: () => {
    queryClient.invalidateQueries(['users'])
  }
})

// ✅ Include all dependencies
useEffect(() => {
  fetchData(userId)
}, [userId]) // Don't forget dependencies!
```

#### "Getting stale data"
**Causes:**
- Cached responses (check Cache-Control headers)
- React Query stale time
- Browser cache

**Solutions:**
```typescript
// Force refresh
queryClient.invalidateQueries(['users'])

// Disable caching for specific query
useQuery(['users'], fetchUsers, {
  cacheTime: 0,
  staleTime: 0
})

// Clear browser cache (Cmd+Shift+R)
```

### Authentication Issues

#### "User keeps getting logged out"
**Debugging:**
```typescript
// Check token expiry
const token = localStorage.getItem('token')
const decoded = jwtDecode(token)
console.log('Token expires:', new Date(decoded.exp * 1000))

// Verify refresh token flow
// Check Network tab for 401 responses
// Look for token refresh attempts
```

**Solution:**
```typescript
// Ensure token refresh is working
// See src/auth/token-refresh.ts

// Check if token expiry is too short
// JWT_EXPIRY in .env (default: 7d)
```

## Debugging Tools

### Browser DevTools
- **Console:** Logs, errors, warnings
- **Network:** API calls, timing, payload inspection
- **React DevTools:** Component tree, props, state
- **Performance:** Profiling, frame rate
- **Application:** LocalStorage, cookies, service workers

### VS Code Debugging
Launch configuration in `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Next.js",
  "runtimeExecutable": "pnpm",
  "runtimeArgs": ["dev"],
  "port": 9229,
  "skipFiles": ["<node_internals>/**"]
}
```

Set breakpoints and use F5 to start debugging.

### Server Logging
```typescript
// Structured logging
import { logger } from './lib/logger'

logger.info('User logged in', { userId })
logger.error('Failed to process order', { orderId, error })
logger.debug('Query executed', { query, duration })
```

Logs appear in:
- Development: Console
- Production: Vercel logs or Datadog

### Database Debugging
```bash
# Open Prisma Studio
pnpm db:studio

# View query logs
DEBUG=prisma:query pnpm dev

# Run raw SQL to inspect data
pnpm prisma db execute --stdin < query.sql
```

## Getting Help

### Before Asking for Help
1. ✅ Check this troubleshooting guide
2. ✅ Search codebase for similar solutions
3. ✅ Google the exact error message
4. ✅ Check GitHub issues in relevant libraries
5. ✅ Try to create minimal reproduction

### Where to Ask
- **Quick questions:** #engineering Slack channel
- **Bug reports:** Create GitHub issue (use template)
- **Architecture discussions:** Weekly tech sync or #tech-architecture
- **Blocked on task:** Tag your tech lead in Slack

### How to Ask
Provide:
- What you're trying to do
- What you expected to happen
- What actually happened
- Steps to reproduce
- Error messages (full stack trace)
- What you've tried so far

**Good example:**
```
I'm trying to implement user search, but the API is returning 500 errors.

Expected: GET /api/users?search=john returns matching users
Actual: 500 Internal Server Error

Error from logs:
PrismaClientKnownRequestError: Invalid `prisma.user.findMany()` invocation...

Steps to reproduce:
1. Start dev server
2. Navigate to /users
3. Type in search box
4. See error in network tab

I've tried:
- Checking the database connection (works)
- Testing the Prisma query in isolation (works)
- Looking at similar queries in codebase

Code: https://github.com/company/project/blob/feature/user-search/src/api/users.ts#L45
```

This helps others help you faster!
```

**Why This Works:**
- Organizes issues by category
- Provides specific debugging steps
- Includes common solutions
- Shows how to use debugging tools
- Sets expectations for asking for help

---

## Summary of Best Practices

Based on Anthropic's 2025 guidance, here are the key principles for writing effective Claude instructions:

### 1. **Be Specific and Direct**
- Use clear, explicit language
- Provide context about why something matters
- Avoid vague or ambiguous instructions

### 2. **Treat Context as Precious**
- Keep CLAUDE.md concise - include only essential information
- Use separate detailed documentation files for deep-dive content
- Leverage just-in-time context loading
- Use lightweight identifiers instead of full context

### 3. **Structure Information Logically**
- Use clear section headers
- Group related information
- Prioritize most important information first
- Use consistent formatting

### 4. **Include Actionable Examples**
- Show concrete code examples
- Demonstrate good vs. bad patterns
- Include specific commands and workflows
- Use real scenarios from your project

### 5. **Iterate and Refine**
- Start simple and add detail as needed
- Update based on Claude's performance
- Remove outdated information
- Keep documentation current with codebase changes

### 6. **Think Hierarchically**
- Root CLAUDE.md for general project info
- Subdirectory CLAUDE.md for module-specific details
- Separate docs for in-depth guides
- Use context loading strategies for large codebases

### 7. **Optimize for Agent Behavior**
- Design for autonomous operation
- Provide clear success criteria
- Include troubleshooting guidance
- Document decision-making rationale
