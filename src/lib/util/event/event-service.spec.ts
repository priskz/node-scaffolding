import { describe, it, expect, vi, beforeEach } from 'vitest'

/*
 * Mock database — Prisma client with event model
 */
const mockCreate = vi.fn()
const mockFindMany = vi.fn()

vi.mock('~/lib/util/database', () => ({
	database: {
		client: () => ({
			event: {
				create: mockCreate,
				findMany: mockFindMany,
			},
		}),
	},
}))

vi.mock('~/lib/util/log', () =>
{
	const child = vi.fn(() => ({
		debug: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn(),
	}))

	return { log: { child } }
})

import { eventService } from './event-service'
import { eventBus } from './event-bus'

describe('EventService', () =>
{
	beforeEach(() =>
	{
		vi.clearAllMocks()
		eventBus.clear()
	})

	it('should persist an event and publish on the bus', async () =>
	{
		const persisted = {
			id: 'evt-1',
			type: 'user.created',
			tenantId: 'tenant-1',
			actorId: 'actor-1',
			payload: { name: 'Zakk' },
			timestamp: new Date('2026-04-02'),
		}
		mockCreate.mockResolvedValue(persisted)

		const handler = vi.fn()
		eventService.on('user.created', handler)

		const result = await eventService.emit({
			type: 'user.created',
			tenantId: 'tenant-1',
			actorId: 'actor-1',
			payload: { name: 'Zakk' },
		})

		expect(result.id).toBe('evt-1')
		expect(result.type).toBe('user.created')
		expect(mockCreate).toHaveBeenCalledOnce()
		expect(handler).toHaveBeenCalledWith(expect.objectContaining({ type: 'user.created', id: 'evt-1' }))
	})

	it('should persist an event with no optional fields', async () =>
	{
		const persisted = {
			id: 'evt-2',
			type: 'system.started',
			tenantId: null,
			actorId: null,
			payload: null,
			timestamp: new Date(),
		}
		mockCreate.mockResolvedValue(persisted)

		const result = await eventService.emit({ type: 'system.started' })

		expect(result.id).toBe('evt-2')
		expect(result.tenantId).toBeUndefined()
		expect(result.actorId).toBeUndefined()
	})

	it('should query events with filters', async () =>
	{
		const events = [
			{ id: 'e1', type: 'user.created', tenantId: 't1', actorId: null, payload: null, timestamp: new Date() },
			{ id: 'e2', type: 'user.created', tenantId: 't1', actorId: null, payload: null, timestamp: new Date() },
		]
		mockFindMany.mockResolvedValue(events)

		const result = await eventService.query({ type: 'user.created', tenantId: 't1' })

		expect(result).toHaveLength(2)
		expect(mockFindMany).toHaveBeenCalledWith({
			where: { type: 'user.created', tenantId: 't1' },
			orderBy: { timestamp: 'desc' },
			take: 100,
		})
	})

	it('should query events with date range', async () =>
	{
		mockFindMany.mockResolvedValue([])

		const since = new Date('2026-01-01')
		const until = new Date('2026-04-01')
		await eventService.query({ since, until, limit: 50 })

		expect(mockFindMany).toHaveBeenCalledWith({
			where: { timestamp: { gte: since, lte: until } },
			orderBy: { timestamp: 'desc' },
			take: 50,
		})
	})

	it('should clear the event bus on close', () =>
	{
		const handler = vi.fn()
		eventService.on('test', handler)
		eventService.close()

		eventBus.publish({ type: 'test' })

		expect(handler).not.toHaveBeenCalled()
	})
})
