import { describe, it, expect, beforeEach, vi } from 'vitest'

const mockQueueAdd = vi.fn()
const mockQueueClose = vi.fn()
const mockQueueUpsertJobScheduler = vi.fn()
const mockWorkerClose = vi.fn()
const mockWorkerOn = vi.fn()

vi.mock('bullmq', () =>
{
	return {
		Queue: function()
		{
			return {
				add: mockQueueAdd,
				close: mockQueueClose,
				upsertJobScheduler: mockQueueUpsertJobScheduler,
			}
		},
		Worker: function()
		{
			return {
				close: mockWorkerClose,
				on: mockWorkerOn,
			}
		},
	}
})

vi.mock('~/lib/util/log', () =>
{
	const child = vi.fn().mockReturnValue({
		info: vi.fn(),
		debug: vi.fn(),
		warn: vi.fn(),
		error: vi.fn(),
	})

	return { log: { child } }
})

import { job } from './job-service'

describe('lib/util/job/job-service', () =>
{
	beforeEach(() =>
	{
		job.reset()
		vi.clearAllMocks()
	})

	describe('init', () =>
	{
		it('should initialize without error', () =>
		{
			expect(() => job.init({ host: 'localhost', port: 6379 })).not.toThrow()
		})
	})

	describe('define', () =>
	{
		it('should register a job definition', () =>
		{
			// Action
			job.define({
				name: 'test-job',
				description: 'A test job',
				handler: async () => {},
			})

			// Assert
			const jobs = job.list()
			expect(jobs).toHaveLength(1)
			expect(jobs[0].name).toBe('test-job')
			expect(jobs[0].active).toBe(false)
		})
	})

	describe('start', () =>
	{
		it('should throw if not initialized', async () =>
		{
			await expect(job.start()).rejects.toThrow('JobService not initialized')
		})

		it('should create queue and worker for each defined job', async () =>
		{
			// Init
			job.init({ host: 'localhost', port: 6379 })
			job.define({
				name: 'test-job',
				description: 'A test job',
				handler: async () => {},
			})

			// Action
			await job.start()

			// Assert
			const jobs = job.list()
			expect(jobs[0].active).toBe(true)
		})

		it('should schedule repeat jobs', async () =>
		{
			// Init
			job.init({ host: 'localhost', port: 6379 })
			job.define({
				name: 'repeat-job',
				description: 'Runs every minute',
				handler: async () => {},
				repeat: { pattern: '* * * * *' },
			})

			// Action
			await job.start()

			// Assert
			expect(mockQueueUpsertJobScheduler).toHaveBeenCalledWith(
				'repeat-job-repeat',
				{ pattern: '* * * * *', limit: undefined },
				{ name: 'repeat-job', data: {} }
			)
		})
	})

	describe('dispatch', () =>
	{
		it('should throw if queue not found', async () =>
		{
			await expect(job.dispatch('nonexistent')).rejects.toThrow('not found')
		})

		it('should add a job to the queue', async () =>
		{
			// Init
			job.init({ host: 'localhost', port: 6379 })
			job.define({
				name: 'dispatch-job',
				description: 'Dispatchable',
				handler: async () => {},
			})
			await job.start()

			// Action
			await job.dispatch('dispatch-job', { key: 'value' })

			// Assert
			expect(mockQueueAdd).toHaveBeenCalledWith('dispatch-job', { key: 'value' })
		})
	})

	describe('list', () =>
	{
		it('should return empty array when no jobs defined', () =>
		{
			expect(job.list()).toEqual([])
		})

		it('should return all defined jobs with status', async () =>
		{
			// Init
			job.init({ host: 'localhost', port: 6379 })
			job.define({ name: 'a', description: 'Job A', handler: async () => {} })
			job.define({ name: 'b', description: 'Job B', handler: async () => {}, repeat: { pattern: '0 * * * *' } })

			// Before start
			const before = job.list()
			expect(before[0].active).toBe(false)
			expect(before[1].active).toBe(false)

			// After start
			await job.start()
			const after = job.list()
			expect(after[0].active).toBe(true)
			expect(after[1].active).toBe(true)
			expect(after[1].repeat?.pattern).toBe('0 * * * *')
		})
	})

	describe('close', () =>
	{
		it('should close all queues and workers', async () =>
		{
			// Init
			job.init({ host: 'localhost', port: 6379 })
			job.define({ name: 'closable', description: 'Will close', handler: async () => {} })
			await job.start()

			// Action
			await job.close()

			// Assert
			expect(mockWorkerClose).toHaveBeenCalled()
			expect(mockQueueClose).toHaveBeenCalled()
		})
	})

	describe('getQueues', () =>
	{
		it('should return raw queue instances', async () =>
		{
			// Init
			job.init({ host: 'localhost', port: 6379 })
			job.define({ name: 'q1', description: 'Queue 1', handler: async () => {} })
			await job.start()

			// Action
			const queues = job.getQueues()

			// Assert
			expect(queues).toHaveLength(1)
		})
	})

	describe('reset', () =>
	{
		it('should clear all state', () =>
		{
			// Init
			job.define({ name: 'x', description: 'Will reset', handler: async () => {} })

			// Action
			job.reset()

			// Assert
			expect(job.list()).toEqual([])
			expect(job.getQueues()).toEqual([])
		})
	})
})
