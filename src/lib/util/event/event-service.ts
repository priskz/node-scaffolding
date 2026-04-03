import type { Prisma } from '~/generated/prisma/client'
import { database } from '~/lib/util/database'
import { log } from '~/lib/util/log'
import { eventBus } from './event-bus'
import type { DomainEvent, EventQuery } from './types'

/*
 * Event Service
 *
 * Domain event lifecycle: persist to PostgreSQL → publish on EventEmitter2 bus.
 * Valkey stream publishing is stubbed — logs debug, no-op. Real implementation in Stage 2.
 */

// Lazy child logger
let _eventLog: ReturnType<typeof log.child> | undefined

function eventLog(): ReturnType<typeof log.child>
{
	if( ! _eventLog)
	{
		_eventLog = log.child('EventService')
	}

	return _eventLog
}

/*
 * Emit a domain event
 *
 * 1. Persist to PostgreSQL (durable record)
 * 2. Publish on in-process bus (immediate handlers)
 * 3. Publish to Valkey stream (stubbed)
 */
async function emit(event: DomainEvent): Promise<DomainEvent>
{
	const prisma = database.client()

	// Persist to PostgreSQL
	const persisted = await prisma.event.create({
		data: {
			type: event.type,
			tenantId: event.tenantId ?? undefined,
			actorId: event.actorId ?? undefined,
			payload: (event.payload as Prisma.InputJsonValue) ?? undefined,
			timestamp: event.timestamp ?? new Date(),
		},
	})

	const domainEvent: DomainEvent = {
		id: persisted.id,
		type: persisted.type,
		tenantId: persisted.tenantId ?? undefined,
		actorId: persisted.actorId ?? undefined,
		payload: persisted.payload as Record<string, unknown> ?? undefined,
		timestamp: persisted.timestamp,
	}

	// Publish on in-process bus
	eventBus.publish(domainEvent)

	// Valkey stream stub — debug log only
	eventLog().debug({ type: domainEvent.type, id: domainEvent.id }, 'valkey stream publish stub — no-op')

	eventLog().info({ type: domainEvent.type, id: domainEvent.id }, 'event emitted')

	return domainEvent
}

/*
 * Query persisted events
 */
async function query(filters: EventQuery = {}): Promise<DomainEvent[]>
{
	const prisma = database.client()

	const where: Record<string, unknown> = {}

	if(filters.type)
	{
		where.type = filters.type
	}

	if(filters.tenantId)
	{
		where.tenantId = filters.tenantId
	}

	if(filters.actorId)
	{
		where.actorId = filters.actorId
	}

	if(filters.since || filters.until)
	{
		const timestamp: Record<string, Date> = {}

		if(filters.since) { timestamp.gte = filters.since }
		if(filters.until) { timestamp.lte = filters.until }

		where.timestamp = timestamp
	}

	const events = await prisma.event.findMany({
		where,
		orderBy: { timestamp: 'desc' },
		take: filters.limit ?? 100,
	})

	return events.map((e) => ({
		id: e.id,
		type: e.type,
		tenantId: e.tenantId ?? undefined,
		actorId: e.actorId ?? undefined,
		payload: e.payload as Record<string, unknown> ?? undefined,
		timestamp: e.timestamp,
	}))
}

/*
 * Subscribe to events on the in-process bus
 */
function on(type: string, handler: (event: DomainEvent) => void): void
{
	eventBus.on(type, handler)
}

/*
 * Subscribe once
 */
function once(type: string, handler: (event: DomainEvent) => void): void
{
	eventBus.once(type, handler)
}

/*
 * Shutdown — clear the event bus
 */
function close(): void
{
	eventBus.clear()
	eventLog().info('event service closed')
}

export const eventService = { emit, query, on, once, close }
