import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
	resolve: {
		alias: {
			'~': path.resolve(__dirname, 'src')
		}
	},
	test: {
		globals: true,
		environment: 'node',
		include: ['src/**/*.spec.ts'],
		env: {
			NODE_ENV: 'test',
			APP_PORT: '3001',
			COOKIE_SECRET: 'test-cookie-secret',
			DATABASE_URL: 'postgresql://localhost:5432/test',
			LOG_LEVEL: 'error',
			LOG_CONSOLE_PRETTY: 'false',
		},
		coverage: {
			provider: 'v8',
			reporter: ['text', 'text-summary', 'html'],
			include: ['src/**/*.ts'],
			exclude: ['src/**/*.spec.ts', 'src/test/**', 'src/generated/**']
		}
	}
})
