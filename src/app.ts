import cookieParser from 'cookie-parser'
import compression from 'compression'
import cors from 'cors'
import express, { Express } from 'express'
import helmet from 'helmet'
import { config } from '~/config'
import { global, exception, rateLimiter, requestLogger, passportInit } from '~/app/middleware'
import { router } from '~/app/routes'
import { bullBoard, cache, database, env, event, job, log, mail, oauth, socket, versioning, webhook } from '~/lib/util'

/*
 * Instantiate App Framework
 */
const instance: Express = express()

/*
 * Run Application
 */
async function run(): Promise<Express>
{
	// Init logging
	log.init()

	// Connect database
	await database.connect()

	// Connect cache
	await cache.connect(config.cache)

	// Init job service
	if(config.job.enabled)
	{
		job.init({ host: env.CACHE_HOST, port: env.CACHE_PORT })

		// Register job definitions
		for(const definition of config.job.jobs)
		{
			job.define(definition)
		}

		// Start all jobs
		await job.start()
	}

	// Request logging + requestId context
	instance.use(requestLogger)

	// Security headers
	instance.use(helmet())

	// CORS
	instance.use(cors({
		origin: env.CORS_ORIGIN === '*'
			? '*'
			: env.CORS_ORIGIN.split(',').map(s => s.trim()),
		credentials: true
	}))

	// Add gzip compression
	instance.use(compression())

	// Parse incoming requests
	instance.use(express.json())

	// Parse cookies attached to requests
	instance.use(cookieParser(env.COOKIE_SECRET))

	// Passport OAuth
	instance.use(passportInit)

	// Register OAuth strategies
	if(config.oauth.google.enabled)
	{
		oauth.registerGoogle(config.oauth.google)
	}

	if(config.oauth.github.enabled)
	{
		oauth.registerGitHub(config.oauth.github)
	}

	// Rate limiting
	instance.use(rateLimiter)

	// Global app middleware
	instance.use(global)

	// Register API versions
	versioning.register({ version: config.api.version, router })
	versioning.setCurrent(config.api.version)

	// Mount versioned routes
	versioning.mount(instance, config.api.prefix)

	// Bull Board dashboard
	if(config.job.enabled && config.job.boardEnabled)
	{
		const adapter = bullBoard.createAdapter(job.getQueues(), config.job.boardPath)
		instance.use(config.job.boardPath, adapter.getRouter())
	}

	// Add exception handler (should be last use)
	instance.use(exception)

	// Init webhook dispatcher
	if(config.webhook.enabled)
	{
		webhook.init({
			host: env.CACHE_HOST,
			port: env.CACHE_PORT,
			maxRetries: config.webhook.maxRetries,
			retryDelay: config.webhook.retryDelay,
		})
		webhook.dispatcher.init({
			maxRetries: config.webhook.maxRetries,
			retryDelay: config.webhook.retryDelay,
		})
	}

	// Return Express
	return instance
}

/*
 * Shutdown Application
 */
async function shutdown(): Promise<void>
{
	webhook.dispatcher.close()
	await webhook.close()
	await job.close()
	await socket.close()
	event.close()
	await database.disconnect()
	await cache.disconnect()
	mail.close()
}

// Export App
export const app = { instance, run, shutdown }
