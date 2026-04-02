import type { Readable } from 'stream'

/*
 * Storage Driver Interface
 *
 * All storage drivers implement this interface.
 * Swappable at runtime via STORAGE_DRIVER env var.
 */
export interface StorageDriver
{
	upload(path: string, content: Buffer | Readable, options?: UploadOptions): Promise<StorageFile>
	download(path: string): Promise<Buffer>
	delete(path: string): Promise<boolean>
	exists(path: string): Promise<boolean>
	url(path: string, options?: UrlOptions): Promise<string>
}

export interface StorageFile
{
	path: string
	size: number
	mimeType: string
}

export interface UploadOptions
{
	mimeType?: string
	visibility?: 'public' | 'private'
}

export interface UrlOptions
{
	expiresIn?: number
}
