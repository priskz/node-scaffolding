import winston from 'winston'
import { LogTransportType } from './'

export type LogTransport = {
	type: LogTransportType
	options:
		| winston.transports.ConsoleTransportOptions
		| winston.transports.FileTransportOptions
	disable?: boolean
}
