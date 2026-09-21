import { AsyncLocalStorage } from 'async_hooks'
import type { TenantStore, TenantRecord } from './types'

/*
 * Tenant Context
 *
 * AsyncLocalStorage-based tenant isolation.
 * Set by the tenant middleware, readable from anywhere in the request lifecycle.
 * Same pattern as requestContext in the logging module.
 */

const storage = new AsyncLocalStorage<TenantStore>()

/*
 * Run a callback within a tenant context
 */
function run<T>(tenant: TenantRecord, callback: () => T): T
{
	const store: TenantStore = {
		tenant,
		tenantId: tenant.id,
	}

	return storage.run(store, callback)
}

/*
 * Get the current tenant — undefined outside a tenant-scoped request
 */
function current(): TenantRecord | undefined
{
	return storage.getStore()?.tenant
}

/*
 * Get the current tenant ID — undefined outside a tenant-scoped request
 */
function currentId(): string | undefined
{
	return storage.getStore()?.tenantId
}

/*
 * Require the current tenant — throws if not in a tenant context
 */
// NOT `require`. TypeScript reserves that name in a module's top-level scope
// (TS2441), so the emit build failed on it while `type-check` and the whole
// vitest suite passed — the error only surfaces under `tsc` with emit.
// The PUBLIC name is unchanged: the object literal below still exposes
// `tenantContext.require`, so no caller moves.
function requireTenant(): TenantRecord
{
	const tenant = current()

	if( ! tenant)
	{
		throw new Error('No tenant context — request is not tenant-scoped')
	}

	return tenant
}

/*
 * Require the current tenant ID — throws if not in a tenant context
 */
function requireId(): string
{
	const id = currentId()

	if( ! id)
	{
		throw new Error('No tenant context — request is not tenant-scoped')
	}

	return id
}

export const tenantContext = { run, current, currentId, require: requireTenant, requireId }
