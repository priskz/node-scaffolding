import type { Request } from 'express'

/*
 * Header Resolver
 *
 * Resolves tenant slug from a custom request header.
 * Default header: X-Tenant-ID (configurable via TENANCY_HEADER env var).
 */
export function resolveFromHeader(req: Request, headerName: string): string | undefined
{
	const value = req.headers[headerName.toLowerCase()]

	if( ! value) { return undefined }

	// Headers can be string | string[] — take the first value
	return Array.isArray(value) ? value[0] : value
}
