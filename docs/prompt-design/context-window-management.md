Project: enterprise-dashboard
Overview
A React-based enterprise dashboard with real-time analytics. Uses TypeScript, Vite, and TailwindCSS.

Environment Setup
Node version: 20.x (use nvm: nvm use)

Package manager: pnpm (not npm or yarn)

Required env vars: Copy .env.example to .env.local

Commands
Development
pnpm dev - Start dev server (port 5173)

pnpm dev:api - Start mock API server (port 3001)

pnpm dev:all - Start both dev and API servers concurrently

Building
pnpm build - Production build

pnpm build:staging - Staging build with source maps

pnpm preview - Preview production build locally

Testing
pnpm test - Run all tests

pnpm test:watch - Run tests in watch mode

pnpm test:coverage - Generate coverage report

pnpm test:e2e - Run Playwright E2E tests

Quality
pnpm lint - Lint with ESLint

pnpm type-check - TypeScript type checking

pnpm format - Format with Prettier

Code Style
TypeScript strict mode enabled

Use ES modules (import/export)

Prefer arrow functions for components

Destructure props at function signature

Use absolute imports via @/ alias

Max line length: 100 characters

Use single quotes for strings

Always add semicolons

Architecture
Directory Structure
src/components/ - Reusable UI components

src/features/ - Feature-based modules

src/hooks/ - Custom React hooks

src/lib/ - Utility functions and shared logic

src/services/ - API integration layer

src/types/ - TypeScript type definitions

Naming Conventions
Components: PascalCase (e.g., UserProfile.tsx)

Hooks: camelCase starting with 'use' (e.g., useAuth.ts)

Utils: camelCase (e.g., formatDate.ts)

Constants: UPPER_SNAKE_CASE (e.g., API_BASE_URL)

Agent Context & Memory Management
To ensure efficient operation and prevent context overflow, adhere to the following memory management protocol. Your context window is finite; use it strategically.

Prioritized Context Loading: Do not assume all sections of this document are relevant at all times. On receiving a task, load only the most relevant sections into your active working memory.

For UI/Component Tasks: Prioritize the Code Style, Architecture, and Naming Conventions sections, along with the specific component files you are editing.

For API/Data Logic Tasks: Prioritize the src/services/, src/types/ sections and the Commands related to the API server.

For Testing Tasks: Prioritize the Testing commands section and the implementation file for the feature you are testing.

Active Context Pruning: After a step in a task is completed, you are to "prune" your context. Summarize the key outcomes of the completed step and mentally discard the detailed file contents you used, unless they are directly required for the immediate next step. This prevents irrelevant details from past steps from cluttering your focus.

Task-Specific Knowledge Base: For any given task, treat the files listed in the prompt as your primary knowledge base. This guide provides the rules, but the code files provide the reality. Always prioritize the current state of the code.

Full Context Review Trigger: Before generating a final diff for a feature or fixing a complex bug, perform a quick, full review of this document to ensure your solution adheres to all project standards. This is the only time the entire document should be considered "in context" at once.

Important Notes
Always run type-check before committing

Never commit directly to main - use feature branches

API responses are cached for 5 minutes in development

The deprecated/ folder contains legacy code - do not modify