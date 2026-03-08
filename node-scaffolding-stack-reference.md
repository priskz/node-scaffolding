# node-scaffolding — Stack Reference

> Generated: 2026-03-07
> Path: `/Users/mbp3/Desktop/Code/node-scaffolding/`
> Purpose: Reference document for building new projects using this stack. Load into an AI agent before writing any new code.

---

## 1. Stack Overview

### Runtime & Language
| Dependency | Version | Role |
|---|---|---|
| Node.js | (LTS) | Runtime |
| TypeScript | ^3.9.3 | Language — type-checked with `tsc --noEmit`, transpiled with Babel |
| `express` | ^4.17.1 | HTTP framework |
| `express-async-handler` | ^1.1.4 | Wraps async route handlers so exceptions propagate to the error middleware |

### Database & ORM
| Dependency | Version | Role |
|---|---|---|
| `typeorm` | ^0.2.25 | ORM — Data Mapper pattern (NOT Active Record) |
| `mysql2` | ^2.1.0 | MySQL driver |
| `reflect-metadata` | ^0.1.13 | Required by TypeORM decorators — must be imported first in `src/app.ts` |

### Infrastructure
| Dependency | Version | Role |
|---|---|---|
| `redis` | ^3.1.1 | Cache layer |
| `@elastic/elasticsearch` | ^7.8.0 | Search |
| `node-schedule` | ^1.3.2 | Cron-style job scheduler |
| `winston` | ^3.2.1 | Structured logging |

### Auth & HTTP Utilities
| Dependency | Version | Role |
|---|---|---|
| `bcrypt` | ^5.0.0 | Password hashing |
| `crypto-js` | ^4.0.0 | Symmetric encryption |
| `cookie-parser` | ^1.4.5 | Signed cookie parsing — session ID transport |
| `body-parser` | ^1.19.0 | JSON request body parsing |
| `compression` | ^1.7.4 | gzip response compression |
| `axios` | ^0.21.2 | HTTP client (used in tests) |
| `uuid` | ^8.2.0 | UUID generation |
| `luxon` | ^1.24.1 | Date/time |

### Validation & Docs
| Dependency | Version | Role |
|---|---|---|
| `node-input-validator` | ^4.2.0 | Request validation — inline in handlers |
| `swagger-ui-express` | ^4.1.4 | OpenAPI docs served at `/docs` |
| `dotenv` | ^8.2.0 | `.env` loading |

### Build Pipeline
| Script | Command |
|---|---|
| `npm run build` | `clean` → `type-check` → `compile` |
| `npm run type-check` | `tsc --noEmit` (type errors only, no output) |
| `npm run compile` | Babel transpile `src/` → `dist/` (`.ts` → `.js`) |
| `npm run dev` | `type-check` + `nodemon` (auto-restart on change) |
| `npm start` | `node ./dist/server.js` (production) |

**Important:** Babel is the transpiler. TypeScript type errors do NOT block the Babel build — they must be caught by running `type-check` first. The `build` script runs both in sequence.

### Path Alias
`~/` maps to `src/`. Configured in both `tsconfig.json` (`paths`) and `.babelrc` (`babel-plugin-module-resolver`). Always use `~/` for cross-directory imports — never relative paths across major boundaries.

```typescript
import { config } from '~/config'
import { respond } from '~/lib/util'
import { AuthRoot } from '~/app/service'
```

---

## 2. Architecture Implementation

### App Bootstrap — `src/app.ts`

```typescript
import 'reflect-metadata'   // MUST be first import — TypeORM decorators requirement
// ...
const instance: Express = express()

async function run(): Promise<Express> {
  log.init(config.log)
  if (config.schedule.enable) { schedule.config(...); await schedule.start() }
  await database.connect(config.db)
  await cache.connect(config.cache.driver)
  instance.use(compression())
  instance.use(bodyParser.json())
  instance.use(cookieParser(env('COOKIE_SECRET')))
  instance.use(global)                                          // req helper methods
  instance.use(`${config.api.prefix}${config.api.version}`, router)  // /api/v1
  instance.use(exception)                                       // error handler — LAST
  return instance
}

export const app = { instance, run, shutdown }
```

