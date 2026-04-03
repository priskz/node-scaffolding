/*
 * Event Query
 *
 * Filters for querying persisted events.
 */
export interface EventQuery
{
	type?: string
	tenantId?: string
	actorId?: string
	since?: Date
	until?: Date
	limit?: number
}
