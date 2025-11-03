# Example 11-12: Architecture and Design Patterns

This folder demonstrates architectural documentation for different project types.

## Files

### `ddd-CLAUDE.md`
**Use Case:** Complex application with domain logic

**Key Principles Demonstrated:**
- ✅ Provides clear architectural vision
- ✅ Explains layer responsibilities with examples
- ✅ Shows concrete code patterns
- ✅ Guides developers on where to put new code
- ✅ Documents key patterns (Repository, Value Objects, Events)

**What Makes This Effective:**
1. **Visual Structure:** ASCII directory tree shows organization
2. **Layer Responsibilities:** Each layer clearly defined with examples
3. **Code Examples:** Concrete TypeScript showing patterns
4. **Design Patterns:** Repository, Value Objects, Domain Events explained
5. **Guidelines:** Rules for each layer

---

### `microservices-CLAUDE.md`
**Use Case:** Multiple services in a monorepo

**Key Principles Demonstrated:**
- ✅ Clear service boundaries and responsibilities
- ✅ Explains communication patterns
- ✅ Provides concrete examples
- ✅ Documents dependencies and deployment
- ✅ Shows both sync and async communication

**What Makes This Effective:**
1. **Service Inventory:** Lists all services and their purposes
2. **Communication Patterns:** Both REST (sync) and Message Queue (async)
3. **Development Workflow:** How to run services locally
4. **Port Mapping:** Every service's port documented
5. **Dependencies:** Explicit dependency graph

---

## Best Practices from These Examples

### 1. Visual Directory Structure
Use ASCII trees to show organization:
```
src/
├── domain/          # Core business logic
│   ├── entities/    # Business entities
│   └── valueObjects/ # Immutable types
├── application/     # Use cases
└── infrastructure/  # External services
```

### 2. Layer Responsibilities
Define what belongs in each layer:
```markdown
### Domain Layer (src/domain/)
- Contains core business logic
- No dependencies on other layers
- Pure TypeScript (no React, no database)
```

### 3. Code Examples for Patterns
Show actual implementation:
```typescript
// domain/entities/Order.ts
export class Order {
  calculateTotal(): Money {
    // Pure business logic
  }
}
```

### 4. Communication Patterns
Explain how parts communicate:
```markdown
### Synchronous (REST)
Use for: Immediate response needed

### Asynchronous (Message Queue)
Use for: Fire-and-forget operations
```

### 5. Service Inventory
List all services with descriptions:
```markdown
├── auth-service/       # Authentication & authorization
├── user-service/       # User profile management
├── order-service/      # Order processing
```

### 6. Port Documentation
Document all service ports:
```markdown
- API Gateway: 4000
- Auth Service: 4001
- User Service: 4002
```

### 7. Dependency Graph
Show service dependencies:
```markdown
- Auth Service: No dependencies (base service)
- User Service: Depends on Auth
- Order Service: Depends on Auth, User
```

### 8. Development Commands
Provide commands for common tasks:
```bash
pnpm dev:all  # Starts all services + gateway

cd services/auth-service
pnpm dev      # Run single service
```

### 9. Design Pattern Documentation
Explain key patterns used:
```markdown
### Repository Pattern
Abstracts data access:
[code example]

### Value Objects
Immutable types with behavior:
[code example]
```

### 10. Guidelines and Rules
Provide architectural rules:
```markdown
- Domain layer should have no framework dependencies
- Use cases should be thin orchestrators
- Repositories abstract all data access
```

### 11. Database Strategy
For microservices, explain data management:
```markdown
- Each service has its own database
- No direct database access between services
- Use events to sync data across services
```

### 12. Testing Strategy by Architecture
Different architecture = different testing:
```markdown
## Testing
- Unit tests: Test domain logic in isolation
- Integration tests: Test with real database
- Contract tests: Verify service interfaces
- E2E tests: Test through API gateway
```

### 13. Deployment Information
Document how services deploy:
```markdown
Each service deploys independently:
- Docker containers
- Kubernetes orchestration
- Auto-scaling based on CPU/memory
- Health checks at `/health` endpoint
```

### 14. Code Location Guidance
Tell Claude where to put new code:
```typescript
// For new domain entities
// domain/entities/NewEntity.ts

// For new use cases
// application/useCases/NewUseCase.ts
```

This is critical for maintaining architectural consistency.
