# node-scaffolding — Modernization Plan

> Created: 2026-03-08
> Branch: feature/modernization
> Purpose: Tracks decisions, rationale, and progress for the
> node-scaffolding modernization. This document is a living reference
> — update it as decisions are made and work progresses.

-----

## Overview

The goal of this modernization is to evolve node-scaffolding from a
basic Express/TypeScript scaffold into a robust, production-ready,
generic API foundation comparable in feature richness to what Laravel
provides out of the box — while remaining framework-agnostic and
reusable across unrelated projects.

This modernized scaffold will serve as the foundation for the DMF
Laravel → Node.js migration and all future Node.js API projects.
All tiers will be completed before the DMF migration begins.

**Database support:** MySQL + PostgreSQL (both supported out of the box).

-----

## Key Decisions

### ORM — Replace TypeORM with Prisma

**Decision:** Replace TypeORM 0.2.x with Prisma.

**Rationale:**

- TypeORM has spotty maintenance — critical bugs go unresolved for
  extended periods
- TypeORM 0.2.x is two major versions behind with breaking changes
  in 0.3.x making upgrade non-trivial
- Prisma provides superior TypeScript type safety — generated types
  match the database schema perfectly
- Prisma’s schema-first approach (single `schema.prisma` file)
  consolidates entity definitions, migrations, and type generation
  into one source of truth
- Prisma Studio provides a built-in visual database browser
- Prisma’s DX is the closest Node.js equivalent to Laravel’s
  Eloquent + migrations workflow
- Drizzle was considered but rejected — better suited for
  serverless/edge environments; Prisma is the better fit for a
  general-purpose API scaffold

**Data Mapper pattern is preserved.** Prisma implements Data Mapper
by default — entities are plain data objects, the Prisma Client is
the separate persistence layer. The pattern survives; the
implementation improves.

**Repository pattern is preserved.** Custom query methods live in
thin repository wrapper classes per entity:

```typescript
export class UserRepository {
  constructor(private prisma: PrismaClient) {}
  async findByEmail(email: string) {
    return this.prisma.user.findFirst({ where: { email } })
  }
}
```

Simple CRUD goes through Prisma directly in DataService.
Complex queries get a named home in the repository class.

**Impact:** Entity files, repository pattern, and migration commands
all change. The `lib/domain/TypeORMRepository` base class is replaced
with a Prisma-based equivalent. The service layer architecture is
fully preserved.

-----

### ORM — Database Support

**Decision:** MySQL + PostgreSQL supported out of the box.

**Rationale:** Covers the vast majority of real-world projects.
Switching databases in Prisma is a one-liner in `schema.prisma` —
application code does not change between supported databases.

-----

### Transpilation — Replace Babel with tsx/tsc

**Decision:** Remove Babel. Use `tsc` for production builds and
`tsx` for development.

**Rationale:**

- Babel was a workaround for slow TypeScript compilation — no longer
  necessary with modern tooling
- `tsx` provides fast TypeScript execution with hot reload
  (`tsx --watch`) replacing nodemon + Babel
- Eliminates the dangerous gap where Babel compiled successfully
  despite TypeScript type errors
- Simplifies the build pipeline — one tool, one config

**Impact:** Remove `.babelrc`, `babel-plugin-module-resolver`.
Path alias (`~/`) wired through `tsc-alias` instead.

-----

### Testing — Replace Mocha/Chai with Vitest

**Decision:** Replace Mocha + Chai + NYC with Vitest.

**Rationale:**

- Vitest provides dramatically better DX — watch mode, inline
  snapshots, UI reporter
- Native TypeScript support — no `ts-node/register` workaround needed
- Built-in code coverage via V8 — replaces NYC
- Compatible API with Jest — widely understood
- Chai assertion style preserved via `expect` API

**Impact:** Remove `.mocharc.json`, `ts-node`, `nyc`.
Replace with `vitest.config.ts`. Test files remain co-located
(`*.spec.ts`) — no structural change.

-----

### Validation — Replace node-input-validator with Zod

**Decision:** Replace `node-input-validator` with Zod.

**Rationale:**

- Full TypeScript type inference from schemas — validated data is
  automatically typed
- Composable, reusable schemas across handlers
- Single library for both request validation and environment
  variable validation
- `node-input-validator` has minimal TypeScript support and an
  inactive community

**Impact:** Request validation moves from inline Validator instances
to Zod schemas defined alongside handlers or in a `schemas/`
subdirectory per module.

-----

### Linting — Replace TSLint with ESLint

**Decision:** Replace TSLint with ESLint + `@typescript-eslint`.

**Rationale:** TSLint is officially deprecated and unmaintained
since 2019. ESLint with `@typescript-eslint` is the current standard.

-----

### Queue / Jobs — Bull MQ

**Decision:** Bull MQ for background job processing and scheduled
tasks, replacing `node-schedule`.

**Rationale:**

- Redis-backed — persistent jobs survive process restarts
- Built-in retry logic, delayed jobs, and repeat/cron jobs
- Replaces both `node-schedule` (cron) and any ad-hoc async work
- Bull Board provides a visual job dashboard out of the box

