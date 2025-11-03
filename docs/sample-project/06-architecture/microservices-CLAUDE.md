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
