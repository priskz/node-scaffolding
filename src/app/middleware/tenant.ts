import type { Request, Response, NextFunction } from 'express'
import { database } from '~/lib/util/database'
import { log } from '~/lib/util/log'
import { tenantContext } from '~/lib/util/tenant'
import { resolveFromHeader, resolveFromSubdomain, resolveFromPath } from '~/lib/util/tenant/resolvers'
import { env } from '~/lib/util/env'
import type { TenantRecord } from '~/lib/util/tenant'

/*
 * Tenant Middleware
 *
 * Resolves tenant from the request, looks up the record, and wraps
 * the rest of the request in a TenantContext via AsyncLocalStorage.
 * Skipped entirely when TENANCY_ENABLED !== 'true'.
 */

// Lazy child logger
let _tenantLog: ReturnType<typeof log.child> | undefined

function tenantLog(): ReturnType<typeof log.child>
{
	if( ! _tenantLog)
	{
		_tenantLog = log.child('TenantMiddleware')
	}

	return _tenantLog
}

export function tenantMiddleware(req: Request, res: Response, next: NextFunction): void
{
	// Tenancy disabled — pass through
	if(env.TENANCY_ENABLED !== 'true')
	{
		next()
		return
	}

	// Resolve tenant slug from configured resolver
	const slug = resolveSlug(req)

	if( ! slug)
	{
		res.status(400).json({ error: 'Tenant could not be resolved from request' })
		return
	}

	// Look up tenant and wrap in context
	lookupAndWrap(slug, req, res, next)
}

function resolveSlug(req: Request): string | undefined
{
	const resolver = env.TENANCY_RESOLVER

	switch(resolver)
	{
		case 'header':
			return resolveFromHeader(req, env.TENANCY_HEADER)
		case 'subdomain':
			return resolveFromSubdomain(req)
		case 'path':
			return resolveFromPath(req)
		default:
			return resolveFromHeader(req, env.TENANCY_HEADER)
	}
}

function lookupAndWrap(slug: string, req: Request, res: Response, next: NextFunction): void
{
	const prisma = database.client()

	prisma.tenant.findUnique({ where: { slug } })
		.then((record) =>
		{
			if( ! record)
			{
				tenantLog().warn({ slug }, 'tenant not found')
				res.status(404).json({ error: 'Tenant not found' })
				return
			}

			if(record.status !== 'active')
			{
				tenantLog().warn({ slug, status: record.status }, 'tenant not active')
				res.status(403).json({ error: 'Tenant is not active' })
				return
			}

			const tenant: TenantRecord = {
				id: record.id,
				name: record.name,
				slug: record.slug,
				status: record.status as TenantRecord['status'],
			}

			// Set on request for convenience
			req.tenantId = tenant.id
			req.tenant = tenant

			// Wrap remaining request in tenant context
			tenantContext.run(tenant, () =>
			{
				tenantLog().debug({ tenantId: tenant.id, slug }, 'tenant context set')
				next()
			})
		})
		.catch((err) =>
		{
			tenantLog().error({ err, slug }, 'tenant lookup failed')
			next(err)
		})
}
