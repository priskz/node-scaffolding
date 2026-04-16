import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DataService } from './DataService'

interface Row { id: string; name: string }

function mockRepository()
{
	return {
		get: vi.fn(),
		getWithCount: vi.fn(),
		paginate: vi.fn(),
		cursorPaginate: vi.fn(),
		getOne: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
		restore: vi.fn(),
		forceDelete: vi.fn(),
	}
}

describe('lib/service/DataService', () =>
{
	let repo: ReturnType<typeof mockRepository>
	let service: DataService<Row>

	beforeEach(() =>
	{
		repo = mockRepository()
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		service = new DataService<Row>(repo as any)
	})

	it('get delegates to repository.get', async () =>
	{
		const rows: Row[] = [{ id: '1', name: 'Alice' }]
		repo.get.mockResolvedValue(rows)

		const result = await service.get({ where: { id: '1' } })

		expect(result).toBe(rows)
		expect(repo.get).toHaveBeenCalledWith({ where: { id: '1' } })
	})

	it('get with no args delegates with an empty query', async () =>
	{
		repo.get.mockResolvedValue([])
		await service.get()
		expect(repo.get).toHaveBeenCalledWith({})
	})

	it('getWithCount delegates', async () =>
	{
		repo.getWithCount.mockResolvedValue([[], 0])
		await service.getWithCount({ where: {} })
		expect(repo.getWithCount).toHaveBeenCalled()
	})

	it('paginate delegates to repository.paginate', async () =>
	{
		const page = { data: [], total: 0, page: 1, perPage: 20 }
		repo.paginate.mockResolvedValue(page)

		const result = await service.paginate({ where: {} }, { page: 1, perPage: 20 })

		expect(result).toBe(page)
		expect(repo.paginate).toHaveBeenCalledWith({ where: {} }, { page: 1, perPage: 20 })
	})

	it('cursorPaginate delegates', async () =>
	{
		repo.cursorPaginate.mockResolvedValue({ data: [], nextCursor: null })
		await service.cursorPaginate({}, { limit: 10 })
		expect(repo.cursorPaginate).toHaveBeenCalled()
	})

	it('getOne delegates', async () =>
	{
		const row: Row = { id: '1', name: 'Alice' }
		repo.getOne.mockResolvedValue(row)

		expect(await service.getOne({ where: { id: '1' } })).toBe(row)
	})

	it('create delegates', async () =>
	{
		repo.create.mockResolvedValue({ id: '1', name: 'Alice' })
		await service.create({ name: 'Alice' })
		expect(repo.create).toHaveBeenCalledWith({ name: 'Alice' })
	})

	it('update delegates', async () =>
	{
		repo.update.mockResolvedValue({ id: '1', name: 'Bob' })
		await service.update({ id: '1', name: 'Bob' })
		expect(repo.update).toHaveBeenCalledWith({ id: '1', name: 'Bob' })
	})

	it('delete delegates and returns the boolean result', async () =>
	{
		repo.delete.mockResolvedValue(true)
		expect(await service.delete('1')).toBe(true)
		expect(repo.delete).toHaveBeenCalledWith('1')
	})

	it('restore delegates', async () =>
	{
		repo.restore.mockResolvedValue({ id: '1', name: 'Alice' })
		await service.restore('1')
		expect(repo.restore).toHaveBeenCalledWith('1')
	})

	it('forceDelete delegates', async () =>
	{
		repo.forceDelete.mockResolvedValue(true)
		expect(await service.forceDelete('1')).toBe(true)
		expect(repo.forceDelete).toHaveBeenCalledWith('1')
	})
})
