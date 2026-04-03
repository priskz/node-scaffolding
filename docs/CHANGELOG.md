# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Prisma 7 ORM with PostgreSQL adapter, replacing TypeORM 0.2
- Prisma schema with all 6 entities (User, Session, Content, Category, Tag, Image)
- PrismaRepository base class preserving Data Mapper and repository patterns
- Vitest 4.1 test framework with V8 coverage support
- ESLint 10 flat config with @typescript-eslint 8, Allman brace style enforcement
- tsx for development (watch mode) and tsc + tsc-alias for production builds
- prisma:generate, prisma:migrate, prisma:studio npm scripts

### Added (Tier 3B — Cache + Email)
- ioredis cache client replacing redis v3 + es6-promisify — Valkey 8 compatible
- CacheClient with lazy connect, event logging via Pino child logger
- `remember<T>(key, ttl, factory)` cache-aside pattern — miss calls factory, caches result, never caches errors
- CACHE_HOST, CACHE_PORT, CACHE_DB, CACHE_PASSWORD env vars (renamed from REDIS_CACHE_*)
- Nodemailer mail service with React Email template rendering
- MailService with SMTP transport, template-to-HTML via @react-email/render, plain text fallback
- Welcome email template (React component)
- MAIL_HOST, MAIL_PORT, MAIL_USERNAME, MAIL_PASSWORD, MAIL_FROM_NAME, MAIL_FROM_ADDRESS, MAIL_SECURE env vars
- Mail config, mail facade, mail shutdown wired into app lifecycle
- 10 new tests (CacheClient, remember pattern, MailService)

### Added (Tier 3A — Infrastructure Services)
- Pino structured logging replacing Winston — singleton root logger, child loggers per module, env-driven log level
- LogService with destination-based transport wiring (console + file, extensible for cloud)
- pino-pretty for dev, raw JSON for prod
- Request logging middleware with requestId correlation via AsyncLocalStorage
- File storage service with driver abstraction — local disk and S3 drivers
- S3 driver supports AWS S3, MinIO, and S3-compatible services via endpoint config
- Storage facade with lazy driver initialization from STORAGE_DRIVER env var
- LOG_LEVEL, LOG_DESTINATIONS, LOG_CONSOLE_PRETTY, LOG_FILE_PATH env vars
- STORAGE_DRIVER, STORAGE_LOCAL_ROOT, STORAGE_S3_* env vars
- 13 new tests (LogService, request context, local driver, S3 driver)

### Added (Tier 2 — Core Features)
- Zod environment validation — fail-fast at startup with typed env object
- Zod request validation — replaces node-input-validator across all handlers
- Structured error classes — AppError base with ValidationError, AuthenticationError, ForbiddenError, NotFoundError, ConflictError
- Health check endpoint — GET /health with DB status, uptime, memory usage
- Graceful shutdown — SIGTERM/SIGINT handlers, connection draining
- Helmet.js security headers
- CORS middleware with env-configurable origins
- Rate limiting — global (configurable) + strict auth-specific limiter
- JWT authentication — jose, access + refresh tokens, middleware, refresh endpoint
- Prisma transaction helper — wraps $transaction with consistent error handling
- 22 Vitest specs covering error classes, JWT, transactions, env validation, null convention

### Changed
- TypeScript upgraded from 3.9 to 6.0
- DataService base class updated to use PrismaRepository
- Database utility rewritten for Prisma client lifecycle
- Entity files now re-export Prisma-generated types (no more decorator classes)
- Repositories are thin PrismaRepository subclasses (no more @EntityRepository)
- Services instantiate repositories directly (no more getCustomRepository)
- express.json() replaces body-parser
- Null-safety improvements across session middleware and auth handlers

### Changed (Tier 3B)
- Cache module rewritten from redis v3 callbacks + es6-promisify to ioredis async/await
- DefaultCache updated for ioredis API — direct client access, db selection via select()
- ContentCache and UserCache simplified — no longer pass global client through constructor
- Cache config simplified from driver/store pattern to flat CacheConnectionOptions
- tsconfig.json updated with `"jsx": "react-jsx"` for React Email templates

### Changed (Tier 3A)
- All log call sites migrated from string concatenation to Pino structured format
- Cache Client debug logging updated from Winston Logger to Pino child logger

### Removed (Tier 3B)
- redis v3 client library (replaced by ioredis)
- es6-promisify (ioredis is natively async)
- @types/redis, @types/es6-promisify dev dependencies
- Old Client.ts redis wrapper class
- REDIS_CACHE_DEFAULT, REDIS_CACHE_HOST, REDIS_CACHE_PORT, REDIS_CACHE_DB_DEFAULT env vars (renamed to CACHE_*)

### Removed
- Babel (.babelrc, all @babel/* packages, babel-plugin-module-resolver)
- TypeORM (typeorm, reflect-metadata, mysql2, decorators, migration file)
- Mocha/Chai/NYC (.mocharc.json, all chai-* plugins, nyc config)
- nodemon (nodemon.json)
- TSLint-era ESLint config (.eslintrc)
- body-parser (replaced by express.json())
- Old spec files (49 files using Mocha/Chai syntax — replaced by Vitest framework)
- node-input-validator (replaced by Zod)
