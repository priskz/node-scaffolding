import { ConnectionOptions } from 'typeorm'
import { env } from '~/lib/util'

const prod = process.env.NODE_ENV === 'production'

export const db: DbConfig = {
	type: env('TYPEORM_CONNECTION') as ConnectionType,
	host: env('TYPEORM_HOST'),
	port: env('TYPEORM_PORT', 3306, 'int'),
	username: env('TYPEORM_USERNAME'),
	password: env('TYPEORM_PASSWORD'),
	database: env('TYPEORM_DATABASE'),
	synchronize: env('TYPEORM_SYNCHRONIZE', false),
	logging: env('TYPEORM_LOGGING', false),
	// TODO: Clean Up
	entities: !prod
		? env('TYPEORM_ENTITIES', '', 'array')
		: env('TYPEORM_ENTITIES', '', 'array').map((x: string): string => {
				return x.replace('ts', 'js').replace('src', 'dist')
		  }),
	migrations: !prod
		? env('TYPEORM_MIGRATIONS', '', 'array')
		: env('TYPEORM_MIGRATIONS', '', 'array').map((x: string) => {
				return x.replace('ts', 'js').replace('src', 'dist')
		  }),
	subscribers: !prod
		? env('TYPEORM_MIGRATIONS', '', 'array')
		: env('TYPEORM_SUBSCRIBERS', '', 'array').map((x: string) => {
				return x.replace('ts', 'js').replace('src', 'dist')
		  }),
	cli: {
		// TODO: Clean Up
		entitiesDir: !prod
			? env('TYPEORM_ENTITIES_DIR')
			: env('TYPEORM_ENTITIES_DIR').replace('src', 'dist'),
		migrationsDir: !prod
			? env('TYPEORM_MIGRATIONS_DIR')
			: env('TYPEORM_MIGRATIONS_DIR').replace('src', 'dist'),
		subscribersDir: !prod
			? env('TYPEORM_SUBSCRIBERS_DIR')
			: env('TYPEORM_SUBSCRIBERS_DIR').replace('src', 'dist')
	}
}

export type DbConfig = ConnectionOptions

type ConnectionType =
	| 'mysql'
	| 'mariadb'
	| 'postgres'
	| 'cockroachdb'
	| 'sqlite'
	| 'oracle'
	| 'mssql'
	| 'mongodb'
	| 'sap'
