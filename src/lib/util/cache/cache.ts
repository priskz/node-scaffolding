import { Client, ClientOptions } from './'

/*
 * Global Client Instance
 */
let instance: Client

/*
 * Connect Client
 */
async function connect(options: ClientOptions = {}): Promise<boolean> {
	// Ensure previous client is disconnected
	if (instance) {
		await instance.disconnect()
	}

	// Create new client
	instance = new Client(options)

	// Return connected
	return await instance.connected()
}

/*
 * Disconnect Client
 */
async function disconnect(): Promise<boolean> {
	// Connected?
	if (await instance.connected()) {
		return await instance.disconnect()
	}

	// Already disconnected
	return false
}

/*
 * Retrieve Client
 */
function client(): Client {
	return instance
}

/*
 * Export Util
 */
export const cache = {
	client,
	connect,
	disconnect
}
