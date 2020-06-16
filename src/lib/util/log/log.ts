import { LogConfig, Logger } from './'

/*
 * Global Logger Instance
 */
let instance: Logger

/*
 * Initialize logger
 */
function init(config?: LogConfig): void {
	// Instance new instance
	instance = new Logger(config)
}

/*
 * Retrieve Logger
 */
function logger(): Logger {
	// Return global
	return instance
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
	warning: (msg: string, data?: any) => logger().warning(msg, data),
	notice: (msg: string, data?: any) => logger().notice(msg, data),
	info: (msg: string, data?: any) => logger().info(msg, data),
	debug: (msg: string, data?: any) => logger().debug(msg, data)
}
