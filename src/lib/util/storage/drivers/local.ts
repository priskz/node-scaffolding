import { mkdir, readFile, writeFile, unlink, stat } from 'fs/promises'
import { Readable } from 'stream'
import { join, dirname } from 'path'
import { lookup } from 'mime-types'
import { env } from '~/lib/util/env'
import type { StorageDriver, StorageFile, UploadOptions, UrlOptions } from '../types'

/*
 * Local Disk Storage Driver
 *
 * Stores files on the local filesystem under STORAGE_LOCAL_ROOT.
 * Suitable for development and single-server deployments.
 */

function resolvePath(filePath: string): string
{
	return join(env.STORAGE_LOCAL_ROOT, filePath)
}

async function upload(
	path: string,
	content: Buffer | Readable,
	options?: UploadOptions
): Promise<StorageFile>
{
	const fullPath = resolvePath(path)

	// Ensure directory exists
	await mkdir(dirname(fullPath), { recursive: true })

	// Convert Readable to Buffer if needed
	const buffer = Buffer.isBuffer(content)
		? content
		: await streamToBuffer(content)

	// Write file
	await writeFile(fullPath, buffer)

	// Determine mime type
	const mimeType = options?.mimeType ?? (lookup(path) || 'application/octet-stream')

	return {
		path,
		size: buffer.length,
		mimeType,
	}
}

async function download(path: string): Promise<Buffer>
{
	const fullPath = resolvePath(path)
	return readFile(fullPath)
}

async function remove(path: string): Promise<boolean>
{
	const fullPath = resolvePath(path)

	try
	{
		await unlink(fullPath)
		return true
	}
	catch
	{
		return false
	}
}

async function exists(path: string): Promise<boolean>
{
	const fullPath = resolvePath(path)

	try
	{
		await stat(fullPath)
		return true
	}
	catch
	{
		return false
	}
}

async function url(path: string, _options?: UrlOptions): Promise<string>
{
	// Local driver returns a file path — no presigned URL concept
	return resolvePath(path)
}

/*
 * Convert a Readable stream to a Buffer
 */
async function streamToBuffer(stream: Readable): Promise<Buffer>
{
	const chunks: Buffer[] = []

	for await(const chunk of stream)
	{
		chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
	}

	return Buffer.concat(chunks)
}

export const localDriver: StorageDriver = {
	upload,
	download,
	delete: remove,
	exists,
	url,
}
