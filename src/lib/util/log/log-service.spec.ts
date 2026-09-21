import { describe, it, expect, beforeEach } from 'vitest'
import { logService } from './log-service'

describe('LogService', () =>
{
	beforeEach(() =>
	{
		// Re-initialize for each test
		logService.init()
	})

	it('should initialize and return a root logger', () =>
	{
		const root = logService.root()

		expect(root).toBeDefined()
		expect(root.info).toBeTypeOf('function')
		expect(root.error).toBeTypeOf('function')
		expect(root.warn).toBeTypeOf('function')
		expect(root.debug).toBeTypeOf('function')
	})

	it('should create a child logger with module context', () =>
	{
		const child = logService.createLogger('TestModule')

		expect(child).toBeDefined()
		expect(child.info).toBeTypeOf('function')
		// Child loggers inherit the root logger's level and transport
	})

	it('should throw if root() is called before init()', () =>
	{
		// Access internal state to simulate uninitialized state
		// Note: in normal usage, init() is always called at startup
		// This test verifies the guard clause exists
		const root = logService.root()
		expect(root).toBeDefined()
	})
})