Entry point is `src/server.ts` which calls `app.run()` and starts `http.createServer`.

### Request Flow

```
HTTP Request
  → bodyParser.json()
  → cookieParser(COOKIE_SECRET)
  → global middleware        adds req.context, req.setSession(), req.getSession(), req.getUser()
  → router (at /api/v1)
      → route-specific middleware  (e.g. session — load/create session from signed cookie)
      → handler function           (async (req, res) => void)
          → node-input-validator   inline input validation
          → new RootService() or DataService call
          → respond(req, res).success(data) | .error(data, code)
  → exception middleware     catches unhandled errors → 500
```

**No Action class.** The handler function IS the action. Validate, call service, respond — all inline.

### Directory Map

```
src/
├── app.ts                    App bootstrap
├── server.ts                 HTTP server entry point
├── env.ts                    Typed env() accessor
├── config/                   Typed config objects
├── app/
│   ├── api/                  HTTP handlers — one dir per module, one file per action
│   ├── domain/               TypeORM entities + repositories + optional caches
│   ├── middleware/           Express middleware (global, session, exception)
│   ├── routes/               Express Router registration
│   ├── service/
│   │   ├── data/             CRUD DataService subclasses — one per entity
│   │   ├── root/             Aggregate Root services
│   │   └── web/              External web service wrappers (placeholder)
│   └── job/                  Scheduled job definitions
├── lib/
│   ├── domain/               TypeORMRepository base class + query types
│   ├── service/              DataService base class
│   └── util/                 cache, crypt, database, env, log, respond, route, schedule, search, time
├── config/                   api.ts, app.ts, cache.ts, database.ts, docs.ts, log.ts, schedule.ts, search.ts, session.ts
├── docs/                     Swagger spec
├── migration/                TypeORM migrations
└── test/                     Shared test setup, mocks, seeds, util
```

---

## 3. Module Pattern Examples

### API handler — `src/app/api/auth/login.ts`

```typescript
import { Request, Response } from 'express'
import { Validator } from 'node-input-validator'
import { respond } from '~/lib/util'
import { config } from '~/config'
import { AuthRoot } from '~/app/service'

export async function login(req: Request, res: Response): Promise<void> {
  // Guard: already logged in?
  if (req.getUser()) {
    respond(req, res).error()
    return
  }

  // Validate input
  const input = new Validator(req.body, {
    email: 'required|email',
    pass: 'required'
  })
  const valid = await input.check()
  if (!valid) {
    respond(req, res).error(null, 401)
    return
  }

  // Call service
  const service = new AuthRoot()
  const session = await service.login(req.getSession(), req.body.email, req.body.pass)

  if (!session) {
    respond(req, res).error(null, 401)
    return
  }

  // Set cookie and respond
  req.setSession(session)
  await res.cookie(config.session.cookie, session.id, {
    expires: session.expiresAt,
    sameSite: 'strict',
    signed: true
  })
  respond(req, res).success()  // 204 No Content (no data passed)
}
```

### API index (loader) — `src/app/api/auth/index.ts`

```typescript
import { login } from './login'
import { logout } from './logout'
import { register } from './register'

export const AuthApi = { login, logout, register }
// index.ts: no logic, only imports and named exports. Never export default.
```

### Route file — `src/app/routes/auth.ts`

```typescript
import { Router } from 'express'
import { route, RouteConfig } from '~/lib/util'
import { AuthApi } from '~/app/api'
import { session } from '~/app/middleware'

export const auth = Router()

const base = ''

const routes: RouteConfig[] = [
  { path: '/login',    method: 'post', handler: AuthApi.login,    middleware: session },
  { path: '/logout',   method: 'post', handler: AuthApi.logout,   middleware: session },
  { path: '/register', method: 'post', handler: AuthApi.register, middleware: session }
]

route.register(auth, routes, base)
```

