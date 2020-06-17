import winston, { Logger as WinstonLogger } from 'winston'

export class Logger {
	/*
	 * Log Instance
	 */
	private _log: WinstonLogger

	/*
	 * Constructor
	 */
	constructor(config?: LogConfig) {
		// Init winston
		this._log = Logger._create()

		// No config, fall back to  default console
		if (!config) {
			config = this._defaultConfig()
		}

		// Iterable log keys
		const log: string[] = Object.keys(config)

		// Process log transports
		for (let i = 0; i < log.length; i++) {
			// Enabled?
			if (config[log[i]].enable) {
				// Itearte transports
				for (let x = 0; x < config[log[i]].transports.length; x++) {
					// Add to log
					this._addTransport(config[log[i]].transports[x])
				}
			}
		}
	}

	/*
	 * Error level log
	 */
	public error(msg: string, data?: Data): void {
		this._log.error(this._format(msg, data))
	}

	/*
	 * Emergency level log
	 */
	public emergency(msg: string, data?: Data): void {
		this._log.emerg(this._format(msg, data))
	}

	/*
	 * Alert level log
	 */
	public alert(msg: string, data?: Data): void {
		this._log.alert(this._format(msg, data))
	}

	/*
	 * Critical level log
	 */
	public critical(msg: string, data?: Data): void {
		this._log.crit(this._format(msg, data))
	}

	/*
	 * Warn level log
	 */
	public warn(msg: string, data?: Data): void {
		this._log.warn(this._format(msg, data))
	}

	/*
	 * Notice level log
	 */
	public notice(msg: string, data?: Data): void {
		this._log.notice(this._format(msg, data))
	}

	/*
	 * Info level log
	 */
	public info(msg: string, data?: Data): void {
		this._log.info(this._format(msg, data))
	}

	/*
	 * Debug level log
	 */
	public debug(msg: string, data?: Data): void {
		this._log.debug(this._format(msg, data))
	}

	/*
	 * Add a configured transport to _log
	 */
	private _addTransport(transport: Transport): void {
		// Instanciate based on type
		switch (transport.type) {
			case 'console':
				this._log.add(new winston.transports.Console(transport.options))
				break

			case 'file':
				this._log.add(new winston.transports.File(transport.options))
				break
		}
	}

	/*
	 * Format message
	 */
	private _format(msg: string, data?: Data): string {
		if (typeof data === 'string') return `${msg} => ${data}`
		if (typeof data === 'number') return `${msg} => ${data.toString()}`
		if (typeof data === 'object') return `${msg} => ${JSON.stringify(data)}`

		return msg
	}

	/*
	 * Format message
	 */
	private _defaultConfig(): LogConfig {
		return {
			cli: {
				enable: true,
				transports: [
					{
						type: 'console',
						options: {
							level: 'debug',
							handleExceptions: true
						}
					}
				]
			}
		}
	}

	/*
	 * Create Logger instance
	 */
	private static _create(): WinstonLogger {
		return winston.createLogger({
			levels: {
				emerg: 0,
				alert: 1,
				crit: 2,
				error: 3,
				warn: 4,
				notice: 5,
				info: 6,
				debug: 7
			},
			format: winston.format.combine(
				winston.format.timestamp(),
				winston.format.splat(),
				winston.format.printf(({ timestamp, level, message, meta }) => {
					return `[${timestamp}] <${level}> :: ${message}${
						meta ? ' - ' + JSON.stringify(meta) : ''
					}`
				})
			)
		})
	}
}

type Data = string | number | {} | []

export interface LogConfig {
	[key: string]: {
		enable: boolean
		transports: Transport[]
	}
}

export type TransportTypes = 'console' | 'file' | 'mail'

export type Transport = {
	type: TransportTypes
	options:
		| winston.transports.ConsoleTransportOptions
		| winston.transports.FileTransportOptions
}
