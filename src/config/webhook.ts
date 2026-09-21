import { env } from '~/lib/util/env'

export interface WebhookConfig
{
	enabled: boolean
	maxRetries: number
	retryDelay: number
}

export const webhook: WebhookConfig = {
	enabled: env.WEBHOOK_QUEUE_ENABLED === 'true',
	maxRetries: env.WEBHOOK_MAX_RETRIES,
	retryDelay: env.WEBHOOK_RETRY_DELAY,
}