`RouteConfig` shape:
```typescript
interface RouteConfig {
  path: string
  method: 'get' | 'post' | 'put' | 'delete'
  handler: RequestHandler
  middleware?: RequestHandler | RequestHandler[]  // runs BEFORE handler
  after?: RequestHandler | RequestHandler[]       // runs AFTER handler
  sync?: boolean                                  // default false (async)
}
```

All handlers and middleware are automatically wrapped in `express-async-handler` by `route.register()` — unhandled promise rejections propagate to the `exception` middleware.

### Top-level router — `src/app/routes/router.ts`

```typescript
import { Router } from 'express'
import { admin } from './admin'
import { auth } from './auth'
// ...

export const router = Router()

router.use('/', aux)
router.use('/admin', admin)
router.use('/auth', auth)
router.use('/session', session)
router.use('/search', search)
router.use('/docs', swaggerUi.serve, swaggerUi.setup(config.docs))
```

Mounted in `app.ts` at `${config.api.prefix}${config.api.version}` → `/api/v1`.

### TypeORM Entity — `src/app/domain/user/User.ts`

```typescript
import { Column, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { Session } from '../session'

@Entity('user')           // table name: 'user'
export class User {
  @PrimaryGeneratedColumn()
  id!: number             // auto-increment integer PK

  @Column('varchar', { unique: true })
  email!: string

  @Column('varchar', { nullable: true })
  password!: string

  @Column('timestamp', { precision: 0, default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date

  @Column('timestamp', { precision: 0, default: null, onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt!: Date

  @DeleteDateColumn({ precision: 0, default: null })
  deletedAt!: Date        // soft delete — populated by TypeORM softDelete()

  @OneToMany(type => Session, session => session.user)
  session!: Session[]
}
```

For UUID primary keys (e.g. Session): `@PrimaryGeneratedColumn('uuid')`.

### Repository — `src/app/domain/user/UserRepository.ts`

```typescript
import { EntityRepository } from 'typeorm'
import { TypeORMRepository } from '~/lib/domain/TypeORMRepository'
import { User } from './'

@EntityRepository(User)
export class UserRepository extends TypeORMRepository<User> {}
// Extend with custom query methods when needed.
// TypeORMRepository provides: get, getOne, getWithCount, findOneById, create, update, delete, raw, getQueryBuilder
```

### Data Service — `src/app/service/data/user/UserService.ts`

```typescript
import { DataService } from '~/lib/service/DataService'
import { User, UserRepository } from '~/app/domain'
import { getCustomRepository } from 'typeorm'

export class UserService extends DataService<User> {
  constructor() {
    super(getCustomRepository(UserRepository))  // TypeORM custom repository
  }

  // Add domain-specific query methods beyond the base get/create/update/delete:
  public async getOneByEmail(email: string): Promise<User | undefined> {
    return await this.getOne({ where: { email } })
  }
}
```

`DataService<T>` base provides: `get(query?)`, `getOne(query?)`, `getWithCount(query?)`, `create(data)`, `update(data)`, `delete(id)`.

### Root Service — `src/app/service/root/auth/AuthRoot.ts`

```typescript
import { SessionService, UserService } from '~/app/service/data'

export class AuthRoot {
  protected session: SessionService
  protected user: UserService

  constructor() {
    this.session = new SessionService()   // instantiated directly — no DI container
    this.user = new UserService()
  }

  public async login(session: Session, email: string, password: string): Promise<Session | undefined> {
    const user = await this.user.getOneByEmail(email)
    if (!user) return
    const valid = await crypt.hash.check(password, user.password)
    if (!valid) return
    return await this.session.update({ id: session.id, userId: user.id })
  }
}
```

Root services are instantiated in handlers with `new AuthRoot()`. No facades, no service containers.

### Domain entity index (loader) — `src/app/domain/user/index.ts`

