import { describe, it, expect, vi, beforeEach } from 'vitest'

const { SearchClientCtor } = vi.hoisted(() => ({
	SearchClientCtor: vi.fn(),
}))

vi.mock('./SearchClient', () => ({
	SearchClient: SearchClientCtor,
}))

import { search } from './search'

describe('lib/util/search/search — facade', () =>
{
	beforeEach(() =>
	{
		vi.clearAllMocks()
		// search.ts module keeps module-level `instance` — each test file is its
		// own module graph so re-importing elsewhere would reset, but within this
		// file we need to track the "already initialized" path explicitly.
	})

	it('init() should create the global SearchClient once and return true', async () =>
	{
		const ok = await search.init()
		expect(ok).toBe(true)
		expect(SearchClientCtor).toHaveBeenCalledWith('global-index', {})
	})

	it('client() should return the initialized instance', () =>
	{
		expect(search.client()).toBeDefined()
	})

	it('init() should refuse re-initialization', async () =>
	{
		const ok = await search.init()
		expect(ok).toBe(false)
	})
})
