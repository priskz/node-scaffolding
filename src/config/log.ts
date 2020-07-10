import { LogConfig as BaseLogConfig, Transport } from '~/lib/util'

export const log: LogConfig = {
	default: {
		enable: true,
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
	default: {
		enable: boolean
		transports: Transport[]
	}
	cli: {
		enable: boolean
		transports: Transport[]
	}
}