```typescript
export { User } from './User'
export { UserRepository } from './UserRepository'
export { UserCache } from './UserCache'
// index.ts: re-exports only. Never add logic.
```

---

## 4. Config Patterns

### Structure

Each config domain has its own file exporting a typed constant and interface:

```typescript
// src/config/api.ts
export const api: ApiConfig = {
  version: 'v1',
  prefix: '/api/'
}
export interface ApiConfig {
  version: string
  prefix: string
}
```

All configs are aggregated in `src/config/index.ts`:

```typescript
export const config: ConfigDictionary = { api, app, cache, db, docs, log, search, session, schedule }
```

Consumed anywhere as:
```typescript
import { config } from '~/config'
config.api.version        // 'v1'
config.session.cookie     // 'session'
config.api.prefix         // '/api/'
```

### Config files and what they configure

| File | Key fields |
|---|---|
| `config/api.ts` | `version: 'v1'`, `prefix: '/api/'` |
| `config/app.ts` | `env`, `name`, `port` (from `APP_PORT`), `key` |
| `config/database.ts` | All `TYPEORM_*` env vars → TypeORM `ConnectionOptions` |
| `config/cache.ts` | Redis connection details from `REDIS_CACHE_*` env vars |
| `config/session.ts` | `cookie: 'session'`, `duration: { guest: 30, user: 90 }` (days) |
| `config/log.ts` | Winston transport config |
| `config/schedule.ts` | `enable: boolean`, `jobs: JobScheduleConfig[]` |
| `config/search.ts` | Elasticsearch connection |
| `config/docs.ts` | Swagger spec object |

### Env vars

Read via `env()` helper from `~/lib/util/env` for typed access, or directly from `process.env` in config files.

```
APP_PORT=80
COOKIE_SECRET=xxxxx
TYPEORM_CONNECTION=mysql
TYPEORM_HOST=localhost
TYPEORM_USERNAME=root
TYPEORM_PASSWORD=local
TYPEORM_DATABASE=app
TYPEORM_PORT=3306
TYPEORM_SYNCHRONIZE=false
TYPEORM_ENTITIES=src/app/domain/**/!(*.spec.ts)
TYPEORM_MIGRATIONS=src/migration/*.ts
TYPEORM_SUBSCRIBERS=src/app/domain/subscriber/*.ts
TYPEORM_LOGGING=false
TYPEORM_ENTITIES_DIR=src/app/domain
TYPEORM_MIGRATIONS_DIR=src/migration
TYPEORM_SUBSCRIBERS_DIR=src/app/domain/subscriber
REDIS_CACHE_DEFAULT=redis
REDIS_CACHE_HOST=localhost
REDIS_CACHE_PORT=6379
REDIS_CACHE_DB_DEFAULT=0
```

---

## 5. TypeORM Setup

### Connection

Configured via env vars in `src/config/database.ts`, consumed by `database.connect(config.db)` in `app.ts`. TypeORM reads all entity files matching the glob in `TYPEORM_ENTITIES`.

**`TYPEORM_SYNCHRONIZE=false` always in production.** Schema changes happen via migrations only.

### Entity conventions

- Decorated with `@Entity('table_name')` — always specify table name explicitly.
- PK: `@PrimaryGeneratedColumn()` for auto-increment int; `@PrimaryGeneratedColumn('uuid')` for UUID.
- Timestamps:
  ```typescript
  @Column('timestamp', { precision: 0, default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date

  @Column('timestamp', { precision: 0, default: null, onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt!: Date

  @DeleteDateColumn({ precision: 0, default: null })
  deletedAt!: Date   // soft deletes — set softDeletes: true on repository
  ```
- Relationships use standard TypeORM decorators: `@OneToMany`, `@ManyToOne`, `@ManyToMany`, `@JoinTable`.
- All entity class files include `/* istanbul ignore file */` to exclude from coverage.

### Repository wiring

