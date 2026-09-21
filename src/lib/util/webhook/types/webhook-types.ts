/*
 * Webhook registration
 */
export interface WebhookRecord
{
	id: string
	url: string
	secret: string
	events: string[]
	tenantId: string | null
	active: boolean
	createdAt: Date
	updatedAt: Date | null
}

/*
 * Webhook delivery job payload
 */
export interface WebhookDeliveryJob
{
	webhookId: string
	deliveryId: string
	url: string
	secret: string
	eventType: string
	payload: Record<string, unknown>
}

/*
 * Webhook delivery result
 */
export interface WebhookDeliveryResult
{
	deliveryId: string
	status: 'delivered' | 'failed'
	statusCode: number | null
	error: string | null
}

/*
 * Webhook dispatcher options
 */
export interface WebhookDispatcherOptions
{
	maxRetries: number
	retryDelay: number
}
