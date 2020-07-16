import { SearchClient, SourceOptions } from './'

/**
 * Global Client Instance
 */
let instance: SearchClient

/**
 * Init Client
 */
async function init(options: SourceOptions = {}): Promise<boolean> {
	// Ensure previous client is disconnected
	if (instance) {
		return false
	}

	// Create new client
	instance = new SearchClient('global-index', options)

	// Success
	return true
}

/**
 * Retrieve Client
 */
function client(): SearchClient {
	return instance
}

// Export Util
export const search = {
	client,
	init
}