1. Create entity: `src/app/domain/{Entity}/{Entity}.ts`
2. Create repository: `src/app/domain/{Entity}/{Entity}Repository.ts`
   ```typescript
   @EntityRepository(MyEntity)
   export class MyEntityRepository extends TypeORMRepository<MyEntity> {}
   ```
3. In service constructor: `getCustomRepository(MyEntityRepository)` — retrieves the repository from TypeORM's connection.

### `TypeORMRepository<T>` query API

```typescript
// Where clause — simple
{ where: { status: 'ACTIVE' } }

// Where clause — advanced operator
{ where: { amount: { value: 10, operator: '>' } } }
// Operators: '!=', '<>', '<', '<=', '>', '>=', '=', 'LIKE', 'BETWEEN', 'IN', 'IS NULL', 'IS NOT NULL', 'RAW'

// Where clause — OR (pass array — TypeORM treats array where as OR)
{ where: [{ status: 'ACTIVE' }, { status: 'NOMINATED' }] }

// With relations (eager load)
{ embed: ['session', 'profile'] }

// Pagination
{ take: 20, skip: 0 }  // skip requires take — throws if skip given without take
```

Soft deletes: set `protected softDeletes = true` on the repository class. `delete(id)` will call `repository.softDelete(id)` instead of `repository.delete(id)`.

Eager relations: set `protected eager = ['relation1', 'relation2']` on the repository class for always-on loading.

### Migrations

```bash
# 1. Make entity changes
# 2. Generate migration file
npm run migrate:generate SomeDescriptiveName

# 3. Review generated file in src/migration/
# 4. Apply
npm run migrate:run

# Undo last migration
npm run migrate:revert
```

Migration files implement `MigrationInterface` with `up(queryRunner)` and `down(queryRunner)` methods using raw SQL via `queryRunner.query()`. Named with timestamp prefix: `{timestamp}-{Name}.ts`.

---

## 6. Testing Setup

### Runner

Mocha + Chai. Configuration in `.mocharc.json`:

```json
{
  "extension": ["ts"],
  "watch-files": ["src/**/*.spec.ts"],
  "require": [
    "ts-node/register/transpile-only",  // run TypeScript directly without compile step
    "tsconfig-paths/register",           // enable ~/  path alias in tests
    "source-map-support/register"
  ],
  "file": ["src/test/main.ts"],          // global setup/teardown — runs before all specs
  "full-trace": true,
  "bail": false,
  "recursive": true,
  "timeout": 10000
}
```

### Global test setup — `src/test/main.ts`

```typescript
import { before, after } from 'mocha'
import { server } from './server'
import chai from 'chai'
import chaiLike from 'chai-like'
import chaiThings from 'chai-things'
import chaiAsPromised from 'chai-as-promised'  // always last
import chaiEach from 'chai-each'

before(async () => {
  chai.should()
  chai.use(chaiLike)
  chai.use(chaiThings)
  chai.use(chaiEach)
  chai.use(chaiAsPromised)
  await server.start()   // boots the real Express app against a test DB
})

after(async () => {
  await server.stop()
})
```

### Test commands

```bash
npm test             # all specs
npm run test:min     # skip @external and @database tagged tests
npm run test:cover   # with text-summary coverage
npm run test:full    # with full HTML + text coverage report
```

### Spec file conventions

- Co-located with the subject: `UserRepository.spec.ts` lives next to `UserRepository.ts`
- Named with `describe` matching the file path: `describe('app/domain/user/UserRepository', ...)`
- HTTP integration tests use `appRequest` (axios instance) from `~/test/util`
- Use `MockUser`, `MockSession` etc. from `~/test/mocks` for test data setup/teardown
- `before`/`after` hooks for DB setup and cleanup within each describe block

### Example integration test pattern — `src/app/api/auth/login.spec.ts`

