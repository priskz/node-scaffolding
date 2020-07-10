import { ConnectionOptions } from 'typeorm'

const production = process.env.NODE_ENV === 'production'

const {
	TYPEORM_CONNECTION,
	TYPEORM_HOST,
	TYPEORM_PORT,
	TYPEORM_USERNAME,
	TYPEORM_PASSWORD,
	TYPEORM_DATABASE,
	TYPEORM_SYNCHRONIZE,
	TYPEORM_LOGGING,
	TYPEORM_ENTITIES,
	TYPEORM_MIGRATIONS,
	TYPEORM_SUBSCRIBERS,
	TYPEORM_ENTITIES_DIR,
	TYPEORM_MIGRATIONS_DIR,
	TYPEORM_SUBSCRIBERS_DIR
} = process.env

if (
	!TYPEORM_CONNECTION ||
	!TYPEORM_HOST ||
	!TYPEORM_PORT ||
	!TYPEORM_USERNAME ||
	!TYPEORM_PASSWORD ||
	!TYPEORM_DATABASE ||
	!TYPEORM_SYNCHRONIZE ||
	!TYPEORM_LOGGING ||
	!TYPEORM_ENTITIES ||
	!TYPEORM_MIGRATIONS ||
	!TYPEORM_SUBSCRIBERS ||
	!TYPEORM_ENTITIES_DIR ||
	!TYPEORM_MIGRATIONS_DIR ||
	!TYPEORM_SUBSCRIBERS_DIR
) {
	throw new Error('Database misconfiguration')
}

/**
 * Replaces development file paths with production file paths if in production mode
 */
function getEnvPath(path: string): string {
	return !production
		? path
		: path.replace('.ts', '.js').replace('src/', 'dist/')
}

export const db: DbConfig = {
	type: TYPEORM_CONNECTION as ConnectionType,
	host: TYPEORM_HOST,
	port: parseInt(TYPEORM_PORT),
	username: TYPEORM_USERNAME,
	password: TYPEORM_PASSWORD,
	database: TYPEORM_DATABASE,
	synchronize: TYPEORM_SYNCHRONIZE === 'true',
	logging: TYPEORM_LOGGING === 'true',
	entities: [getEnvPath(TYPEORM_ENTITIES)],
	migrations: [getEnvPath(TYPEORM_MIGRATIONS)],
	subscribers: [getEnvPath(TYPEORM_SUBSCRIBERS)],
	cli: {
		entitiesDir: getEnvPath(TYPEORM_ENTITIES_DIR),
		migrationsDir: getEnvPath(TYPEORM_MIGRATIONS_DIR),
		subscribersDir: getEnvPath(TYPEORM_SUBSCRIBERS_DIR)
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
