import { createHmac } from 'crypto'

/*
 * Sign a webhook payload with HMAC-SHA256
 *
 * Returns a hex-encoded signature for the X-Webhook-Signature header.
 * Consumers verify by computing the same HMAC over the raw body
 * and comparing signatures.
 */
export function sign(payload: string, secret: string): string
{
	return createHmac('sha256', secret)
		.update(payload)
		.digest('hex')
}

/*
 * Verify a webhook signature against the expected payload
 */
export function verify(payload: string, secret: string, signature: string): boolean
{
	const expected = sign(payload, secret)
	return expected === signature
}

export const webhookSigner = { sign, verify }