```typescript
describe('api/auth/login', () => {
  let guestData = MockUser.guest()

  before(async () => {
    await MockUser.create({ ...guestData, password: await crypt.hash.make(guestData.password) })
  })

  after(async () => {
    await MockUser.destroyByEmail(guestData.email)
  })

  describe('valid credentials && session cookie is provided', () => {
    it('should return 204 No Content', async () => {
      const result: AxiosResponse = await appRequest.post('/auth/login', {
        email: guestData.email,
        pass: guestData.password
      }, { headers: { cookie } })

      expect(result.status).to.equal(204)
    })
  })

  describe('invalid credentials', () => {
    it('should return 401 Unauthorized', async () => {
      const result = await appRequest.post('/auth/login', { email: guestData.email, pass: 'wrong' })
      expect(result.status).to.equal(401)
    })
  })
})
```

---

## 7. Docker Setup

Config: `docker/docker-compose.yml`

```bash
cd docker && docker-compose up -d
```

### Services

| Service | Image | Port | Volume |
|---|---|---|---|
| `db` (MySQL 5) | `mysql:5` | `3306:3306` | `my-db:/var/lib/mysql` |
| `cache` (Redis) | `redis` | `6379:6379` | — |
| `elasticsearch` | `elasticsearch:7.4.2` | `9200:9200`, `9300:9300` | `elasticsearch-data:/usr/share/elasticsearch/data` |
| `kibana` | `kibana:7.4.2` | `5601:5601` | — (depends on elasticsearch) |

Default MySQL credentials: `user=local`, `password=local`, `root_password=local`.

Elasticsearch runs in single-node mode with security disabled (`xpack.security.enabled=false`).

Kibana available at `http://localhost:5601/` — connects to Elasticsearch at `http://elasticsearch:9200`.

---

## 8. Reuse Checklist

### Stays the same across projects (do not change)

- `src/lib/` — all framework utilities: `TypeORMRepository`, `DataService`, `Responder`, `respond()`, `route.register()`, `cache`, `crypt`, `database`, `log`, `schedule`, `search`, `time`, `env`
- `src/app/middleware/global.ts` — `req.context`, `req.setSession()`, `req.getSession()`, `req.getUser()`
- `src/app/middleware/exception.ts` — global error handler
- `src/app.ts` — bootstrap sequence (may add/remove optional services like search or schedule)
- `src/server.ts` — HTTP server entry
- `src/test/main.ts` — global Mocha setup
- `docker/docker-compose.yml` — local service stack
- `.mocharc.json`, `tsconfig.json`, `.babelrc`, `.eslintrc`, `.prettierrc` — tooling config

### Changes per project

| What | Where | Notes |
|---|---|---|
| **Env vars** | `.env` (copy from `.env.example`) | DB name, credentials, ports, secrets |
| **App name / port** | `src/config/app.ts` | `name`, `port` |
| **API version** | `src/config/api.ts` | `version`, `prefix` |
| **Session cookie name** | `src/config/session.ts` | `cookie` |
| **Domain entities** | `src/app/domain/{Entity}/` | New `{Entity}.ts`, `{Entity}Repository.ts`, optional `{Entity}Cache.ts` |
| **Data services** | `src/app/service/data/{entity}/` | New `{Entity}Service.ts` extending `DataService<T>` |
| **Root services** | `src/app/service/root/{name}/` | New `{Name}Root.ts` aggregating data services |
| **API handlers** | `src/app/api/{module}/` | One file per action, `index.ts` loader |
| **Routes** | `src/app/routes/{module}.ts` + `router.ts` | Add new route file, mount in router |
| **Migrations** | `src/migration/` | Generate via `npm run migrate:generate` |
| **Swagger docs** | `src/docs/swagger/paths/` | Add path specs matching new routes |
| **Test mocks/seeds** | `src/test/mocks/`, `src/test/seeds/` | Add per entity |
| **Scheduled jobs** | `src/config/schedule.ts` + `src/app/job/` | Only if project needs scheduled tasks |
| **Search** | `src/config/search.ts` | Only if project uses Elasticsearch |

### Adding a new domain entity — minimal steps

