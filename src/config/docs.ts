import { SwaggerOptions } from 'swagger-ui-express'
import { SwaggerDocumentation } from '~/docs'

export const docs: DocsConfig = {
	swagger: '2.0',
	info: {
		title: 'New App',
		description: 'API Backend',
		version: '0.0.1'
	},
	basePath: '/api/v1',
	schemes: ['https'],
	produces: ['application/json'],
	...SwaggerDocumentation
}

export interface DocsConfig extends SwaggerOptions {
	swagger: string
	info: SwaggerInfo
	basePath: string
	schemes: Schemes[]
	produces: string[]
	components: {}
	paths: {}
}

type Schemes = 'https' | 'http'

interface SwaggerInfo {
	title: string
	description: string
	version: string
}
