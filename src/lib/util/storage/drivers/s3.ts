import {
	S3Client,
	PutObjectCommand,
	GetObjectCommand,
	DeleteObjectCommand,
	HeadObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Readable } from 'stream'
import { lookup } from 'mime-types'
import { env } from '~/lib/util/env'
import type { StorageDriver, StorageFile, UploadOptions, UrlOptions } from '../types'

/*
 * S3 Storage Driver
 *
 * Stores files in an S3-compatible bucket.
 * Supports AWS S3, MinIO, and any S3-compatible service
 * via the STORAGE_S3_ENDPOINT env var.
 */

let client: S3Client

function getClient(): S3Client
{
	if( ! client)
	{
		const config: Record<string, unknown> = {
			region: env.STORAGE_S3_REGION ?? 'us-east-1',
		}

		// Custom endpoint for MinIO / S3-compatible services
		if(env.STORAGE_S3_ENDPOINT)
		{
			config.endpoint = env.STORAGE_S3_ENDPOINT
			config.forcePathStyle = true
		}

		// Explicit credentials if provided
		if(env.STORAGE_S3_ACCESS_KEY && env.STORAGE_S3_SECRET_KEY)
		{
			config.credentials = {
				accessKeyId: env.STORAGE_S3_ACCESS_KEY,
				secretAccessKey: env.STORAGE_S3_SECRET_KEY,
			}
		}

		client = new S3Client(config)
	}

	return client
}

function getBucket(): string
{
	if( ! env.STORAGE_S3_BUCKET)
	{
		throw new Error('STORAGE_S3_BUCKET is required for S3 storage driver')
	}

	return env.STORAGE_S3_BUCKET
}

async function upload(
	path: string,
	content: Buffer | Readable,
	options?: UploadOptions
): Promise<StorageFile>
{
	const mimeType = options?.mimeType ?? (lookup(path) || 'application/octet-stream')

	// Convert Readable to Buffer for content length
	const buffer = Buffer.isBuffer(content)
		? content
		: await streamToBuffer(content)

	const command = new PutObjectCommand({
		Bucket: getBucket(),
		Key: path,
		Body: buffer,
		ContentType: mimeType,
		ACL: options?.visibility === 'public' ? 'public-read' : 'private',
	})

	await getClient().send(command)

	return {
		path,
		size: buffer.length,
		mimeType,
	}
}

async function download(path: string): Promise<Buffer>
{
	const command = new GetObjectCommand({
		Bucket: getBucket(),
		Key: path,
	})

	const response = await getClient().send(command)

	if( ! response.Body)
	{
		throw new Error(`Empty response body for ${path}`)
	}

	return streamToBuffer(response.Body as Readable)
}

async function remove(path: string): Promise<boolean>
{
	const command = new DeleteObjectCommand({
		Bucket: getBucket(),
		Key: path,
	})

	try
	{
		await getClient().send(command)
		return true
	}
	catch
	{
		return false
	}
}

async function exists(path: string): Promise<boolean>
{
	const command = new HeadObjectCommand({
		Bucket: getBucket(),
		Key: path,
	})

	try
	{
		await getClient().send(command)
		return true
	}
	catch
	{
		return false
	}
}

async function url(path: string, options?: UrlOptions): Promise<string>
{
	const command = new GetObjectCommand({
		Bucket: getBucket(),
		Key: path,
	})

	const expiresIn = options?.expiresIn ?? 3600

	return getSignedUrl(getClient(), command, { expiresIn })
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

export const s3Driver: StorageDriver = {
	upload,
	download,
	delete: remove,
	exists,
	url,
}
