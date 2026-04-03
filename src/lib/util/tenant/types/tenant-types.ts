/*
 * Tenant Types
 *
 * Row-level tenancy only in Stage 1.
 * Schema-per-tenant interface defined but throws NotImplementedError.
 */

export type TenancyStrategy = 'row' | 'schema'

export type TenantResolver = 'header' | 'subdomain' | 'path'

export type TenantStatus = 'active' | 'suspended' | 'archived'

export interface TenantRecord
{
	id: string
	name: string
	slug: string
	status: TenantStatus
}

export interface TenantStore
{
	tenant: TenantRecord
	tenantId: string
}
