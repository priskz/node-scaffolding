import { describe, it, expect } from 'vitest'
import { UserRepository } from './UserRepository'
import { PrismaRepository } from '~/lib/domain'

describe('app/domain/user/UserRepository', () =>
{
	it('should extend PrismaRepository', () =>
	{
		const repo = new UserRepository()
		expect(repo).toBeInstanceOf(PrismaRepository)
	})

	it('should target the user model', () =>
	{
		const repo = new UserRepository()
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		expect((repo as any).modelName).toBe('user')
	})

	it('should enable soft deletes', () =>
	{
		const repo = new UserRepository()
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		expect((repo as any).softDeletes).toBe(true)
	})
})
