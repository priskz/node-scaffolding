import { describe, it, expect } from 'vitest'
import { SessionRepository } from './SessionRepository'
import { PrismaRepository } from '~/lib/domain'

describe('app/domain/session/SessionRepository', () =>
{
	it('should extend PrismaRepository', () =>
	{
		const repo = new SessionRepository()
		expect(repo).toBeInstanceOf(PrismaRepository)
	})

	it('should target the session model', () =>
	{
		const repo = new SessionRepository()
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		expect((repo as any).modelName).toBe('session')
	})

	it('should enable soft deletes', () =>
	{
		const repo = new SessionRepository()
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		expect((repo as any).softDeletes).toBe(true)
	})
})
