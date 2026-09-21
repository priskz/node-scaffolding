import { describe, it, expect, vi, beforeEach } from 'vitest'

/*
 * Hoisted mocks
 */
const { mockFindUnique, mockUpdate, mockVerifySync, mockGenerateSecret, mockGenerateURI } = vi.hoisted(() => ({
	mockFindUnique: vi.fn(),
	mockUpdate: vi.fn(),
	mockVerifySync: vi.fn(),
	mockGenerateSecret: vi.fn(),
	mockGenerateURI: vi.fn(),
}))

vi.mock('~/lib/util/database', () => ({
	database: {
		client: () => ({
			user: {
				findUnique: mockFindUnique,
				update: mockUpdate,
			},
		}),
	},
}))

vi.mock('~/lib/util/env', () => ({
	env: {
		TOTP_ISSUER: 'TestApp',
		RECOVERY_CODE_COUNT: 3,
	},
}))

vi.mock('otplib', () => ({
	generateSecret: mockGenerateSecret,
	generateURI: mockGenerateURI,
	verifySync: mockVerifySync,
}))

import { totp, hashCode } from './totp-service'

describe('lib/util/totp/totp-service', () =>
{
	beforeEach(() =>
	{
		vi.clearAllMocks()
	})

	describe('generateSetup', () =>
	{
		it('should generate secret, URI, and recovery codes', async () =>
		{
			// Init
			mockGenerateSecret.mockReturnValue('ABCDEFGHIJ123456')
			mockGenerateURI.mockReturnValue('otpauth://totp/TestApp:user@test.com?secret=ABCDEFGHIJ123456&issuer=TestApp')
			mockUpdate.mockResolvedValue({})

			// Action
			const result = await totp.generateSetup(42, 'user@test.com')

			// Assert
			expect(result.secret).toBe('ABCDEFGHIJ123456')
			expect(result.uri).toContain('otpauth://')
			expect(result.recoveryCodes).toHaveLength(3)
			expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
				where: { id: 42 },
				data: expect.objectContaining({
					totpSecret: 'ABCDEFGHIJ123456',
					recoveryCodes: expect.any(Array),
				}),
			}))
		})

		it('should store hashed recovery codes, not plaintext', async () =>
		{
			// Init
			mockGenerateSecret.mockReturnValue('SECRETKEY123')
			mockGenerateURI.mockReturnValue('otpauth://...')
			mockUpdate.mockResolvedValue({})

			// Action
			const result = await totp.generateSetup(1, 'test@test.com')

			// Assert — stored codes are hashed, not equal to plaintext
			const storedCodes = mockUpdate.mock.calls[0][0].data.recoveryCodes
			for(let i = 0; i < result.recoveryCodes.length; i++)
			{
				expect(storedCodes[i]).not.toBe(result.recoveryCodes[i])
				expect(storedCodes[i]).toBe(hashCode(result.recoveryCodes[i]))
			}
		})
	})

	describe('enableTotp', () =>
	{
		it('should enable 2FA when token is valid', async () =>
		{
			// Init
			mockFindUnique.mockResolvedValue({ totpSecret: 'SECRETKEY123' })
			mockVerifySync.mockReturnValue({ valid: true, delta: 0 })
			mockUpdate.mockResolvedValue({})

			// Action
			const result = await totp.enableTotp(42, '123456')

			// Assert
			expect(result).toBe(true)
			expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
				where: { id: 42 },
				data: { totpEnabled: true },
			}))
		})

		it('should return false when token is invalid', async () =>
		{
			// Init
			mockFindUnique.mockResolvedValue({ totpSecret: 'SECRETKEY123' })
			mockVerifySync.mockReturnValue({ valid: false })

			// Action
			const result = await totp.enableTotp(42, '000000')

			// Assert
			expect(result).toBe(false)
			expect(mockUpdate).not.toHaveBeenCalled()
		})

		it('should return false when user has no secret', async () =>
		{
			// Init
			mockFindUnique.mockResolvedValue({ totpSecret: null })

			// Action
			const result = await totp.enableTotp(42, '123456')

			// Assert
			expect(result).toBe(false)
		})
	})

	describe('disableTotp', () =>
	{
		it('should clear secret, codes, and set enabled to false', async () =>
		{
			// Init
			mockUpdate.mockResolvedValue({})

			// Action
			await totp.disableTotp(42)

			// Assert
			expect(mockUpdate).toHaveBeenCalledWith({
				where: { id: 42 },
				data: {
					totpEnabled: false,
					totpSecret: null,
					recoveryCodes: [],
				},
			})
		})
	})

	describe('verifyToken', () =>
	{
		it('should return valid true when token matches', async () =>
		{
			// Init
			mockFindUnique.mockResolvedValue({ totpSecret: 'SECRETKEY123', totpEnabled: true })
			mockVerifySync.mockReturnValue({ valid: true, delta: 0 })

			// Action
			const result = await totp.verifyToken(42, '123456')

			// Assert
			expect(result.valid).toBe(true)
		})

		it('should return valid false when token does not match', async () =>
		{
			// Init
			mockFindUnique.mockResolvedValue({ totpSecret: 'SECRETKEY123', totpEnabled: true })
			mockVerifySync.mockReturnValue({ valid: false })

			// Action
			const result = await totp.verifyToken(42, '000000')

			// Assert
			expect(result.valid).toBe(false)
		})

		it('should return valid false when 2FA not enabled', async () =>
		{
			// Init
			mockFindUnique.mockResolvedValue({ totpSecret: 'SECRETKEY123', totpEnabled: false })

			// Action
			const result = await totp.verifyToken(42, '123456')

			// Assert
			expect(result.valid).toBe(false)
			expect(mockVerifySync).not.toHaveBeenCalled()
		})
	})

	describe('consumeRecoveryCode', () =>
	{
		it('should consume a valid recovery code and remove it', async () =>
		{
			// Init
			const code = 'abcdef1234567890abcdef1234567890'
			const hashed = hashCode(code)
			mockFindUnique.mockResolvedValue({
				recoveryCodes: [hashed, 'other-hash-1', 'other-hash-2'],
			})
			mockUpdate.mockResolvedValue({})

			// Action
			const result = await totp.consumeRecoveryCode(42, code)

			// Assert
			expect(result).toBe(true)
			expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
				where: { id: 42 },
				data: {
					recoveryCodes: ['other-hash-1', 'other-hash-2'],
				},
			}))
		})

		it('should return false when code does not match', async () =>
		{
			// Init
			mockFindUnique.mockResolvedValue({
				recoveryCodes: ['hash-1', 'hash-2'],
			})

			// Action
			const result = await totp.consumeRecoveryCode(42, 'wrong-code')

			// Assert
			expect(result).toBe(false)
			expect(mockUpdate).not.toHaveBeenCalled()
		})

		it('should return false when user not found', async () =>
		{
			// Init
			mockFindUnique.mockResolvedValue(null)

			// Action
			const result = await totp.consumeRecoveryCode(42, 'some-code')

			// Assert
			expect(result).toBe(false)
		})
	})

	describe('hasTotpEnabled', () =>
	{
		it('should return true when user has TOTP enabled', async () =>
		{
			// Init
			mockFindUnique.mockResolvedValue({ totpEnabled: true })

			// Action
			const result = await totp.hasTotpEnabled(42)

			// Assert
			expect(result).toBe(true)
		})

		it('should return false when user has TOTP disabled', async () =>
		{
			// Init
			mockFindUnique.mockResolvedValue({ totpEnabled: false })

			// Action
			const result = await totp.hasTotpEnabled(42)

			// Assert
			expect(result).toBe(false)
		})

		it('should return false when user not found', async () =>
		{
			// Init
			mockFindUnique.mockResolvedValue(null)

			// Action
			const result = await totp.hasTotpEnabled(999)

			// Assert
			expect(result).toBe(false)
		})
	})

	describe('hashCode', () =>
	{
		it('should produce consistent SHA-256 hashes', () =>
		{
			// Action
			const hash1 = hashCode('test-code')
			const hash2 = hashCode('test-code')

			// Assert
			expect(hash1).toBe(hash2)
			expect(hash1).toHaveLength(64)
		})

		it('should produce different hashes for different inputs', () =>
		{
			// Action
			const hash1 = hashCode('code-a')
			const hash2 = hashCode('code-b')

			// Assert
			expect(hash1).not.toBe(hash2)
		})
	})
})
