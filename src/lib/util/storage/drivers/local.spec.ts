import { describe, it, expect, afterAll } from 'vitest'
import { join } from 'path'
import { mkdir, rm } from 'fs/promises'
import { localDriver } from './local'

/*
 * Local Storage Driver Tests
 *
 * Uses a temporary directory for actual file operations.
 * STORAGE_LOCAL_ROOT is set to './storage' in test env.
 */
const testDir = './storage/test'
const testFile = 'test/driver-test.txt'
const testContent = Buffer.from('hello from local driver test')

describe('localDriver', () =>
{
	afterAll(async () =>
	{
		// Clean up test directory
		await rm(testDir, { recursive: true, force: true })
	})

	it('should upload a file', async () =>
	{
		const result = await localDriver.upload(testFile, testContent)

		expect(result.path).toBe(testFile)
		expect(result.size).toBe(testContent.length)
		expect(result.mimeType).toBe('text/plain')
	})

	it('should check if a file exists', async () =>
	{
		const fileExists = await localDriver.exists(testFile)
		expect(fileExists).toBe(true)

		const missingExists = await localDriver.exists('test/nonexistent.txt')
		expect(missingExists).toBe(false)
	})

	it('should download a file', async () =>
	{
		const downloaded = await localDriver.download(testFile)

		expect(downloaded).toBeInstanceOf(Buffer)
		expect(downloaded.toString()).toBe('hello from local driver test')
	})

	it('should return a file path as URL', async () =>
	{
		const fileUrl = await localDriver.url(testFile)

		expect(fileUrl).toBe(join('./storage', testFile))
	})

	it('should delete a file', async () =>
	{
		const deleted = await localDriver.delete(testFile)
		expect(deleted).toBe(true)

		const existsAfter = await localDriver.exists(testFile)
		expect(existsAfter).toBe(false)
	})

	it('should return false when deleting a nonexistent file', async () =>
	{
		const deleted = await localDriver.delete('test/nonexistent.txt')
		expect(deleted).toBe(false)
	})

	it('should detect mime type from extension', async () =>
	{
		const result = await localDriver.upload(
			'test/image.png',
			Buffer.from('fake-png-data')
		)

		expect(result.mimeType).toBe('image/png')

		// Clean up
		await localDriver.delete('test/image.png')
	})

	it('should use provided mime type over auto-detection', async () =>
	{
		const result = await localDriver.upload(
			'test/data.bin',
			Buffer.from('binary-data'),
			{ mimeType: 'application/pdf' }
		)

		expect(result.mimeType).toBe('application/pdf')

		// Clean up
		await localDriver.delete('test/data.bin')
	})
})
