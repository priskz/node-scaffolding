import type { Request } from 'express'

/*
 * Subdomain Resolver
 *
 * Resolves tenant slug from the first subdomain.
 * Example: "acme.example.com" → "acme"
 */
export function resolveFromSubdomain(req: Request): string | undefined
{
	const host = req.hostname

	if( ! host) { return undefined }

	const parts = host.split('.')

	// Need at least 3 parts for a subdomain (sub.domain.tld)
	if(parts.length < 3) { return undefined }

	return parts[0]
}
