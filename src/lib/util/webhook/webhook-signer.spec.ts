import { describe, it, expect } from 'vitest'
import { webhookSigner } from './webhook-signer'

describe('lib/util/webhook/webhook-signer', () =>
{
	const secret = 'test-secret-key'
	const payload = '{"event":"user.created","data":{"id":"1"}}'

	describe('sign', () =>
	{
		it('should produce a hex-encoded HMAC-SHA256 signature', () =>
		{
			// Action
			const signature = webhookSigner.sign(payload, secret)

			// Assert
			expect(signature).toMatch(/^[a-f0-9]{64}$/)
		})

		it('should produce consistent signatures for the same input', () =>
		{
			// Action
			const sig1 = webhookSigner.sign(payload, secret)
			const sig2 = webhookSigner.sign(payload, secret)

			// Assert
			expect(sig1).toBe(sig2)
		})

		it('should produce different signatures for different secrets', () =>
		{
			// Action
			const sig1 = webhookSigner.sign(payload, 'secret-a')
			const sig2 = webhookSigner.sign(payload, 'secret-b')

			// Assert
			expect(sig1).not.toBe(sig2)
		})

		it('should produce different signatures for different payloads', () =>
		{
			// Action
			const sig1 = webhookSigner.sign('payload-a', secret)
			const sig2 = webhookSigner.sign('payload-b', secret)

			// Assert
			expect(sig1).not.toBe(sig2)
		})
	})

	describe('verify', () =>
	{
		it('should return true for a valid signature', () =>
		{
			// Init
			const signature = webhookSigner.sign(payload, secret)

			// Action
			const valid = webhookSigner.verify(payload, secret, signature)

			// Assert
			expect(valid).toBe(true)
		})

		it('should return false for an invalid signature', () =>
		{
			// Action
			const valid = webhookSigner.verify(payload, secret, 'invalid-signature')

			// Assert
			expect(valid).toBe(false)
		})

		it('should return false when payload has been tampered', () =>
		{
			// Init
			const signature = webhookSigner.sign(payload, secret)

			// Action
			const valid = webhookSigner.verify('tampered-payload', secret, signature)

			// Assert
			expect(valid).toBe(false)
		})
	})
})
