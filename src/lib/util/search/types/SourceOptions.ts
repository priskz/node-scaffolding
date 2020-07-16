export interface SourceOptions {
	node?: string // | nodes See Documentation
	maxRetries?: number
	requestTimeout?: number
	pingTimeout?: number
	sniffInterval?: number | false
	sniffOnStart?: boolean
	sniffEndpoint?: string
	sniffOnConnectionFault?: boolean
	resurrectStrategy?: 'ping' | 'optimistic' | 'none'
	suggestCompression?: boolean
	compression?: 'gzip' | undefined
	name?: string
	opaqueIdPrefix?: string | undefined
	headers?: {}
	cloud?: {
		id: string
		username?: string | undefined
		password?: string | undefined
	}
	// auth?: BasicAuth | ApiKeyAuth | undefined
	// nodeFilter?: Function
	// nodeSelector?: Function
	// generateRequestId?: Function
	// ssl?: null | http.SecureContextOptions
	// agent?: Function | null | http.AgentOptions
}
