import './env'
import { Server, createServer } from 'http'
import { env } from '~/lib/util'
import { app } from '~/app'

/*
 * Http Server
 */
let httpServer: Server

/*
 * Start Server
 */
async function start(): Promise<void> {
	// Create app instance
	await app.run()

	// Create server instance
	httpServer = createServer(app.instance)

	// Listen on configured port
	httpServer.listen(env('APP_PORT'))
}

/*
 * Stop Server
 */
async function stop(): Promise<void> {
	// Stop listen
	httpServer.close()

	// Shut app down
	await app.shutdown()
}

export const server = { start, stop }
