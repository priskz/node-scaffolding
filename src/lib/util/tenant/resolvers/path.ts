import type { Request } from 'express'

/*
 * Path Resolver
 *
 * Resolves tenant slug from the first URL path segment.
 * Example: "/acme/api/v1/users" → "acme"
 */
export function resolveFromPath(req: Request): string | undefined
{
	const segments = req.path.split('/').filter(Boolean)

	if(segments.length === 0) { return undefined }

	return segments[0]
}
