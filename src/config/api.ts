export const api: ApiConfig = {
	version: 'v1',
	prefix: '/api/'
}

export interface ApiConfig {
	version: string
	prefix: string
}
