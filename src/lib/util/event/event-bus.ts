import { EventEmitter2 } from 'eventemitter2'
import type { DomainEvent } from './types'

/*
 * Event Bus
 *
 * In-process event bus backed by EventEmitter2.
 * Supports wildcard listeners — "user.*" catches "user.created", "user.updated", etc.
 * This is the synchronous dispatch layer. Persistence is handled by EventService.
 */

let emitter: EventEmitter2 | undefined

function instance(): EventEmitter2
{
	if( ! emitter)
	{
		emitter = new EventEmitter2({
			wildcard: true,
			delimiter: '.',
			maxListeners: 50,
		})
	}

	return emitter
}

/*
 * Publish an event on the bus
 */
function publish(event: DomainEvent): void
{
	instance().emit(event.type, event)
}

/*
 * Subscribe to an event type — supports wildcards
 */
function on(type: string, handler: (event: DomainEvent) => void): void
{
	instance().on(type, handler)
}

/*
 * Subscribe once
 */
function once(type: string, handler: (event: DomainEvent) => void): void
{
	instance().once(type, handler)
}

/*
 * Remove a specific handler
 */
function off(type: string, handler: (event: DomainEvent) => void): void
{
	instance().off(type, handler)
}

/*
 * Remove all listeners — used during shutdown
 */
function clear(): void
{
	if(emitter)
	{
		emitter.removeAllListeners()
		emitter = undefined
	}
}

export const eventBus = { publish, on, once, off, clear }
