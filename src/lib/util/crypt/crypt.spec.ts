import { describe, it, expect } from 'vitest'
import { crypt } from './crypt'

describe('lib/util/crypt', () =>
{
	describe('hash.make', () =>
	{
		it('should produce a bcrypt hash that differs from the input', async () =>
		{
			const hash = await crypt.hash.make('password-abc')

			expect(hash).not.toBe('password-abc')
			expect(hash).toMatch(/^\$2[aby]\$\d{1,2}\$[./A-Za-z0-9]+$/)
		})

		it('should produce different hashes for the same input (salted)', async () =>
		{
			const a = await crypt.hash.make('same-input')
			const b = await crypt.hash.make('same-input')

			expect(a).not.toBe(b)
		})
	})

	describe('hash.check', () =>
	{
		it('should verify a matching password', async () =>
		{
			const hash = await crypt.hash.make('correct-horse')
			const ok = await crypt.hash.check('correct-horse', hash)

			expect(ok).toBe(true)
		})

		it('should reject a mismatched password', async () =>
		{
			const hash = await crypt.hash.make('correct-horse')
			const ok = await crypt.hash.check('wrong-horse', hash)

			expect(ok).toBe(false)
		})
	})
})
