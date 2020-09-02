import { Logger, LogConfig } from './'

/*
 * Global Logger Instance
 */
let instance: { [key: string]: Logger }

/*
 * Global Logger Instance
 */
let defaultAlias: string = 'default'

/*
 * Initialize logger
 */
function init(config?: LogConfig): void {
	// Config goven?
	if (!config) {
		// Init default logger
		instance[defaultAlias] = new Logger()

		// Return
		return
	}

	// Init
	instance = {}

	// Grab keys
	const key = Object.keys(config)

	// Set first element to default
	defaultAlias = config[key[0]].name ? (config[key[0]].name as string) : key[0]

	// Iterate and instanciate logs
	for (let i = 0; i < key.length; i++) {
		// Check if specified as default
		if (config[key[i]].default) {
			defaultAlias = config[key[i]].name
				? (config[key[i]].name as string)
				: key[i]
		}

		// Init logger instance with configuration
		instance[key[i]] = new Logger({
			name: key[i],
			...config[key[i]]
		})
	}
}

/*
 * Retrieve Logger
 */
export const logger = (logName?: string) => {
	// Return specified logger or default
	return instance[logName ? logName : defaultAlias]
}

/*
 * Export Util
 */
export const log = {
	init,
	logger,
	emergency: (msg: string, data?: any) => logger().emergency(msg, data),
	alert: (msg: string, data?: any) => logger().alert(msg, data),
	critical: (msg: string, data?: any) => logger().critical(msg, data),
	error: (msg: string, data?: any) => logger().error(msg, data),
	warn: (msg: string, data?: any) => logger().warn(msg, data),
	notice: (msg: string, data?: any) => logger().notice(msg, data),
	info: (msg: string, data?: any) => logger().info(msg, data),
	debug: (msg: string, data?: any) => logger().debug(msg, data)
}
