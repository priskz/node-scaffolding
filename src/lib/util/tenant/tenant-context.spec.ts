import { describe, it, expect } from 'vitest'
import { tenantContext } from './tenant-context'
import type { TenantRecord } from './types'

const mockTenant: TenantRecord = {
	id: 'tenant-1',
	name: 'Acme Corp',
	slug: 'acme',
	status: 'active',
}

describe('TenantContext', () =>
{
	it('should return undefined outside a tenant scope', () =>
	{
		expect(tenantContext.current()).toBeUndefined()
		expect(tenantContext.currentId()).toBeUndefined()
	})

	it('should provide tenant within a run scope', () =>
	{
		tenantContext.run(mockTenant, () =>
		{
			expect(tenantContext.current()).toEqual(mockTenant)
			expect(tenantContext.currentId()).toBe('tenant-1')
		})
	})

	it('should require tenant — throws outside scope', () =>
	{
		expect(() => tenantContext.require()).toThrow('No tenant context')
		expect(() => tenantContext.requireId()).toThrow('No tenant context')
	})

	it('should require tenant — returns within scope', () =>
	{
		tenantContext.run(mockTenant, () =>
		{
			expect(tenantContext.require()).toEqual(mockTenant)
			expect(tenantContext.requireId()).toBe('tenant-1')
		})
	})

	it('should isolate contexts between nested runs', () =>
	{
		const tenant2: TenantRecord = { id: 'tenant-2', name: 'Beta Inc', slug: 'beta', status: 'active' }

		tenantContext.run(mockTenant, () =>
		{
			expect(tenantContext.currentId()).toBe('tenant-1')

			tenantContext.run(tenant2, () =>
			{
				expect(tenantContext.currentId()).toBe('tenant-2')
			})

			// Back to outer context
			expect(tenantContext.currentId()).toBe('tenant-1')
		})
	})
})
