import 'reflect-metadata'
import bodyParser from 'body-parser'
import compression from 'compression'
import express, { Express } from 'express'
import { config } from '~/config'
import { exception } from '~/app/middleware'
import { router } from '~/app/routes'
import { cache, database, env, log } from '~/lib/util'

/*
 * Initialize Logging
 */
log.init(config.log)

/*
 * Instantiate App Framework
 */
const instance: Express = express()

/*
 * Run Application
 */
async function run(): Promise<Express> {
	// Connect database
	await database.connect(config.db)

	// Connect cache
	await cache.connect(config.cache.driver)

	// Add gzip compression
	instance.use(compression())

	// Parse incoming requests
	instance.use(bodyParser.json())

	// Configure route handlers
	instance.use(`${config.api.prefix}${config.api.version}`, router)

	// Add exception handler should be last use)
	instance.use(exception)

	// Return Express
	return instance
}

/*
 * Shutdown Application
 */
async function shutdown() {
	await database.disconnect()
	await cache.disconnect()
}

// Export App
export const app = { instance, run, shutdown }
