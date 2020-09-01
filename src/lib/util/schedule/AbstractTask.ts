import { DateTime } from 'luxon'
import { time } from '~/lib/util'
import {
	SchedulableInterface,
	RunStatus,
	RUN_STATUS,
	TaskStatus,
	TASK_STATUS
} from './'

export abstract class AbstractTask implements SchedulableInterface {
	/*
	 * Task name
	 */
	protected abstract name: string

	/*
	 * Task Description
	 */
	protected description: string = 'Provides base functionality for Task(s)'

	/*
	 * Schedule Time
	 */
	protected schedule = '* * * * *'

	/*
	 * The running status of this task
	 */
	protected state: RunStatus = RUN_STATUS.READY

	/*
	 * The success/fail status when running this task
	 */
	protected status: TaskStatus = TASK_STATUS.UNKNOWN

	/*
	 * Error Message
	 */
	protected error: string | undefined = undefined

	/*
	 * Task Start At Time
	 */
	protected startedAt: DateTime | undefined = undefined

	/*
	 * Task Ended At Time
	 */
	protected endedAt: DateTime | undefined = undefined

	/*
	 * Data
	 */
	protected data: unknown | undefined

	/*
	 * Assume Success (if unknown)
	 */
	protected assume: boolean = true

	/*
	 * Execute
	 */
	protected abstract async execute(): Promise<void>

	/*
	 * Run Task Logic
	 */
	public async run(): Promise<TaskResult> {
		// Start task
		this.start()

		try {
			// Perform logic
			await this.execute()
		} catch (error) {
			// Set error
			this.error = error.message
		}

		// Finish task
		this.finish()

		// Return result
		return this.result()
	}

	/*
	 * Result
	 */
	private result(): TaskResult {
		// Gather results
		return {
			name: this.name,
			status: this.status,
			runtime: this.runtime(),
			startedAt: this.startedAt,
			endedAt: this.endedAt,
			state: this.state,
			error: this.error,
			data: this.data
		}
	}

	/*
	 * Runtime
	 */
	private runtime(): number | undefined {
		// Need end and start to determine
		if (this.endedAt && this.startedAt) {
			return this.endedAt.diff(this.startedAt).toObject().milliseconds
		}
	}

	/*
	 * Start Task
	 */
	protected start(): void {
		// Set state to started
		this.state = RUN_STATUS.STARTED

		// Set state
		this.startedAt = time.now()
	}

	/*
	 * Finish Task
	 */
	protected finish(): void {
		// Set state
		this.endedAt = time.now()

		// Set fail if error
		if (this.error) this.fail()

		// Check if assumed success
		if (this.status === TASK_STATUS.UNKNOWN && this.assume) {
			// Set success
			this.success()
		}

		// Set state
		this.state = RUN_STATUS.FINISHED
	}

	/*
	 * Set SUCCESS status
	 */
	protected success(): void {
		// Set state
		this.status = TASK_STATUS.SUCCESS
	}

	/*
	 * Set FAIL task status
	 */
	protected fail(): void {
		// Set state
		this.status = TASK_STATUS.FAIL
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

export interface TaskResult {
	name: string
	status: TaskStatus
	state: RunStatus
	startedAt: DateTime | undefined
	endedAt: DateTime | undefined
	runtime: number | undefined
	error?: string
	data?: unknown
}
