import { describe, it, expect } from 'vitest'
import { env } from './env'

describe('lib/util/env', () =>
{
	describe('validated env object', () =>
	{
		it('should export a typed env object', () =>
		{
			// Assert
			expect(env).toBeDefined()
			expect(typeof env).toBe('object')
		})

		it('should have NODE_ENV defaulted', () =>
		{
			// Assert — vitest sets NODE_ENV to 'test' or it defaults
			expect(env.NODE_ENV).toBeDefined()
			expect(['development', 'production', 'test']).toContain(env.NODE_ENV)
		})

		it('should have APP_PORT with a default', () =>
		{
			// Assert
			expect(env.APP_PORT).toBeDefined()
			expect(typeof env.APP_PORT).toBe('string')
		})
	})
})
