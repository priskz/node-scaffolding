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
		coverage: {
			provider: 'v8',
			reporter: ['text', 'text-summary', 'html'],
			include: ['src/**/*.ts'],
			exclude: ['src/**/*.spec.ts', 'src/test/**', 'src/generated/**']
		}
	}
})
