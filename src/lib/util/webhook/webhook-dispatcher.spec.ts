import { describe, it, expect, vi, beforeEach } from 'vitest'

/*
 * Hoisted mocks — available inside vi.mock factories
 */
const { mockWebhookFindMany, mockDeliveryCreate, mockEnqueue } = vi.hoisted(() => ({
	mockWebhookFindMany: vi.fn(),
	mockDeliveryCreate: vi.fn(),
	mockEnqueue: vi.fn(),
}))

vi.mock('~/lib/util/database', () => ({
	database: {
		client: () => ({
			webhook: {
				findMany: mockWebhookFindMany,
			},
			webhookDelivery: {
				create: mockDeliveryCreate,
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

/*
 * Mock event — capture the wildcard handler
 */
let capturedHandler: ((event: unknown) => void) | undefined

vi.mock('~/lib/util/event', () => ({
	event: {
		on: vi.fn((pattern: string, handler: (event: unknown) => void) =>
		{
			if(pattern === '**')
			{
				capturedHandler = handler
			}
		}),
	},
}))

vi.mock('./webhook-queue', () => ({
	webhookQueue: {
		enqueue: mockEnqueue,
	},
}))

import { webhookDispatcher } from './webhook-dispatcher'

describe('lib/util/webhook/webhook-dispatcher', () =>
{
	beforeEach(() =>
	{
		vi.clearAllMocks()
		capturedHandler = undefined
	})

	it('should subscribe to all events on init', () =>
	{
		// Action
		webhookDispatcher.init({ maxRetries: 3, retryDelay: 1000 })

		// Assert
		expect(capturedHandler).toBeDefined()
	})

	it('should find matching webhooks and enqueue deliveries', async () =>
	{
		// Init
		webhookDispatcher.init({ maxRetries: 3, retryDelay: 1000 })

		const webhooks = [
			{ id: 'wh-1', url: 'https://example.com/hook', secret: 'secret-1', events: ['user.created'], tenantId: null, active: true },
		]
		mockWebhookFindMany.mockResolvedValue(webhooks)
		mockDeliveryCreate.mockResolvedValue({ id: 'del-1', webhookId: 'wh-1', eventType: 'user.created', status: 'pending' })

		// Action
		await capturedHandler!({
			id: 'evt-1',
			type: 'user.created',
			payload: { name: 'Alice' },
		})

		// Assert
		expect(mockWebhookFindMany).toHaveBeenCalledWith(expect.objectContaining({
			where: expect.objectContaining({
				active: true,
				events: { has: 'user.created' },
			}),
		}))
		expect(mockDeliveryCreate).toHaveBeenCalledWith({
			data: expect.objectContaining({
				webhookId: 'wh-1',
				eventType: 'user.created',
			}),
		})
		expect(mockEnqueue).toHaveBeenCalledWith(
			expect.objectContaining({
				webhookId: 'wh-1',
				deliveryId: 'del-1',
				url: 'https://example.com/hook',
				secret: 'secret-1',
				eventType: 'user.created',
				payload: { name: 'Alice' },
			}),
			{ maxRetries: 3, retryDelay: 1000 },
		)
	})

	it('should skip when no matching webhooks exist', async () =>
	{
		// Init
		webhookDispatcher.init({ maxRetries: 3, retryDelay: 1000 })
		mockWebhookFindMany.mockResolvedValue([])

		// Action
		await capturedHandler!({ type: 'unknown.event', payload: {} })

		// Assert
		expect(mockDeliveryCreate).not.toHaveBeenCalled()
		expect(mockEnqueue).not.toHaveBeenCalled()
	})

	it('should enqueue for multiple matching webhooks', async () =>
	{
		// Init
		webhookDispatcher.init({ maxRetries: 5, retryDelay: 2000 })

		const webhooks = [
			{ id: 'wh-1', url: 'https://a.com/hook', secret: 's1', events: ['order.placed'], tenantId: null, active: true },
			{ id: 'wh-2', url: 'https://b.com/hook', secret: 's2', events: ['order.placed'], tenantId: null, active: true },
		]
		mockWebhookFindMany.mockResolvedValue(webhooks)
		mockDeliveryCreate
			.mockResolvedValueOnce({ id: 'del-1', webhookId: 'wh-1', eventType: 'order.placed', status: 'pending' })
			.mockResolvedValueOnce({ id: 'del-2', webhookId: 'wh-2', eventType: 'order.placed', status: 'pending' })

		// Action
		await capturedHandler!({ type: 'order.placed', payload: { orderId: '42' } })

		// Assert
		expect(mockDeliveryCreate).toHaveBeenCalledTimes(2)
		expect(mockEnqueue).toHaveBeenCalledTimes(2)
	})
})
