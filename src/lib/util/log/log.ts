import winston, { Logger } from 'winston'

/*
 * Winston formatting
 */
const { splat, combine, timestamp, printf } = winston.format

/*
 * Message formatting
 */
const format = printf(({ timestamp, level, message, meta }) => {
	return `[${timestamp}] <${level}> :: ${message}${
		meta ? ' - ' + JSON.stringify(meta) : ''
	}`
})

/*
 * Logger factory
 */
function loggerFactory(): Logger {
	return winston.createLogger({
		levels: {
			emerg: 0,
			alert: 1,
			crit: 2,
			error: 3,
			warning: 4,
			notice: 5,
			info: 6,
			debug: 7
		},
		format: combine(timestamp(), splat(), format)
	})
}

/*
 * Container for log instances
 */
const container: LogContainer = {}

/*
 * Initialize log
 */
function init(config: LogConfig): void {
	// Extract log keys
	const log: string[] = Object.keys(config)

	// Iterate logs and init
	for (let l = 0; l < log.length; l++) {
		// Log name
		const name = log[l]

		// Individual log config
		const conf = config[name]

		// Enabled?
		if (conf.enable) {
			// Add logger to container
			container[name] = loggerFactory()

			// Itearte transports
			for (let t = 0; t < conf.transports.length; t++) {
				// Individual tranpsort
				const transport = conf.transports[t]

				// Instanciate based on type
				switch (transport.type) {
					case 'console':
						// TODO: When multiple containers is supported use container[name]
						container.default.add(
							new winston.transports.Console(transport.options)
						)
						break

					case 'file':
						// TODO: When multiple containers is supported use container[name]
						container.default.add(
							new winston.transports.File(transport.options)
						)
						break

					default:
						throw 'Unsupported log transport type!'
				}
			}
		}
	}
}

/*
 * Preformat a message
 */
function preformat(msg: string, data?: Data): string {
	if (typeof data === 'string') return `${msg} => ${data}`
	if (typeof data === 'number') return `${msg} => ${data.toString()}`
	if (typeof data === 'object') return `${msg} => ${JSON.stringify(data)}`

	return msg
}

/*
 * Export Util
 */
export const log: Log = {
	container,
	init,
	emerg: (msg, data) => container.default.emerg(preformat(msg, data)),
	alert: (msg, data) => container.default.alert(preformat(msg, data)),
	crit: (msg, data) => container.default.crit(preformat(msg, data)),
	error: (msg, data) => container.default.error(preformat(msg, data)),
	warning: (msg, data) => container.default.warning(preformat(msg, data)),
	notice: (msg, data) => container.default.notice(preformat(msg, data)),
	info: (msg, data) => container.default.info(preformat(msg, data)),
	debug: (msg, data) => container.default.debug(preformat(msg, data))
}

interface Log {
	container: LogContainer
	init(config: LogConfig): void
	emerg(msg: string, data?: Data): void
	alert(msg: string, data?: Data): void
	crit(msg: string, data?: Data): void
	error(msg: string, data?: Data): void
	warning(msg: string, data?: Data): void
	notice(msg: string, data?: Data): void
	info(msg: string, data?: Data): void
	debug(msg: string, data?: Data): void
}

interface LogContainer {
	[key: string]: Logger
}

type Data = string | number | {} | []

export interface LogConfig {
	[key: string]: {
		enable: boolean
		transports: TransportTypeConfig[]
	}
}

export type Logs = 'app' | 'cli'

export type LogTransportTypes = 'console' | 'file'

export type TransportTypeConfig = {
	type: LogTransportTypes
	options:
		| winston.transports.ConsoleTransportOptions
		| winston.transports.FileTransportOptions
}
