# Example 1-2: Basic Project Configuration

This folder demonstrates two approaches to basic CLAUDE.md configuration files.

## Files

### `minimal-CLAUDE.md`
**Use Case:** Small project with basic needs

**Key Principles Demonstrated:**
- ✅ Concise and focused on essentials
- ✅ Uses clear section headers
- ✅ Lists only the most common commands
- ✅ No overwhelming detail

**When to Use:**
- Small projects (< 10 files)
- Personal projects
- Prototypes and demos
- Simple tech stack

---

### `comprehensive-CLAUDE.md`
**Use Case:** Complex project with detailed requirements

**Key Principles Demonstrated:**
- ✅ Provides comprehensive context without being overwhelming
- ✅ Groups related information logically
- ✅ Includes crucial warnings and constraints
- ✅ Explains the "why" behind conventions
- ✅ Documents environment setup clearly
- ✅ Organizes commands by category

**When to Use:**
- Team projects
- Production applications
- Complex tech stacks
- Multiple environments
- Projects with specific conventions

---

## Best Practices from These Examples

### 1. Start Simple, Add Detail as Needed
Begin with the minimal approach and expand to comprehensive as your project grows.

### 2. Clear Section Headers
Both examples use consistent section organization:
- Project name and overview
- Commands (grouped by purpose in comprehensive)
- Code style
- Architecture/Key files
- Important notes

### 3. Command Documentation
- **Minimal:** List only essential commands
- **Comprehensive:** Group commands by category (Development, Testing, Building, Quality)

### 4. Context Over Rules
The comprehensive example explains WHY things matter:
- "API responses are cached for 5 minutes in development"
- "Always run type-check before committing"

### 5. Progressive Disclosure
- Essential info in main CLAUDE.md
- Detailed docs can be referenced separately (see Example 13 for advanced patterns)
