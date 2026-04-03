/*
 * Domain Event
 *
 * The canonical shape of every event in the system.
 * Type naming convention: domain.past_tense.dot_separated
 * Example: "user.created", "auction.bid.placed", "league.settings.updated"
 */
export interface DomainEvent
{
	id?: string
	type: string
	tenantId?: string
	actorId?: string
	payload?: Record<string, unknown>
	timestamp?: Date
}
