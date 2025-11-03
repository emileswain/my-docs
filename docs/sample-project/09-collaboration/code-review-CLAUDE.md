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
