import { env } from '~/lib/util'

export const app: AppConfig = {
	env: env.NODE_ENV,
	name: 'New App',
	port: env.APP_PORT,
	key: 'SomeSecretSaltValue'
}

export interface AppConfig {
	env: string
	name: string
	port: string
	key: string
}
