/*
 * Event Context
 *
 * Optional context attached when emitting events.
 * tenantId and actorId can be set explicitly or resolved from TenantContext / auth.
 */
export interface EventContext
{
	tenantId?: string
	actorId?: string
}
