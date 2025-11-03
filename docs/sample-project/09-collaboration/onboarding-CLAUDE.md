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
