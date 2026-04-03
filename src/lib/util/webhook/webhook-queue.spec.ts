import { describe, it, expect, vi, beforeEach } from 'vitest'

/*
 * Mock BullMQ — Queue and Worker
 */
const mockAdd = vi.fn()
const mockQueueClose = vi.fn()
const mockWorkerClose = vi.fn()
const mockWorkerOn = vi.fn()

function MockQueue(this: unknown): void
{
	(this as Record<string, unknown>).add = mockAdd;
	(this as Record<string, unknown>).close = mockQueueClose
}

function MockWorker(this: unknown): void
{
	(this as Record<string, unknown>).on = mockWorkerOn;
	(this as Record<string, unknown>).close = mockWorkerClose
}

vi.mock('bullmq', () => ({
	Queue: MockQueue,
	Worker: MockWorker,
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

vi.mock('~/lib/util/database', () => ({
	database: {
		client: () => ({}),
	},
}))

import { webhookQueue } from './webhook-queue'

describe('lib/util/webhook/webhook-queue', () =>
{
	beforeEach(() =>
	{
		vi.clearAllMocks()
		// Reset module state — close any existing queue
		webhookQueue.close()
	})

	describe('init', () =>
	{
		it('should initialize without error', () =>
		{
			// Action + Assert — no throw
			expect(() =>
			{
				webhookQueue.init({ host: 'localhost', port: 6379, maxRetries: 3, retryDelay: 1000 })
			}).not.toThrow()
		})

		it('should register worker event handlers', () =>
		{
			// Action
			webhookQueue.init({ host: 'localhost', port: 6379, maxRetries: 3, retryDelay: 1000 })

			// Assert — worker.on called for completed and failed
			expect(mockWorkerOn).toHaveBeenCalledWith('completed', expect.any(Function))
			expect(mockWorkerOn).toHaveBeenCalledWith('failed', expect.any(Function))
		})
	})

	describe('enqueue', () =>
	{
		it('should add a job to the queue with retry config', async () =>
		{
			// Init
			webhookQueue.init({ host: 'localhost', port: 6379, maxRetries: 3, retryDelay: 1000 })

			const job = {
				webhookId: 'wh-1',
				deliveryId: 'del-1',
				url: 'https://example.com/hook',
				secret: 'secret',
				eventType: 'user.created',
				payload: { id: '1' },
			}

			// Action
			await webhookQueue.enqueue(job, { maxRetries: 5, retryDelay: 2000 })

			// Assert
			expect(mockAdd).toHaveBeenCalledWith('deliver', job, {
				attempts: 5,
				backoff: { type: 'exponential', delay: 2000 },
			})
		})

		it('should throw when queue is not initialized', async () =>
		{
			// Action + Assert
			await expect(webhookQueue.enqueue(
				{ webhookId: 'wh-1', deliveryId: 'del-1', url: 'https://example.com', secret: 's', eventType: 'test', payload: {} },
				{ maxRetries: 3, retryDelay: 1000 },
			)).rejects.toThrow('WebhookQueue not initialized')
		})
	})

	describe('close', () =>
	{
		it('should close worker and queue', async () =>
		{
			// Init
			webhookQueue.init({ host: 'localhost', port: 6379, maxRetries: 3, retryDelay: 1000 })

			// Action
			await webhookQueue.close()

			// Assert
			expect(mockWorkerClose).toHaveBeenCalled()
			expect(mockQueueClose).toHaveBeenCalled()
		})
	})
})
