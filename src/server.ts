/* istanbul ignore file */
import './env'
import { Server, createServer } from 'http'
import { env, log, socket } from '~/lib/util'
import { config } from '~/config'
import { app } from '~/app'

// Init
let httpServer: Server
let shuttingDown = false

async function start(): Promise<void>
{
	// Create app instance
	await app.run()

	// Create server instance
	httpServer = createServer(app.instance)

	// Initialize socket.io when enabled
	if(config.socket.enabled)
	{
		socket.init(httpServer, {
			path: config.socket.path,
			cors: { origin: config.socket.corsOrigin },
		})
	}

	// Listen on configured port
	httpServer.listen(env.APP_PORT, () =>
		log.info({ port: env.APP_PORT }, 'Server listening')
	)
}

async function stop(): Promise<void>
{
	// Already shutting down?
	if(shuttingDown) return
	shuttingDown = true

	log.info('Graceful shutdown initiated...')

	// Close HTTP server — stop accepting new connections
	httpServer.close(() =>
	{
		log.info('HTTP server closed')
	})

	// Shut app down — disconnect DB, cache, schedule
	try
	{
		await app.shutdown()
		log.info('All services disconnected')
	}
	catch(e: unknown)
	{
		const message = e instanceof Error ? e.message : String(e)
		log.error({ error: message }, 'Shutdown error')
	}

	// Exit
	process.exit(0)
}

// Graceful shutdown signals
process.on('SIGTERM', stop)
process.on('SIGINT', stop)

start()
