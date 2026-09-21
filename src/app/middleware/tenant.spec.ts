import { describe, it, expect, vi, beforeEach } from 'vitest'

/*
 * Mock database
 */
const mockFindUnique = vi.fn()

vi.mock('~/lib/util/database', () => ({
	database: {
		client: () => ({
			tenant: { findUnique: mockFindUnique },
		}),
	},
}))

vi.mock('~/lib/util/log', () =>
{
	const child = vi.fn(() => ({
		debug: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn(),
	}))

	return { log: { child } }
})

/*
 * Mock env — tenancy enabled, header resolver, X-Tenant-ID header
 */
vi.mock('~/lib/util/env', () => ({
	env: {
		TENANCY_ENABLED: 'true',
		TENANCY_STRATEGY: 'row',
		TENANCY_RESOLVER: 'header',
		TENANCY_HEADER: 'X-Tenant-ID',
	},
}))

import { tenantMiddleware } from './tenant'
import type { Request, Response, NextFunction } from 'express'

function mockRequest(headers: Record<string, string> = {}): Partial<Request>
{
	return {
		headers: Object.fromEntries(
			Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v])
		),
		hostname: 'localhost',
		path: '/',
	}
}

function mockResponse(): Partial<Response>
{
	const res: Partial<Response> = {
		status: vi.fn().mockReturnThis() as unknown as Response['status'],
		json: vi.fn().mockReturnThis() as unknown as Response['json'],
	}
	return res
}

describe('TenantMiddleware', () =>
{
	let next: NextFunction

	beforeEach(() =>
	{
		vi.clearAllMocks()
		next = vi.fn()
	})

	it('should resolve tenant from header and set context', async () =>
	{
		const tenant = { id: 't1', name: 'Acme', slug: 'acme', status: 'active' }
		mockFindUnique.mockResolvedValue(tenant)

		const req = mockRequest({ 'X-Tenant-ID': 'acme' })
		const res = mockResponse()

		tenantMiddleware(req as Request, res as Response, next)

		// Wait for async tenant lookup
		await vi.waitFor(() => expect(next).toHaveBeenCalled())

		expect(req.tenantId).toBe('t1')
		expect(req.tenant).toEqual({ id: 't1', name: 'Acme', slug: 'acme', status: 'active' })
	})

	it('should return 400 when no tenant slug resolved', () =>
	{
		const req = mockRequest({})
		const res = mockResponse()

		tenantMiddleware(req as Request, res as Response, next)

		expect(res.status).toHaveBeenCalledWith(400)
		expect(next).not.toHaveBeenCalled()
	})

	it('should return 404 when tenant not found in database', async () =>
	{
		mockFindUnique.mockResolvedValue(null)

		const req = mockRequest({ 'X-Tenant-ID': 'unknown' })
		const res = mockResponse()

		tenantMiddleware(req as Request, res as Response, next)

		await vi.waitFor(() => expect(res.status).toHaveBeenCalledWith(404))

		expect(next).not.toHaveBeenCalled()
	})

	it('should return 403 when tenant is not active', async () =>
	{
		mockFindUnique.mockResolvedValue({ id: 't2', name: 'Suspended Co', slug: 'suspended', status: 'suspended' })

		const req = mockRequest({ 'X-Tenant-ID': 'suspended' })
		const res = mockResponse()

		tenantMiddleware(req as Request, res as Response, next)

		await vi.waitFor(() => expect(res.status).toHaveBeenCalledWith(403))

		expect(next).not.toHaveBeenCalled()
	})

	it('should call next with error when lookup fails', async () =>
	{
		const dbError = new Error('connection refused')
		mockFindUnique.mockRejectedValue(dbError)

		const req = mockRequest({ 'X-Tenant-ID': 'acme' })
		const res = mockResponse()

		tenantMiddleware(req as Request, res as Response, next)

		await vi.waitFor(() => expect(next).toHaveBeenCalledWith(dbError))
	})
})