-----

### WebSockets — Socket.io

**Decision:** Socket.io replacing the ZMQ + Ratchet pattern.

**Rationale:**

- Native Node.js integration — no separate process to manage
- Room-based pub/sub maps directly to multi-tenant use cases
- Automatic client reconnection built in
- Redis adapter available for horizontal scaling

-----

### Event System — EventEmitter2

**Decision:** EventEmitter2 for internal pub/sub.

**Rationale:**

- Supports wildcard events (`auction.*`) and namespaced events
- Async handler support
- Decouples side effects (email, audit logs, webhooks) from core
  business logic
- Lightweight — no external dependencies beyond the package itself

-----

### File Storage — Driver-based abstraction

**Decision:** Custom storage service with S3 and local disk drivers.
`@aws-sdk/client-s3` for S3. No third-party abstraction library.

**Rationale:** Third-party abstraction libraries lag behind SDK
updates. A thin interface (`upload`, `download`, `delete`, `url`)
with swappable drivers gives full control with minimal complexity.

-----

### Email — Nodemailer + MJML

**Decision:** Nodemailer as transport layer, MJML for responsive
HTML email templates.

**Rationale:** MJML is the closest Node.js equivalent to Laravel’s
Blade email templates — clean markup that compiles to
cross-client-compatible HTML. Nodemailer is the de facto Node.js
email standard. Local development uses Mailpit as a mail catcher.

-----

### Auth — JWT + API Keys + OAuth + 2FA

**Decision:** Four auth layers built into the scaffold:

|Layer   |Implementation   |Notes                                                |
|--------|-----------------|-----------------------------------------------------|
|JWT     |Custom middleware|Access + refresh token pattern                       |
|API Keys|Custom middleware|Hashed storage, scoped permissions, optional expiry  |
|OAuth   |Passport.js      |Strategy pattern — enable providers per project      |
|2FA     |otplib (TOTP)    |Google Authenticator compatible, optional per project|

Auth middleware checks `Authorization: Bearer` (JWT) or `X-API-Key`
header and routes to the appropriate strategy.

-----

### RBAC — Custom lightweight implementation

**Decision:** Build RBAC directly into the scaffold rather than
using a library (e.g. casl).

**Rationale:** Three concepts cover all cases cleanly:

- **Roles** — named sets of permissions (e.g. `ADMIN`, `MANAGER`)
- **Permissions** — action strings (e.g. `auction:create`, `player:delete`)
- **Guards** — middleware that checks them

Stored in the database via Prisma, cached in Redis per user session.
Avoids library overhead while remaining flexible.

-----

### Soft Deletes — Prisma Extension

**Decision:** Implement soft deletes via a Prisma client extension
that intercepts `findMany`, `findFirst`, and `delete` calls to
handle `deletedAt` transparently.

**Rationale:** Prisma has no native soft delete support. A client
extension is the cleanest implementation — closest equivalent to
Laravel’s `SoftDeletes` trait with no changes required at the
query call site.

-----

### Pagination — Standardised envelope

**Decision:** All list endpoints return a consistent pagination
envelope built into `DataService`:

```typescript
{
  data: T[],
  meta: {
    page: number,
    perPage: number,
    total: number,
    totalPages: number,
    hasNext: boolean,
    hasPrev: boolean
  }
}
```

Cursor-based pagination available as an alternative for
high-volume endpoints.

-----

### Multi-tenancy — TenantContext middleware

**Decision:** A `TenantContext` middleware resolves the tenant from
the request (subdomain, header, or URL segment) and makes it
available throughout the request lifecycle.

**Two supported patterns:**

- **Schema-per-tenant** — each tenant gets their own database/schema
- **Row-level tenancy** — single database, `tenant_id` on every table

Projects configure which pattern they use. Prisma handles both cleanly.

-----

### Webhooks — Bull MQ backed dispatcher

**Decision:** Webhook dispatcher built on top of the event system
and Bull MQ. Internal events trigger delivery jobs with automatic
retry logic.

**Pattern:** Projects register webhook endpoints and subscribe them
to internal events. When `events.emit('auction.finalized', payload)`
fires, the dispatcher queues delivery to all subscribed endpoints.

-----

## Modernization Scope

### Tier 1 — Foundation (blocks everything else)

- [ ] Create modernization branch
- [ ] Upgrade Node.js to current LTS
- [ ] Upgrade TypeScript to 5.x
- [ ] Replace TypeORM with Prisma (MySQL + PostgreSQL)
- [ ] Replace Babel with tsx + tsc-alias
- [ ] Replace TSLint with ESLint + @typescript-eslint
- [ ] Replace Mocha/Chai/NYC with Vitest

### Tier 2 — Core features

- [ ] Request validation — Zod schemas per module
- [ ] Environment validation — Zod schema at startup, fail fast
  on missing vars
