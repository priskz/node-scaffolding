import { AbstractTask, SchedulableInterface } from './'
import { TaskResult } from './AbstractTask'

export abstract class AbstractTaskGroup implements SchedulableInterface {
	/*
	 * Task Group Name
	 */
	protected abstract name: string

	/*
	 * Task Group Description
	 */
	protected abstract description: string =
		'Provides base functionality for Job(s)'

	/*
	 * Schedule Time
	 */
	protected schedule = '* * * * *'

	/*
	 * Task Stack
	 */
	protected stack: AbstractTask[] = []

	/*
	 * Construct
	 */
	constructor(stack?: AbstractTask[]) {
		// Set stack if provided
		if (stack) this.stack = stack
	}

	/*
	 * Run Task Stack
	 */
	public async run(): Promise<TaskResult[]> {
		// Holds results
		const results: TaskResult[] = []

		// Iterate stack
		for (let i = 0; i < this.stack.length; i++) {
			// Task to run
			const task = this.stack[i]

			// Run task
			const result = await task.run()

			// Add to results
			results.push(result)
		}

		// Return results
		return results
	}

	/*
	 * Name prop getter
	 */
	public getName(): string {
		return this.name
	}

	/*
	 * Description prop getter
	 */
	public getDescription(): string {
		return this.description
	}

	/*
	 * Schedule prop getter
	 */
	public getSchedule(): string {
		return this.schedule
	}

	/*
	 * Schedule prop setter
	 */
	public setSchedule(schedule: string): void {
		this.schedule = schedule
	}
}
