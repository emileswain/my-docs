# Mermaid Diagram Examples

This document contains examples of all major Mermaid diagram types.

## Flowchart

Flowcharts are used to represent workflows or processes.

```mermaid
graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> E[Fix the issue]
    E --> B
    C --> F[End]
```

## Sequence Diagram

Sequence diagrams show how processes operate with one another and in what order.

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant Server
    participant Database

    User->>Browser: Enter URL
    Browser->>Server: HTTP Request
    Server->>Database: Query Data
    Database-->>Server: Return Results
    Server-->>Browser: HTTP Response
    Browser-->>User: Display Page
```

## Class Diagram

Class diagrams are used in object-oriented programming to show the structure of a system.

```mermaid
classDiagram
    class Animal {
        +String name
        +int age
        +makeSound()
    }
    class Dog {
        +String breed
        +bark()
    }
    class Cat {
        +Boolean indoor
        +meow()
    }

    Animal <|-- Dog
    Animal <|-- Cat
```

## State Diagram

State diagrams show the different states of an entity and transitions between states.

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Processing: Start Task
    Processing --> Completed: Success
    Processing --> Failed: Error
    Failed --> Idle: Retry
    Completed --> [*]
```

## Entity Relationship Diagram

ER diagrams show relationships between entities (typically database tables).

```mermaid
erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    CUSTOMER }|..|{ DELIVERY-ADDRESS : uses

    CUSTOMER {
        string name
        string email
        string phone
    }
    ORDER {
        int orderNumber
        date orderDate
        string status
    }
    LINE-ITEM {
        int quantity
        decimal price
    }
```

## Gantt Chart

Gantt charts illustrate project schedules and timelines.

```mermaid
gantt
    title Project Timeline
    dateFormat  YYYY-MM-DD
    section Planning
    Research           :a1, 2024-01-01, 30d
    Requirements       :a2, after a1, 20d
    section Development
    Backend Development :b1, 2024-02-01, 45d
    Frontend Development:b2, after b1, 40d
    section Testing
    Integration Testing :c1, after b2, 15d
    UAT                :c2, after c1, 10d
```

## Pie Chart

Pie charts show statistical data in a circular graph.

```mermaid
pie title Technology Stack Usage
    "React" : 35
    "Vue" : 25
    "Angular" : 20
    "Svelte" : 12
    "Other" : 8
```

## Git Graph

Git graphs visualize git commit history and branching.

```mermaid
gitGraph
    commit id: "Initial commit"
    branch develop
    checkout develop
    commit id: "Add feature A"
    commit id: "Add feature B"
    checkout main
    merge develop
    commit id: "Release v1.0"
    branch hotfix
    checkout hotfix
    commit id: "Fix critical bug"
    checkout main
    merge hotfix
```

## User Journey

User journey diagrams map out the steps a user takes to accomplish a goal.

```mermaid
journey
    title User Shopping Experience
    section Browse
      Visit website: 5: User
      Search products: 4: User
      View details: 4: User
    section Purchase
      Add to cart: 3: User
      Enter details: 2: User
      Complete payment: 3: User, Payment Gateway
    section Post-Purchase
      Receive confirmation: 5: User, System
      Track order: 4: User
      Receive product: 5: User
```

## C4 Context Diagram

C4 diagrams show software architecture at different levels of abstraction.

```mermaid
C4Context
    title System Context diagram for Internet Banking System

    Person(customer, "Banking Customer", "A customer of the bank")
    System(banking, "Internet Banking System", "Allows customers to view information about their bank accounts")
    System_Ext(email, "E-mail System", "The internal Microsoft Exchange system")
    System_Ext(mainframe, "Mainframe Banking System", "Stores all core banking information")

    Rel(customer, banking, "Uses")
    Rel(banking, email, "Sends e-mails", "SMTP")
    Rel(banking, mainframe, "Gets account information from")
```

## Notes

All of these diagrams are rendered using Mermaid.js. You can:
- View them inline in markdown files
- Create standalone `.mmd` files for each diagram type
- Click diagrams to expand them (feature coming soon)
