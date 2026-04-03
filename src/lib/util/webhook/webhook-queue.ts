import { Queue, Worker } from 'bullmq'
import type { Job } from 'bullmq'
import { log } from '~/lib/util/log'
import { database } from '~/lib/util/database'
import { webhookSigner } from './webhook-signer'
import type { WebhookDeliveryJob, WebhookDeliveryResult } from './types'

let queue: Queue | undefined
let worker: Worker | undefined

let _webhookLog: ReturnType<typeof log.child> | undefined

function webhookLog(): ReturnType<typeof log.child>
{
	if( ! _webhookLog)
	{
		_webhookLog = log.child('WebhookQueue')
	}
	return _webhookLog
}

/*
 * Initialize the webhook delivery queue and worker
 */
function init(options: { host: string; port: number; maxRetries: number; retryDelay: number }): void
{
	// Already initialized?
	if(queue) return

	// Connection config
	const connection = { host: options.host, port: options.port }

	// Create queue
	queue = new Queue('webhook-delivery', { connection })

	// Create worker
	worker = new Worker('webhook-delivery', processDelivery, {
		connection,
		concurrency: 5,
	})

	// Worker event handlers
	worker.on('completed', (job: Job<WebhookDeliveryJob>) =>
	{
		webhookLog().debug({ deliveryId: job.data.deliveryId }, 'webhook delivered')
	})

	worker.on('failed', (job: Job<WebhookDeliveryJob> | undefined, err: Error) =>
	{
		webhookLog().warn({ deliveryId: job?.data.deliveryId, error: err.message }, 'webhook delivery failed')
	})

	webhookLog().info('webhook queue initialized')
}

/*
 * Enqueue a webhook delivery job
 */
async function enqueue(job: WebhookDeliveryJob, options: { maxRetries: number; retryDelay: number }): Promise<void>
{
	// Not initialized?
	if( ! queue) throw new Error('WebhookQueue not initialized — call webhook.init() first')

	// Add job
	await queue.add('deliver', job, {
		attempts: options.maxRetries,
		backoff: {
			type: 'exponential',
			delay: options.retryDelay,
		},
	})

	webhookLog().debug({ deliveryId: job.deliveryId, url: job.url }, 'webhook delivery enqueued')
}

/*
 * Process a webhook delivery job
 */
async function processDelivery(job: Job<WebhookDeliveryJob>): Promise<WebhookDeliveryResult>
{
	const { deliveryId, url, secret, eventType, payload } = job.data

	// Build payload body
	const body = JSON.stringify({ event: eventType, data: payload, timestamp: new Date().toISOString() })

	// Sign payload
	const signature = webhookSigner.sign(body, secret)

	// Deliver
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-Webhook-Signature': signature,
			'X-Webhook-Event': eventType,
		},
		body,
		signal: AbortSignal.timeout(10000),
	})

	// Update delivery record
	const prisma = database.client()
	const status = response.ok ? 'delivered' : 'failed'

	await prisma.webhookDelivery.update({
		where: { id: deliveryId },
		data: {
			status,
			attempts: job.attemptsMade + 1,
			lastAttemptAt: new Date(),
			response: { statusCode: response.status, body: await response.text().catch(() => null) },
		},
	})

	// Failed?
	if( ! response.ok)
	{
		throw new Error(`Webhook delivery failed: ${response.status} ${response.statusText}`)
	}

	return { deliveryId, status: 'delivered', statusCode: response.status, error: null }
}

/*
 * Close the queue and worker
 */
async function close(): Promise<void>
{
	if(worker)
	{
		await worker.close()
		worker = undefined
	}

	if(queue)
	{
		await queue.close()
		queue = undefined
	}

	webhookLog().info('webhook queue closed')
}

export const webhookQueue = { init, enqueue, close }
