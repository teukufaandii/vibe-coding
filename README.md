# Vibe Coding Backend

A robust backend REST API built with NestJS, PostgreSQL, Prisma, and Redis.

## Application Architecture

The application follows a standard **Controller-Service-Module** architecture, adhering to NestJS best practices:

- **Modules (`*.module.ts`)**: Encapsulate related components (e.g., `AuthModule`, `UsersModule`, `ProductsModule`). The `AppModule` serves as the root module.
- **Controllers (`*.controller.ts`)**: Handle incoming HTTP requests, process routing, and map inputs to Data Transfer Objects (DTOs).
- **Services (`*.service.ts`)**: Contain the core business logic. They interact with the database using Prisma and other external services like Redis.
- **DTOs (`*.dto.ts`)**: Define the shape of data sent over the network. DTOs use `class-validator` and `class-transformer` for strict input validation and type transformation.
- **Guards & Decorators**: Used for authentication, authorization, and extracting request metadata (e.g., `JwtAuthGuard`, `@CurrentUser`).

## Naming Conventions

- **Folders**: Lowercase, kebab-case for feature modules (e.g., `auth`, `users`, `products`).
- **Files**: `<feature>.<type>.ts`
  - Controllers: `users.controller.ts`
  - Services: `users.service.ts`
  - Modules: `users.module.ts`
  - DTOs: `create-user.dto.ts`
  - Tests: `users.e2e-spec.ts`
- **Classes/Interfaces**: PascalCase (e.g., `UsersController`, `RegisterDto`).
- **Variables/Functions**: camelCase.

## Available APIs

The API is globally prefixed with `/api`.

### Authentication (`/api/users`)
- `POST /register`: Register a new user. Requires `email`, `name`, `password`, and `captchaToken`. Returns user data and a JWT access token.
- `POST /login`: Authenticate a user. Requires `email` and `password`. Returns a JWT access token.
- `POST /logout`: Revoke the current user's session from Redis. Requires a valid JWT token in the `Authorization` header.

### Users (`/api/users`)
- `GET /current`: Retrieve the profile of the currently authenticated user. Requires a valid JWT token in the `Authorization` header.

### Products (`/api/products`)
- `GET /`: Retrieve a paginated list of products. Supports query parameters:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `search`: Case-insensitive search on product name and description (optimized via GIN Index).
  - `category`: Filter by exact category name.
  - `sort`: Sort by name (`ASC` or `DESC`, case-insensitive).

## Database Schema

The database is managed using Prisma ORM and PostgreSQL. The core models are:

- **User (`users`)**: Stores core user information (`email`, `name`).
- **UserIdentity (`user_identities`)**: Securely stores authentication credentials (`passwordHash`). Relates 1-to-1 with `User`.
- **AuditLog (`audit_logs`)**: Tracks critical actions (e.g., user registrations).
- **Product (`products`)**: Stores product inventory details (`sku`, `name`, `description`, `price`, `stock`, `category`). Features a PostgreSQL **GIN Index** using `pg_trgm` on `name` and `description` for highly optimized text searching.
- **Order / OrderItem (`orders`, `order_items`)**: Tracks user purchases.
- **FlashSale / FlashSaleItem**: Manages time-limited sales.
- **Voucher / VoucherUsage**: Handles discount codes and their usage limits.

*(For full details, view `prisma/schema.prisma`)*

## Technology Stack & Libraries

- **Framework**: [NestJS](https://nestjs.com/) (v11)
- **Language**: TypeScript
- **Database**: PostgreSQL (with `pg_trgm` extension for GIN indexing)
- **ORM**: [Prisma](https://www.prisma.io/) (v7.8)
- **Caching & Session Management**: Redis (via `cache-manager` and `cache-manager-redis-yet`)
- **Security & Authentication**: `@nestjs/jwt`, `argon2` (password hashing)
- **Validation**: `class-validator`, `class-transformer`
- **Testing**: Jest, Supertest

## Setup Instructions

### Prerequisites
- Node.js (v20+ recommended)
- Docker & Docker Compose (for running PostgreSQL and Redis locally)

### 1. Environment Configuration
Create a `.env` file in the root directory and configure the variables:
```env
# Database
POSTGRES_USER=myuser
POSTGRES_PASSWORD=mypassword
POSTGRES_DB=vibe_coding_db
DATABASE_URL="postgresql://myuser:mypassword@localhost:5433/vibe_coding_db?schema=public"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=super-secret-key-change-me
```

### 2. Start Infrastructure
Start the PostgreSQL database and Redis server using Docker Compose:
```bash
docker-compose up -d
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Database Initialization
Apply Prisma migrations to initialize the database schema and generate the Prisma Client:
```bash
npx prisma generate
npx prisma migrate dev
```

## How to Run the Application

```bash
# Run in development mode (with hot-reload)
npm run start:dev

# Build and run in production mode
npm run build
npm run start:prod
```
The server will start on `http://localhost:3000`. API endpoints are accessible at `http://localhost:3000/api`.

## How to Test the Application

The project includes a comprehensive suite of End-to-End (E2E) tests covering all major modules (Auth, Users, Products). Tests are configured to run sequentially (`--runInBand`) to ensure strict database consistency.

```bash
# Run E2E tests
npm run test:e2e
```

The testing suite automatically cleans up the database and Redis cache between test scenarios using centralized utilities located in `test/utils/database.util.ts`.
