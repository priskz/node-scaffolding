export const app: AppConfig = {
	env: process.env.NODE_ENV || 'development',
	name: 'New App',
	port: process.env.APP_PORT || '80',
	key: 'SomeSecretSaltValue'
}

export interface AppConfig {
	env: string
	name: string
	port: string
	key: string
}
