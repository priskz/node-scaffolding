/* istanbul ignore file */
import './env'
import { Server, createServer } from 'http'
import { env, log } from '~/lib/util'
import { app } from '~/app'

// Init
let httpServer: Server

async function start() {
	// Create app instance
	await app.run()

	// Create server instance
	httpServer = createServer(app.instance)

	// Listen on configured port
	httpServer.listen(env('APP_PORT'), () =>
		log.info(`---> Server listening on port ${env('APP_PORT')} <---`)
	)
}

async function stop() {
	// Stop listen
	httpServer.close()

	// Shut app down
	await app.shutdown()
}

start()
