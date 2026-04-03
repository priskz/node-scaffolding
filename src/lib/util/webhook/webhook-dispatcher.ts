import type { Prisma } from '~/generated/prisma/client'
import { database } from '~/lib/util/database'
import { log } from '~/lib/util/log'
import { event } from '~/lib/util/event'
import { webhookQueue } from './webhook-queue'
import type { DomainEvent } from '~/lib/util/event'
import type { WebhookDispatcherOptions } from './types'

let _dispatcherLog: ReturnType<typeof log.child> | undefined
let _options: WebhookDispatcherOptions | undefined

function dispatcherLog(): ReturnType<typeof log.child>
{
	if( ! _dispatcherLog)
	{
		_dispatcherLog = log.child('WebhookDispatcher')
	}
	return _dispatcherLog
}

/*
 * Initialize the webhook dispatcher
 *
 * Subscribes to all domain events via EventService.
 * When an event fires, looks up matching webhook registrations
 * and enqueues delivery jobs.
 */
function init(options: WebhookDispatcherOptions): void
{
	_options = options

	// Subscribe to all domain events
	event.on('**', handleEvent)

	dispatcherLog().info('webhook dispatcher initialized — listening to all events')
}

/*
 * Handle a domain event — find matching webhooks and enqueue deliveries
 */
async function handleEvent(domainEvent: DomainEvent): Promise<void>
{
	const prisma = database.client()

	// Find active webhooks that subscribe to this event type
	const webhooks = await prisma.webhook.findMany({
		where: {
			active: true,
			events: { has: domainEvent.type },
			...(domainEvent.tenantId ? { OR: [{ tenantId: domainEvent.tenantId }, { tenantId: null }] } : {}),
		},
	})

	// No webhooks?
	if(webhooks.length === 0) return

	dispatcherLog().debug({ eventType: domainEvent.type, webhookCount: webhooks.length }, 'dispatching webhooks')

	// Create delivery records and enqueue jobs
	for(const webhook of webhooks)
	{
		// Create delivery record
		const delivery = await prisma.webhookDelivery.create({
			data: {
				webhookId: webhook.id,
				eventId: domainEvent.id ?? undefined,
				eventType: domainEvent.type,
			},
		})

		// Enqueue delivery job
		await webhookQueue.enqueue({
			webhookId: webhook.id,
			deliveryId: delivery.id,
			url: webhook.url,
			secret: webhook.secret,
			eventType: domainEvent.type,
			payload: (domainEvent.payload ?? {}) as Record<string, unknown>,
		}, {
			maxRetries: _options?.maxRetries ?? 5,
			retryDelay: _options?.retryDelay ?? 5000,
		})
	}
}

/*
 * Close the dispatcher
 */
function close(): void
{
	event.on('**', () => {})
	dispatcherLog().info('webhook dispatcher closed')
}

export const webhookDispatcher = { init, close }
