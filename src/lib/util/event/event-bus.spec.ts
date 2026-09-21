import { describe, it, expect, vi, beforeEach } from 'vitest'
import { eventBus } from './event-bus'
import type { DomainEvent } from './types'

describe('EventBus', () =>
{
	beforeEach(() =>
	{
		eventBus.clear()
	})

	it('should publish and receive an event', () =>
	{
		const handler = vi.fn()
		eventBus.on('user.created', handler)

		const event: DomainEvent = { type: 'user.created', payload: { name: 'Zakk' } }
		eventBus.publish(event)

		expect(handler).toHaveBeenCalledWith(event)
	})

	it('should support wildcard listeners', () =>
	{
		const handler = vi.fn()
		eventBus.on('user.*', handler)

		eventBus.publish({ type: 'user.created' })
		eventBus.publish({ type: 'user.updated' })

		expect(handler).toHaveBeenCalledTimes(2)
	})

	it('should support once listeners', () =>
	{
		const handler = vi.fn()
		eventBus.once('order.placed', handler)

		eventBus.publish({ type: 'order.placed' })
		eventBus.publish({ type: 'order.placed' })

		expect(handler).toHaveBeenCalledTimes(1)
	})

	it('should remove a specific handler with off', () =>
	{
		const handler = vi.fn()
		eventBus.on('item.deleted', handler)
		eventBus.off('item.deleted', handler)

		eventBus.publish({ type: 'item.deleted' })

		expect(handler).not.toHaveBeenCalled()
	})

	it('should clear all listeners', () =>
	{
		const handler = vi.fn()
		eventBus.on('anything', handler)
		eventBus.clear()

		eventBus.publish({ type: 'anything' })

		expect(handler).not.toHaveBeenCalled()
	})
})
