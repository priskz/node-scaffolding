import { createConnection, Connection, ConnectionOptions } from 'typeorm'

/*
 * Global Connection Instance
 */
let instance: Connection

/*
 * Connect Database
 */
async function connect(options: ConnectionOptions): Promise<boolean> {
	// Ensure previous connection is disconnected
	if (instance) {
		await disconnect()
	}

	// Create new connection
	instance = await createConnection(options)

	// Return connected
	return instance.isConnected
}

/*
 * Disconnect Database
 */
async function disconnect(): Promise<boolean> {
	// Need a connection to disconnect
	if (instance.isConnected) {
		// Attempt disconnect
		await instance.close()

		// Return true
		return true
	}

	// Can't disconnect non-existant connection
	return false
}

/*
 * Retrieve Connection
 */
function connection(): Connection {
	return instance
}

/*
 * Export Util
 */
export const database = {
	connection,
	connect,
	disconnect
}