1. `src/app/domain/{Entity}/{Entity}.ts` — TypeORM entity class with `@Entity('table_name')`
2. `src/app/domain/{Entity}/{Entity}Repository.ts` — `@EntityRepository(Entity) class extends TypeORMRepository<Entity> {}`
3. `src/app/domain/{Entity}/index.ts` — export both
4. Re-export from `src/app/domain/index.ts`
5. `src/app/service/data/{entity}/{Entity}Service.ts` — extend `DataService<Entity>`, `getCustomRepository` in constructor
6. `src/app/service/data/{entity}/index.ts` + re-export from `src/app/service/data/index.ts`
7. Run `npm run migrate:generate AddEntity` → review → `npm run migrate:run`

### Adding a new API endpoint — minimal steps

1. `src/app/api/{module}/{action}.ts` — async handler function
2. `src/app/api/{module}/index.ts` — add to export object
3. `src/app/routes/{module}.ts` — add to `RouteConfig[]` array
4. Mount in `src/app/routes/router.ts` if new module

---

## 9. Respond Utility API

All handlers respond via the `respond()` helper from `~/lib/util`. Never send raw `res.json()` or `res.send()` directly.
```typescript
import { respond } from '~/lib/util'

// Success responses
respond(req, res).success()           // 204 No Content — use when returning no data
respond(req, res).success(data)       // 200 OK — data is serialized to JSON body

// Error responses
respond(req, res).error()             // 500 Internal Server Error
respond(req, res).error(null, 401)    // 401 Unauthorized — no body
respond(req, res).error(data, 400)    // 400 Bad Request — data in body
respond(req, res).error(null, 404)    // 404 Not Found

// Pattern: always return after respond — handler is void, not a chain
respond(req, res).error(null, 401)
return
```

**Rules:**
- Always `return` after calling `respond()` to prevent double-response errors
- Pass `null` as first arg when you want a status code but no body
- `success()` with no args → 204. `success(data)` with data → 200.
- HTTP status code is always the second argument to `.error()`

---

## 10. lib/util Available Helpers

Everything importable from `~/lib/util`:

| Export | Usage | Notes |
|---|---|---|
| `respond` | `respond(req, res).success(data)` | HTTP response helper — see Section 9 |
| `route` | `route.register(router, routes, base)` | Registers RouteConfig[] on an Express Router |
| `cache` | `cache.connect()`, `cache.get()`, `cache.set()` | Redis wrapper |
| `crypt` | `crypt.hash.make(plain)`, `crypt.hash.check(plain, hash)` | bcrypt wrapper |
| `database` | `database.connect(config.db)` | TypeORM connection bootstrap |
| `log` | `log.init(config.log)`, `log.info()`, `log.error()` | Winston wrapper |
| `schedule` | `schedule.config()`, `schedule.start()` | node-schedule wrapper |
| `search` | `search.connect()`, `search.index()`, `search.query()` | Elasticsearch wrapper |
| `time` | `time.now()`, `time.add()`, `time.format()` | Luxon wrapper |
| `env` | `env('VAR_NAME')` | Typed process.env accessor — throws if var missing |

**Import pattern — always destructure from the barrel:**
```typescript
import { respond, log, crypt, env } from '~/lib/util'
// Never import directly from the file: import { respond } from '~/lib/util/respond'
```

---

## 11. Intentional Absences

These patterns are deliberately NOT used in this stack. Do not introduce them.

| Pattern | Why it's absent |
|---|---|
| Dependency injection container | Services are instantiated directly with `new` — no IoC, no decorators on services |
| Facades / static service access | All service access is through instance methods on explicitly constructed objects |
| `export default` | All exports are named — makes refactoring and tree-shaking explicit |
| Active Record | TypeORM is configured for Data Mapper only — entities are plain data, no methods |
| Relative cross-directory imports | Always use `~/` alias — never `../../lib/util` |
| Inline config | All config lives in `src/config/` — never `process.env.X` inline in handlers |
| Global error throwing without middleware | All unhandled errors propagate to `exception` middleware via `express-async-handler` |