- [ ] JWT authentication — access + refresh token middleware
- [ ] Rate limiting — express-rate-limit
- [ ] Health check — `/health` endpoint
- [ ] Graceful shutdown — SIGTERM/SIGINT handling
- [ ] Helmet.js — security headers
- [ ] CORS — configurable per environment
- [ ] Structured error classes — consistent error response shapes
- [ ] Database transactions — Prisma transaction helper wrapper

### Tier 3 — Infrastructure Services

- [ ] File storage — S3 + local disk driver abstraction
- [ ] Email — Nodemailer + MJML + Mailpit (dev)
- [ ] WebSockets — Socket.io with room-based pub/sub
- [ ] Search — Elasticsearch client upgrade + cleaner abstraction
- [ ] Cache — formalise interface, add `remember()` pattern
- [ ] Logging — Winston structured JSON (prod) + pretty (dev),
  request ID correlation
- [ ] Multi-tenancy — TenantContext middleware (schema + row-level)

### Tier 4 — Data / Domain Features

- [ ] Pagination — standardised envelope in DataService
- [ ] Soft deletes — Prisma client extension
- [ ] Event system — EventEmitter2 internal pub/sub
- [ ] Webhook dispatcher — Bull MQ backed outbound webhooks

### Tier 5 — Auth Features

- [ ] RBAC — roles, permissions, guards (DB + Redis cache)
- [ ] API key authentication — hashed, scoped, optional expiry
- [ ] OAuth / Passport.js — strategy pattern, per-project providers
- [ ] Two-factor authentication — TOTP + recovery codes (otplib)

### Tier 6 — Developer Experience

- [ ] Hot reload — tsx –watch replacing nodemon
- [ ] Docker Compose — update to MySQL 8, PostgreSQL 16, Redis 7
- [ ] Seed system — structured database seeding
- [ ] Request logging middleware — structured HTTP request logs
- [ ] API versioning — clean version handling
- [ ] Bull MQ — job definitions + repeat tasks + Bull Board dashboard
- [ ] Mailpit — local mail catcher in Docker Compose

-----

## Architecture Changes

### What stays the same

- Express.js as the HTTP framework
- App flow: Route → Middleware → Api → Service → Domain → Repo → Model
- Module pattern: index.ts loaders, kebab-case files, named exports only
- `~/` path alias convention
- Service layer architecture (DataService, RootService pattern)
- Repository pattern per entity
- Data Mapper pattern
- Co-located tests (`*.spec.ts`)
- Docker-based local environment

### What changes

|Before                    |After                            |
|--------------------------|---------------------------------|
|TypeORM 0.2.x + decorators|Prisma schema-first              |
|Babel transpilation       |tsx (dev) + tsc (prod)           |
|Mocha + Chai + NYC        |Vitest                           |
|node-input-validator      |Zod                              |
|TSLint                    |ESLint + @typescript-eslint      |
|nodemon                   |tsx –watch                       |
|node-schedule             |Bull MQ repeat jobs              |
|No auth beyond basic JWT  |JWT + API Keys + OAuth + 2FA     |
|No RBAC                   |Roles + Permissions + Guards     |
|No file storage           |S3 + local disk driver           |
|No email                  |Nodemailer + MJML                |
|No WebSockets             |Socket.io                        |
|No event system           |EventEmitter2                    |
|No webhooks               |Bull MQ webhook dispatcher       |
|No pagination envelope    |Standardised data + meta envelope|
|No soft delete abstraction|Prisma client extension          |
|No multi-tenancy          |TenantContext middleware         |
|No env validation         |Zod env schema at startup        |
|Manual transactions       |Prisma transaction helper        |
|MySQL 5 (Docker)          |MySQL 8 + PostgreSQL 16 + Redis 7|

-----

## Reuse Checklist (post-modernization)

### Stays the same across projects

- All `src/lib/` utilities
- Express middleware patterns
- Module structure and naming conventions
- App bootstrap sequence
- Service layer architecture
- Auth middleware (enable/disable strategies per project)
- Socket.io room pattern
- Event system
- Webhook dispatcher

### Changes per project

- `prisma/schema.prisma` — define your entities
- Environment variables (`.env` from `.env.example`)
- Domain entities, repositories, and services
- API handlers and routes
- Zod validation schemas per module
- OAuth providers enabled
- Bull MQ job definitions
- RBAC roles and permission strings
- Email templates
- Storage driver (S3 vs local)

-----

## Progress Log

> Add dated entries as decisions are made or work completes.

- **2026-03-08** — Modernization plan created. All tier decisions
  finalized. ORM: Prisma. Transpilation: tsx + tsc. Testing: Vitest.
  Validation: Zod. Queue: Bull MQ. Auth: JWT + API Keys + OAuth + 2FA.
  RBAC: custom lightweight implementation. Storage: driver abstraction.
  Email: Nodemailer + MJML. WebSockets: Socket.io. Events: EventEmitter2.
  Webhooks: Bull MQ backed. Pagination: standardised envelope.
  Soft deletes: Prisma extension. Multi-tenancy: TenantContext middleware.
  Database support: MySQL + PostgreSQL.
  Decision: complete all tiers before starting DMF migration.