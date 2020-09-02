import { LogTransport } from './'

export interface LoggerConfig {
	enable: boolean
	transports: LogTransport[]
	default?: boolean
	name?: string
}
