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

### Changed
- TypeScript upgraded from 3.9 to 6.0
- DataService base class updated to use PrismaRepository
- Database utility rewritten for Prisma client lifecycle
- Entity files now re-export Prisma-generated types (no more decorator classes)
- Repositories are thin PrismaRepository subclasses (no more @EntityRepository)
- Services instantiate repositories directly (no more getCustomRepository)
- express.json() replaces body-parser
- Null-safety improvements across session middleware and auth handlers

### Removed
- Babel (.babelrc, all @babel/* packages, babel-plugin-module-resolver)
- TypeORM (typeorm, reflect-metadata, mysql2, decorators, migration file)
- Mocha/Chai/NYC (.mocharc.json, all chai-* plugins, nyc config)
- nodemon (nodemon.json)
- TSLint-era ESLint config (.eslintrc)
- body-parser (replaced by express.json())
- Old spec files (49 files using Mocha/Chai syntax — replaced by Vitest framework)
