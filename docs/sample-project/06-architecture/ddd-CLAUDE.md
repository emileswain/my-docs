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
