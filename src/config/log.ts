import { LogConfig as BaseLogConfig, LoggerConfig } from '~/lib/util'

export const log: LogConfig = {
	app: {
		enable: true,
		default: true,
		transports: [
			{
				type: 'file',
				options: {
					level: 'info',
					filename: `./log/app.${process.env.NODE_ENV}.log`,
					handleExceptions: true,
					maxsize: 5242880, // 5MB
					maxFiles: 5
				}
			},
			{
				type: 'console',
				disable: true,
				options: {
					level: 'debug',
					handleExceptions: true
				}
			}
		]
	},
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

export interface LogConfig extends BaseLogConfig {
	app: LoggerConfig
	cli: LoggerConfig
}
