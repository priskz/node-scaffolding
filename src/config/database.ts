import { env } from '~/lib/util'

/*
 * Database configuration
 *
 * Prisma reads DATABASE_URL from the environment directly via prisma.config.ts.
 * This config file exists for application-level database settings only.
 */

export interface DbConfig {
	url: string
}

export const db: DbConfig = {
	url: env.DATABASE_URL
}
