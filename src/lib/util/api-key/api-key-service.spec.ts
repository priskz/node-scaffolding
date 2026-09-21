import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createHash } from 'crypto'

/*
 * Hoisted mocks
 */
const { mockCreate, mockFindUnique, mockUpdate } = vi.hoisted(() => ({
	mockCreate: vi.fn(),
	mockFindUnique: vi.fn(),
	mockUpdate: vi.fn(),
}))

vi.mock('~/lib/util/database', () => ({
	database: {
		client: () => ({
			apiKey: {
				create: mockCreate,
				findUnique: mockFindUnique,
				update: mockUpdate,
			},
		}),
	},
}))

import { apiKey, hashKey } from './api-key-service'

describe('lib/util/api-key/api-key-service', () =>
{
	beforeEach(() =>
	{
		vi.clearAllMocks()
	})

	describe('generateApiKey', () =>
	{
		it('should create a key and return the plaintext once', async () =>
		{
			// Init
			mockCreate.mockImplementation(async ({ data }: { data: Record<string, unknown> }) =>
			{
				return {
					id: 'key-1',
					name: data.name,
					prefix: data.prefix,
					hash: data.hash,
					userId: data.userId,
					permissions: data.permissions,
					expiresAt: data.expiresAt,
				}
			})

			// Action
			const result = await apiKey.generateApiKey({
				name: 'Test Key',
				userId: 42,
				permissions: ['content:read'],
			})

			// Assert
			expect(result.id).toBe('key-1')
			expect(result.name).toBe('Test Key')
			expect(result.key).toBeDefined()
			expect(result.key.length).toBe(64)
			expect(result.prefix).toBe(result.key.slice(0, 8))
			expect(result.permissions).toEqual(['content:read'])
			expect(mockCreate).toHaveBeenCalledWith({
				data: expect.objectContaining({
					name: 'Test Key',
					userId: 42,
					permissions: ['content:read'],
				}),
			})
		})

		it('should store the SHA-256 hash, not the plaintext key', async () =>
		{
			// Init
			let storedHash: string | undefined

			mockCreate.mockImplementation(async ({ data }: { data: Record<string, unknown> }) =>
			{
				storedHash = data.hash as string
				return {
					id: 'key-2',
					name: data.name,
					prefix: data.prefix,
					hash: data.hash,
					userId: data.userId,
					permissions: data.permissions,
					expiresAt: data.expiresAt,
				}
			})

			// Action
			const result = await apiKey.generateApiKey({
				name: 'Hash Test',
				userId: 1,
			})

			// Assert — hash of the returned key should match stored hash
			const expectedHash = createHash('sha256').update(result.key).digest('hex')
			expect(storedHash).toBe(expectedHash)
		})

		it('should default permissions to empty array when not provided', async () =>
		{
			// Init
			mockCreate.mockImplementation(async ({ data }: { data: Record<string, unknown> }) =>
			{
				return {
					id: 'key-3',
					name: data.name,
					prefix: data.prefix,
					hash: data.hash,
					userId: data.userId,
					permissions: data.permissions,
					expiresAt: data.expiresAt,
				}
			})

			// Action
			await apiKey.generateApiKey({ name: 'No Perms', userId: 1 })

			// Assert
			expect(mockCreate).toHaveBeenCalledWith({
				data: expect.objectContaining({
					permissions: [],
				}),
			})
		})
	})

	describe('validateApiKey', () =>
	{
		it('should return validation result for a valid key', async () =>
		{
			// Init
			const rawKey = 'abcdef01' + '0'.repeat(56)
			const hash = createHash('sha256').update(rawKey).digest('hex')

			mockFindUnique.mockResolvedValue({
				id: 'key-1',
				name: 'Valid Key',
				prefix: 'abcdef01',
				hash,
				userId: 42,
				permissions: ['user:read'],
				active: true,
				expiresAt: null,
			})
			mockUpdate.mockResolvedValue({})

			// Action
			const result = await apiKey.validateApiKey(rawKey)

			// Assert
			expect(result).toEqual({
				id: 'key-1',
				name: 'Valid Key',
				userId: 42,
				permissions: ['user:read'],
			})
		})

		it('should return undefined for a key that is too short', async () =>
		{
			// Action
			const result = await apiKey.validateApiKey('abc')

			// Assert
			expect(result).toBeUndefined()
			expect(mockFindUnique).not.toHaveBeenCalled()
		})

		it('should return undefined when prefix not found', async () =>
		{
			// Init
			mockFindUnique.mockResolvedValue(null)

			// Action
			const result = await apiKey.validateApiKey('unknown0' + '0'.repeat(56))

			// Assert
			expect(result).toBeUndefined()
		})

		it('should return undefined for inactive keys', async () =>
		{
			// Init
			const rawKey = 'inactive' + '0'.repeat(56)

			mockFindUnique.mockResolvedValue({
				id: 'key-2',
				prefix: 'inactive',
				hash: 'whatever',
				active: false,
				expiresAt: null,
			})

			// Action
			const result = await apiKey.validateApiKey(rawKey)

			// Assert
			expect(result).toBeUndefined()
		})

		it('should return undefined for expired keys', async () =>
		{
			// Init
			const rawKey = 'expired0' + '0'.repeat(56)

			mockFindUnique.mockResolvedValue({
				id: 'key-3',
				prefix: 'expired0',
				hash: 'whatever',
				active: true,
				expiresAt: new Date('2020-01-01'),
			})

			// Action
			const result = await apiKey.validateApiKey(rawKey)

			// Assert
			expect(result).toBeUndefined()
		})

		it('should return undefined for hash mismatch', async () =>
		{
			// Init
			const rawKey = 'mismatch' + '0'.repeat(56)

			mockFindUnique.mockResolvedValue({
				id: 'key-4',
				prefix: 'mismatch',
				hash: 'wrong-hash',
				active: true,
				expiresAt: null,
			})

			// Action
			const result = await apiKey.validateApiKey(rawKey)

			// Assert
			expect(result).toBeUndefined()
		})
	})

	describe('revokeApiKey', () =>
	{
		it('should deactivate the key and return true', async () =>
		{
			// Init
			mockUpdate.mockResolvedValue({ id: 'key-1', active: false })

			// Action
			const result = await apiKey.revokeApiKey('key-1')

			// Assert
			expect(result).toBe(true)
			expect(mockUpdate).toHaveBeenCalledWith({
				where: { id: 'key-1' },
				data: { active: false },
			})
		})

		it('should return false when key not found', async () =>
		{
			// Init
			mockUpdate.mockRejectedValue(new Error('Record not found'))

			// Action
			const result = await apiKey.revokeApiKey('nonexistent')

			// Assert
			expect(result).toBe(false)
		})
	})

	describe('hashKey', () =>
	{
		it('should produce a consistent SHA-256 hash', () =>
		{
			// Init
			const input = 'test-key-12345'
			const expected = createHash('sha256').update(input).digest('hex')

			// Action
			const result = hashKey(input)

			// Assert
			expect(result).toBe(expected)
		})
	})
})
