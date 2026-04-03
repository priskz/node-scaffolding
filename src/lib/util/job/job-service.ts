import { Queue, Worker } from 'bullmq'
import type { Job as BullJob } from 'bullmq'
import { log } from '~/lib/util/log'
import type { JobDefinition, JobInfo } from './types'

let _logger: ReturnType<typeof log.child>

function _log(): ReturnType<typeof log.child>
{
	if( ! _logger)
	{
		_logger = log.child('JobService')
	}
	return _logger
}

const _definitions: Map<string, JobDefinition> = new Map()
const _queues: Map<string, Queue> = new Map()
const _workers: Map<string, Worker> = new Map()

let _connection: { host: string; port: number } | undefined

/*
 * Initialize the job service with Valkey/Redis connection
 */
function init(options: { host: string; port: number }): void
{
	_connection = options
	_log().info('job service initialized')
}

/*
 * Register a job definition
 */
function define(definition: JobDefinition): void
{
	_definitions.set(definition.name, definition)
}

/*
 * Start all registered jobs — creates queues and workers
 */
async function start(): Promise<void>
{
	// Not initialized?
	if( ! _connection)
	{
		throw new Error('JobService not initialized — call job.init() first')
	}

	for(const [name, definition] of _definitions)
	{
		// Already running?
		if(_queues.has(name)) continue

		// Create queue
		const queue = new Queue(name, { connection: _connection })
		_queues.set(name, queue)

		// Create worker
		const worker = new Worker(
			name,
			async (bullJob: BullJob<Record<string, unknown>>) =>
			{
				await definition.handler(bullJob.data)
			},
			{
				connection: _connection,
				concurrency: definition.concurrency ?? 1,
			}
		)

		// Worker events
		worker.on('completed', (bullJob: BullJob) =>
		{
			_log().debug({ job: name, id: bullJob.id }, 'job completed')
		})

		worker.on('failed', (bullJob: BullJob | undefined, err: Error) =>
		{
			_log().warn({ job: name, id: bullJob?.id, error: err.message }, 'job failed')
		})

		_workers.set(name, worker)

		// Schedule repeat job?
		if(definition.repeat)
		{
			await queue.upsertJobScheduler(
				`${name}-repeat`,
				{ pattern: definition.repeat.pattern, limit: definition.repeat.limit },
				{ name, data: {} }
			)

			_log().info(
				{ name, pattern: definition.repeat.pattern },
				'repeat job scheduled'
			)
		}

		_log().info({ name, description: definition.description }, 'job registered')
	}
}

/*
 * Dispatch a one-off job
 */
async function dispatch(name: string, data: Record<string, unknown> = {}): Promise<void>
{
	const queue = _queues.get(name)

	// Queue not found?
	if( ! queue)
	{
		throw new Error(`Job queue "${name}" not found — is it registered and started?`)
	}

	await queue.add(name, data)
	_log().debug({ name }, 'job dispatched')
}

/*
 * List all registered jobs
 */
function list(): JobInfo[]
{
	const jobs: JobInfo[] = []

	for(const [name, definition] of _definitions)
	{
		jobs.push({
			name,
			description: definition.description,
			repeat: definition.repeat,
			active: _queues.has(name),
		})
	}

	return jobs
}

/*
 * Stop all queues and workers
 */
async function close(): Promise<void>
{
	for(const [name, worker] of _workers)
	{
		await worker.close()
		_log().debug({ name }, 'worker closed')
	}

	for(const [name, queue] of _queues)
	{
		await queue.close()
		_log().debug({ name }, 'queue closed')
	}

	_workers.clear()
	_queues.clear()

	_log().info('job service closed')
}

/*
 * Get the raw BullMQ Queue instances — for Bull Board
 */
function getQueues(): Queue[]
{
	return Array.from(_queues.values())
}

/*
 * Reset — for testing
 */
function reset(): void
{
	_definitions.clear()
	_queues.clear()
	_workers.clear()
	_connection = undefined
}

export const job = { init, define, start, dispatch, list, close, getQueues, reset }
