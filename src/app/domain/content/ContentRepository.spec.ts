import { describe, it, expect } from 'vitest'
import { ContentRepository } from './ContentRepository'
import { PrismaRepository } from '~/lib/domain'

describe('app/domain/content/ContentRepository', () =>
{
	it('should extend PrismaRepository', () =>
	{
		const repo = new ContentRepository()
		expect(repo).toBeInstanceOf(PrismaRepository)
	})

	it('should target the content model', () =>
	{
		const repo = new ContentRepository()
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		expect((repo as any).modelName).toBe('content')
	})

	it('should enable soft deletes', () =>
	{
		const repo = new ContentRepository()
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		expect((repo as any).softDeletes).toBe(true)
	})

	it('should eager load category, image, and tags', () =>
	{
		const repo = new ContentRepository()
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		expect((repo as any).eager).toEqual(['category', 'image', 'tags'])
	})
})
