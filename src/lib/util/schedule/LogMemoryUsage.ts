import { log } from '~/lib/util'
import { AbstractTask } from './'

export class LogMemoryUsage extends AbstractTask {
	/*
	 * Task name
	 */
	public name = 'task.log.memory-usage'

	/*
	 * Task Description
	 */
	public description = 'Logs memory usage.'

	/*
	 * Execute
	 */
	protected async execute(): Promise<void> {
		// Capture memory usage
		const memory = process.memoryUsage()

		// Log it
		log.info('Memory Usage', {
			heapPercent: `${((memory.heapUsed / memory.heapTotal) * 100).toFixed(
				2
			)}%`,
			heapUsed: `${this.bytesToMegabytes(memory.heapUsed)} MB`,
			heapTotal: `${this.bytesToMegabytes(memory.heapTotal)} MB`,
			external: `${this.bytesToMegabytes(memory.external)} MB`,
			arrayBuffers: `${this.bytesToMegabytes(memory.arrayBuffers)} MB`,
			rss: `${this.bytesToMegabytes(memory.rss)} MB`
		})
	}

	/*
	 * Convert Byte Value To Megabyte Value
	 */
	private bytesToMegabytes(bytes: number): number {
		return Math.round((bytes / 1024 / 1024) * 100) / 100
	}
}
