# Example 17-18: Team Collaboration Guidelines

This folder demonstrates code review standards and onboarding documentation.

## Files

### `code-review-CLAUDE.md`
**Use Case:** Establishing review culture

**Key Principles Demonstrated:**
- ✅ Sets clear expectations for reviewers
- ✅ Provides examples of good vs. bad feedback
- ✅ Creates consistent review process
- ✅ Balances thoroughness with velocity
- ✅ Includes checklists and guidelines for both sides

**What Makes This Effective:**
1. **Purpose First:** Explains WHY we review
2. **When to Review:** Clear triggers for requesting review
3. **Review Dimensions:** Functionality, Quality, Consistency, Architecture, Security, Performance
4. **Feedback Examples:** Good vs. Bad for giving and receiving
5. **Label System:** Blocker, Issue, Suggestion, Nit
6. **Turnaround Times:** SLAs for different PR sizes

---

### `onboarding-CLAUDE.md`
**Use Case:** Helping new developers get started

**Key Principles Demonstrated:**
- ✅ Structured day-by-day onboarding
- ✅ Hands-on learning with real tasks
- ✅ Includes troubleshooting common issues
- ✅ Sets clear expectations and milestones
- ✅ Provides support resources

**What Makes This Effective:**
1. **Time-Boxed Structure:** Morning vs. Afternoon activities with durations
2. **Hands-On First Task:** Verifies setup works
3. **Common Issues:** Troubleshooting section for day 1 problems
4. **Week 1 Goals:** Clear success criteria
5. **Resource Links:** Points to detailed docs

---

## Best Practices from These Examples

### 1. Code Review Purpose
Start with the "why":
```markdown
## Purpose of Code Review
- Catch bugs and edge cases
- Ensure code quality and consistency
- Share knowledge across team
```

### 2. Review Dimensions
Define what to check:
- Functionality
- Code Quality
- Consistency
- Architecture
- Security
- Performance

### 3. Feedback Labels
Create a severity system:
```markdown
- [BLOCKER] Must fix before merge
- [ISSUE] Should fix
- [SUGGESTION] Nice to have
- [NIT] Trivial, don't block
```

### 4. Good vs. Bad Examples
Show both for feedback:
```markdown
✅ Good:
- "Consider extracting this logic..."

❌ Bad:
- "This is wrong"
```

### 5. Review Turnaround SLAs
Set time expectations:
```markdown
- Small PRs (<200 lines): 4 hours
- Medium PRs (<500 lines): 1 day
- Large PRs (>500 lines): 2 days
```

### 6. Approval Process
Define authority levels:
```markdown
- 1 approval: Minor changes
- 2 approvals: Major features
- Tech lead approval: Architecture, migrations, security
```

### 7. Time-Boxed Onboarding
Break down Day 1:
```markdown
### Morning (9am-12pm)
#### 1. Repository Access (15 min)
#### 2. Local Environment (30 min)
#### 3. First Code Change (45 min)
```

### 8. Prerequisites Checklist
List what to install:
```markdown
- Node.js 20.x (use nvm)
- pnpm 9.x
- Docker Desktop
- VS Code
```

### 9. First Task (Hands-On)
Provide a simple task to verify setup:
```markdown
Task: Change the homepage welcome message
1. Open `src/pages/index.tsx`
2. Find the `<h1>` element
3. Change text to "Hello [Your Name]!"
4. Verify in browser
5. Run tests
6. Create PR
```

### 10. Common Issues Section
Anticipate problems:
```markdown
### "pnpm install fails"
- Check Node version
- Clear cache
- Try again with --force

### "Database connection failed"
- Ensure Docker is running
- Check services
- Verify environment variables
```

### 11. Week 1 Goals
Set clear success criteria:
```markdown
By end of week:
- ✅ Complete local setup
- ✅ Merge first PR
- ✅ Complete 2-3 "good first issues"
- ✅ Understand workflow
```

### 12. Resource Links
Point to detailed documentation:
```markdown
## Resources
- [Architecture Overview](./docs/architecture.md)
- [Testing Guide](./docs/testing.md)
- [Troubleshooting](./docs/troubleshooting.md)
```

### 13. Mentor Information
Assign a contact person:
```markdown
## Your Mentor
- Name: [Assigned mentor]
- Slack: @mentor
- When to reach out: Anytime!
```

### 14. Checkpoints
Schedule follow-ups:
```markdown
Your mentor will check in:
- End of Day 1 (5pm)
- End of Week 1 (Friday)
- End of Month 1 (1-on-1)
```

### 15. Review Checklist
Provide a pre-approval checklist:
```markdown
Before approving:
- [ ] I understand what the code does
- [ ] I've checked for edge cases
- [ ] Tests are adequate
- [ ] Code style is consistent
```

### 16. Two-Sided Guidelines
Provide guidance for both roles:
```markdown
## How to Give Feedback
[Guidelines for reviewers]

## How to Receive Feedback
[Guidelines for authors]
```

This helps both sides understand their responsibilities and creates a healthier review culture.
