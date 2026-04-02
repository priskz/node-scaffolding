import { describe, it, expect, vi, beforeEach } from 'vitest'

/*
 * S3 Storage Driver Tests
 *
 * Mocks the AWS SDK and env module — no real S3 calls.
 * Verifies the driver correctly delegates to S3Client commands.
 */

// Mock env to provide S3 config
vi.mock('~/lib/util/env', () => ({
	env: {
		STORAGE_DRIVER: 's3',
		STORAGE_S3_BUCKET: 'test-bucket',
		STORAGE_S3_REGION: 'us-east-1',
		STORAGE_S3_ENDPOINT: undefined,
		STORAGE_S3_ACCESS_KEY: 'test-key',
		STORAGE_S3_SECRET_KEY: 'test-secret',
		STORAGE_LOCAL_ROOT: './storage',
		NODE_ENV: 'test',
		LOG_LEVEL: 'error',
		LOG_CONSOLE_PRETTY: 'false',
		LOG_DESTINATIONS: 'console',
	},
}))

// Shared mock send function
const mockSend = vi.fn()

// Mock the AWS SDK modules — must use class syntax for `new` calls
vi.mock('@aws-sdk/client-s3', () => ({
	S3Client: class { send = mockSend },
	PutObjectCommand: class { constructor(public input: unknown) {} },
	GetObjectCommand: class { constructor(public input: unknown) {} },
	DeleteObjectCommand: class { constructor(public input: unknown) {} },
	HeadObjectCommand: class { constructor(public input: unknown) {} },
}))

vi.mock('@aws-sdk/s3-request-presigner', () => ({
	getSignedUrl: vi.fn().mockResolvedValue('https://bucket.s3.amazonaws.com/test.txt?signed=true'),
}))

describe('s3Driver', () =>
{
	let s3Driver: typeof import('./s3').s3Driver

	beforeEach(async () =>
	{
		vi.clearAllMocks()

		// Re-import to get fresh module with mocks applied
		const mod = await import('./s3')
		s3Driver = mod.s3Driver
	})

	it('should upload a file to S3', async () =>
	{
		mockSend.mockResolvedValueOnce({})

		const result = await s3Driver.upload(
			'uploads/test.txt',
			Buffer.from('hello s3')
		)

		expect(result.path).toBe('uploads/test.txt')
		expect(result.size).toBe(8)
		expect(result.mimeType).toBe('text/plain')
		expect(mockSend).toHaveBeenCalledOnce()
	})

	it('should generate a presigned URL', async () =>
	{
		const url = await s3Driver.url('uploads/test.txt', { expiresIn: 600 })

		expect(url).toContain('signed=true')
	})

	it('should check if a file exists via HeadObject', async () =>
	{
		mockSend.mockResolvedValueOnce({})

		const fileExists = await s3Driver.exists('uploads/test.txt')
		expect(fileExists).toBe(true)
	})

	it('should return false for missing file', async () =>
	{
		mockSend.mockRejectedValueOnce(new Error('NotFound'))

		const fileExists = await s3Driver.exists('uploads/missing.txt')
		expect(fileExists).toBe(false)
	})

	it('should delete a file from S3', async () =>
	{
		mockSend.mockResolvedValueOnce({})

		const deleted = await s3Driver.delete('uploads/test.txt')
		expect(deleted).toBe(true)
	})
})
