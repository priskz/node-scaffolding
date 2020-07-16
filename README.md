# node-scaffolding

## Local Environment

Uses Docker

Via terminal navigate to `/docker` in the project root and run `docker-compose up -d`

## Application Structure

```
project
│
│──dist
│──docker
│──log
│
└──src
    └───app
    │    └───api
    │    │    └───SomeApi
    │    │         └───index.ts
    │    │         └───action-a.ts
    │    │         └───action-b.ts
    │    │
    │    └───domain
    │    │    └───EntityA
    │    │         └───index.ts
    │    │         └───EntityA/Model.ts
    │    │         └───EntityARepository.ts
    │    │         └───EntityACache.ts
    │    │
    │    └───middleware
    │    │    └───index.ts
    │    │    └───exception.ts
    │    │
    │    └───routes
    │    │    └───index.ts
    │    │    └───router.ts
    │    │    └───some-api-routes.ts
    │    │
    │    └───service
    │         └───data
    │         │     └───entity/model
    │         │           └───index.ts
    │         │           └───EntityService.ts
    │         │
    │         └───root
    │         │     └───some-servce-a
    │         │     |     └───index.ts
    │         │     |     └───SomeARootService.ts
    │         │     |
    │         │     └───some-servce-b
    │         │           └───index.ts
    │         │           └───SomeBRootService.ts
    │         └───web
    │
    └───config
    |     └───api.ts
    |     └───app.ts
    |     └───cache.ts
    |     └───database.ts
    |     └───docs.ts
    |     └───log.ts
    |
    └───docs
    └───lib
    └───migration
    └───test
    │
    └──app.ts
    └──server.ts
```

## App Flow

1. App -> Route
2. Middleware
3. Api -> Controller
4. Service
5. Domain -> Repo -> Model

## Module Patterns & Rules

### Individual Module

```
module
│  │──index.ts
│  │──sum-function.ts
│  └──sum-function.spec.ts
│
└───util
│    │──index.ts
│    │──helper-function.ts
│    └──helper-function.spec.ts
│
└───types
     │
     └──index.ts
```

- Loader
  - index.ts
  - Lives in module root
  - Only imports and exports
    - ~~logic~~
  - Explicit exports
    - ~~export default~~
- Functions
  - Example: sum-function.ts
    - Live in module root
    - Kebab case file name
    - Exports as camelCase
- Helpers
  - Directory: /util
  - Contains index.ts
  - Contains private utility functions/helpers needed by the module
- Common Types / Interface
  - Directory: /types
    - Contains index.ts
    - Contains private interfaces needed by the module
    - Interfaces should be imported more than once, otherwise it should live within the file utilizing it
- Tests
  - Example: some-function.spec.ts
  - Lives next to the test subject

## Database

- Data Mapper Pattern
- ~~Active Record~~
- Synchronize
  - Off by default.
  - Makes sure your entities will be synced with the database, every time you run the application.
  - Anytime you make changes to your entity, it’ll automatically update those schema changes with the database linked to your app.

### Migrations

1. Generate Migration

- To generate a migration file:
  - Make changes to an existing entity (model) file
  - or create a new entity (model) (see: entity creation below)

2. Run Migration Generate Script

```
npm run migration:generate SomeSelfDocumentingNameHere
```

- Typical migration names:
  - Represent the accustomed feature, ie: SomeNewFeature
  - or explain clearly the modificaitons, ie: AddedNewColumnToSomeTable

3. New migration file is then placed into the configured directory

- Check the TYPEORM_MIGRATIONS env value for location

4. Run Migration Execute Script

```
npm run migration:run
```

- Flow
  - If a table named "migrations" does not yet exist, it will be created
  - The configured directory is scanned for new migrations
  - The migration's "up" function is called and database modifications occur
  - A new record is added to the "migrations" table
  - Success!
  - Regret running this new migration? No problem, read on....

6. Revert Migration

- Running the following command will attempt to undo the last migration ran!

```
npm run migration:revert
```

- Flow
  - The "migrations" table is scanned for the most recently inserted record
  - The migration's "down" function is called and database modifications occur
  - The previously existing migration record is removed
  - Success!

## Elastic Search

- Kibana URL: http://localhost:5601/
