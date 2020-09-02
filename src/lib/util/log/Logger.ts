import winston, { Logger as WinstonLogger } from 'winston'
import { LoggerConfig, LogData, LogTransport } from './types'

export class Logger {
	/*
	 * Log Instance
	 */
	private log: WinstonLogger

	/*
	 * Logger Name
	 */
	private name: string = 'anonymous'

	/*
	 * Log Enabled
	 */
	private enable: boolean = false

	/*
	 * Constructor
	 */
	constructor(config?: LoggerConfig) {
		// Init winston
		this.log = this.create()

		// Config given?
		if (!config) {
			// Set config with default values
			config = {
				name: 'default',
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

		// Set enable prop
		this.enable = config.enable

		// Set name if given
		if (config.name) this.name = config.name

		// Process log transports
		for (let i = 0; i < config.transports.length; i++) {
			// Itearte transports
			for (let x = 0; x < config.transports.length; x++) {
				// Add to log
				this.addTransport(config.transports[x])
			}
		}
	}

	/*
	 * Error level log
	 */
	public error(msg: string, data?: LogData): void {
		if (this.enable) this.log.error(this._format(msg, data))
	}

	/*
	 * Emergency level log
	 */
	public emergency(msg: string, data?: LogData): void {
		if (this.enable) this.log.emerg(this._format(msg, data))
	}

	/*
	 * Alert level log
	 */
	public alert(msg: string, data?: LogData): void {
		if (this.enable) this.log.alert(this._format(msg, data))
	}

	/*
	 * Critical level log
	 */
	public critical(msg: string, data?: LogData): void {
		if (this.enable) this.log.crit(this._format(msg, data))
	}

	/*
	 * Warn level log
	 */
	public warn(msg: string, data?: LogData): void {
		if (this.enable) this.log.warn(this._format(msg, data))
	}

	/*
	 * Notice level log
	 */
	public notice(msg: string, data?: LogData): void {
		if (this.enable) this.log.notice(this._format(msg, data))
	}

	/*
	 * Info level log
	 */
	public info(msg: string, data?: LogData): void {
		if (this.enable) this.log.info(this._format(msg, data))
	}

	/*
	 * Debug level log
	 */
	public debug(msg: string, data?: LogData): void {
		if (this.enable) this.log.debug(this._format(msg, data))
	}

	/*
	 * Add a configured transport to log
	 */
	private addTransport(transport: LogTransport): void {
		// Don't add if disabled
		if (transport.disable) return

		// Instanciate based on type
		switch (transport.type) {
			case 'console':
				this.log.add(new winston.transports.Console(transport.options))
				break

			case 'file':
				this.log.add(new winston.transports.File(transport.options))
				break
		}
	}

	/*
	 * Format message
	 */
	private _format(msg: string, data?: LogData): string {
		if (typeof data === 'string') return `${msg} => ${data}`
		if (typeof data === 'number') return `${msg} => ${data.toString()}`
		if (typeof data === 'object') return `${msg} => ${JSON.stringify(data)}`

		return msg
	}

	/*
	 * Create Logger instance
	 */
	private create(): WinstonLogger {
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
					return `[${timestamp}] <${level}> :: ${this.name} :: ${message}${
						meta ? ' - ' + JSON.stringify(meta) : ''
					}`
				})
			)
		})
	}
}
