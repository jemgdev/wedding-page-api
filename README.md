# serverless-typescript-template

This template provides a robust and scalable foundation for building serverless applications with TypeScript, following clean architecture principles, specifically **Hexagonal Architecture (Ports & Adapters)**. It's designed to promote maintainable, testable, and organized codebases for your AWS Lambda functions.

## Features

*   **TypeScript:** Strongly typed JavaScript for enhanced code quality and developer experience.
*   **Serverless Framework:** Simplifies deployment and management of serverless applications.
*   **Hexagonal Architecture (Ports & Adapters):** Structured project layout promoting separation of concerns, testability, and maintainability by clearly defining boundaries between core business logic and external concerns.
*   **Custom Error Handling:** Centralized and extensible error management.
*   **Structured Logging:** Integrated logger for consistent and informative application logs.
*   **Unit Testing:** Pre-configured with Jest for comprehensive unit testing.
*   **Build Process:** Optimized build process that excludes test files from the final output.

## Hexagonal Architecture Overview

Hexagonal Architecture, also known as Ports and Adapters, is a software architectural pattern that aims to create loosely coupled application components that can be easily tested and adapted to different environments. The core idea is to isolate the application's business logic (the "core" or "domain") from external concerns like databases, user interfaces, or external APIs.

In this architecture:

*   **Ports:** Define the interfaces through which the application's core communicates with the outside world. These are technology-agnostic contracts.
*   **Adapters:** Implement the ports, translating specific technology details (e.g., HTTP requests, database queries) into a format that the core business logic understands, and vice-versa.
    *   **Driving Adapters (Primary Adapters):** Initiate interactions with the application. They call the application's ports. Examples include HTTP controllers, CLI commands, or message queue consumers.
    *   **Driven Adapters (Secondary Adapters):** Are called by the application. The application's core defines ports for these adapters, and the adapters implement them. Examples include database repositories, external API clients, or notification services.
*   **Domain/Application Core:** Contains the pure business logic, use cases, entities, and value objects. It knows nothing about the outside world, only communicating through its defined ports.

## Project Structure

The project is organized to reflect Hexagonal Architecture principles, separating concerns into distinct layers:

```
.
├── src/
│   ├── shared/             # Common utilities, libraries, and cross-cutting concerns (e.g., error handling, logging)
│   │   ├── Environments.ts
│   │   ├── errors/         # Custom error classes (Application, Domain, Infrastructure, Validation)
│   │   ├── libraries/      # Shared libraries like the custom logger
│   │   └── utils/          # General utility functions and constants
│   └── user/               # Example domain module (e.g., User management)
│       ├── application/    # Application Layer: Contains use cases (command/query handlers) and defines ports.
│       │   ├── ports/      # Defines interfaces (Ports) for external dependencies (e.g., UserPersistenceRepository).
│       │   └── usecases/   # Implements the application's specific business rules and orchestrates domain objects.
│       │                   # These are the entry points for the application's core logic.
│       ├── domain/         # Domain Layer: Contains the core business logic, entities (e.g., User), and value objects.
│       │   ├── User.ts     # Represents the core business entity.
│       │   └── value-objects/ # Immutable objects representing descriptive aspects of the domain (e.g., Age, ID).
│       └── infrastructure/ # Infrastructure Layer: Contains the Adapters that connect the core to the outside world.
│           ├── driven/     # Driven Adapters (Secondary Adapters): Implement the ports defined in the application layer.
│           │               # Examples: InMemoryUserRepository (implements UserPersistenceRepository).
│           │   ├── InMemoryUserRepository.ts
│           │   ├── dtos/   # Data Transfer Objects for persistence.
│           │   └── mappers/ # Mappers to translate between domain objects and persistence DTOs.
│           └── driving/    # Driving Adapters (Primary Adapters): Initiate calls into the application core via its use cases.
│                           # Examples: HTTP handlers (CreateUserHttp, GetUsersHttp), SQS consumers.
│               ├── dtos/   # Data Transfer Objects for incoming requests/outgoing responses.
│               ├── handlers/ # Entry points for external systems (e.g., HTTP, SQS).
│               │   ├── http/ # HTTP handlers for API Gateway.
│               │   └── sqs/  # SQS message consumers.
│               ├── mappers/ # Mappers to translate between request DTOs and application layer inputs.
│               └── schemas/ # Validation schemas for incoming requests.
├── serverless.yml          # Serverless Framework configuration
├── tsconfig.json           # TypeScript compiler configuration
├── package.json            # Project dependencies and scripts
└── README.md
```

## Getting Started

### Prerequisites

*   [Node.js](https://nodejs.org/en/) (LTS version recommended)
*   [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)
*   [Serverless Framework CLI](https://www.serverless.com/framework/docs/getting-started) (install globally: `npm install -g serverless`)

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd serverless-typescript-template
    ```
2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```

## Available Scripts

*   **`npm run build`**: Compiles the TypeScript source code into JavaScript, placing the output in the `dist/` directory. This command automatically excludes test files (`.test.ts`) from the build output.
*   **`npm test`**: Runs all unit tests using Jest.
*   **`npm run deploy`**: Deploys the serverless application to your configured AWS environment using the Serverless Framework.

## Custom Components

### Error Handling

The `src/shared/errors` directory contains custom error classes that extend `BaseError`. This provides a structured way to handle different types of errors (e.g., `ApplicationError`, `DomainError`, `InfrastructureError`, `ValidationError`) across your application, making error identification and handling more consistent.

### Logging

The `src/shared/libraries/logger` module provides a custom logger implementation (`Logger.ts`) that adheres to the `ILogger.ts` interface. This allows for flexible and structured logging, which can be easily integrated with various logging services.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.