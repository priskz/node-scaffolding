import { eventService } from './event-service'

/*
 * Event Facade
 *
 * Public API for domain events.
 * Delegates to eventService for all real work.
 */
export const event = {
	emit: eventService.emit,
	query: eventService.query,
	on: eventService.on,
	once: eventService.once,
	close: eventService.close,
}
