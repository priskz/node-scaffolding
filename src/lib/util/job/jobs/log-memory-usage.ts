import { log } from '~/lib/util/log'
import type { JobDefinition } from '../types'

function bytesToMegabytes(bytes: number): number
{
	return Math.round((bytes / 1024 / 1024) * 100) / 100
}

export const logMemoryUsage: JobDefinition = {
	name: 'log-memory-usage',
	description: 'Logs current process memory usage',
	repeat: { pattern: '* * * * *' },
	handler: async () =>
	{
		// Capture memory usage
		const memory = process.memoryUsage()

		// Log it
		log.info({
			heapPercent: `${((memory.heapUsed / memory.heapTotal) * 100).toFixed(2)}%`,
			heapUsed: `${bytesToMegabytes(memory.heapUsed)} MB`,
			heapTotal: `${bytesToMegabytes(memory.heapTotal)} MB`,
			external: `${bytesToMegabytes(memory.external)} MB`,
			arrayBuffers: `${bytesToMegabytes(memory.arrayBuffers)} MB`,
			rss: `${bytesToMegabytes(memory.rss)} MB`,
		}, 'Memory usage')
	},
}
