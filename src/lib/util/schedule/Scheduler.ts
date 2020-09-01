import { Job } from 'node-schedule'
import { log } from '~/lib/util'
import { AbstractTask, AbstractTaskGroup } from './'

export class Scheduler {
	/*
	 * Runnable Job/Task(s) Stack
	 */
	protected stack: (AbstractTask | AbstractTaskGroup)[]

	/*
	 * Scheduled Job Instances
	 */
	protected job: Job[] = []

	/*
	 * Construct
	 */
	constructor(stack: (AbstractTask | AbstractTaskGroup)[] = []) {
		// Set stack
		this.stack = stack
	}

	/*
	 * Start Running Schedule
	 */
	public async start(): Promise<void> {
		// Log info
		log.info('Schedule: starting')

		// Check if already running
		if (this.job.length > 0) {
			// Log error
			log.error('Schedule: unable to start schedule, jobs running')
			return
		}

		// Iterate runnable stack
		for (let i = 0; i < this.stack.length; i++) {
			// Get task/job
			const job = this.stack[i]

			// Create cron job
			this.job[i] = new Job(job.getName(), () => {
				job.run()
			})

			// Schedule job
			const scheduled = this.job[i].schedule(job.getSchedule())

			// Success
			if (scheduled) {
				// Log info
				log.info('Schedule: job scheduled', {
					name: job.getName(),
					schedule: job.getSchedule(),
					description: job.getDescription()
				})
			}
		}

		// All jobs started
		if (this.job.length > 0 && this.stack.length === this.job.length) {
			// Log info
			log.info('Schedule: started')
		}
	}

	/*
	 * Stop Running Schedule
	 */
	public async stop(): Promise<void> {
		// Log info
		log.info('Schedule: stopping')

		// Iterate runnable stack
		for (let i = 0; i < this.job.length; i++) {
			// Cancel job
			const cancelled = this.job[i].cancel()

			// Cancelled?
			if (cancelled) {
				// Remove job
				this.job.splice(i, 1)
			} else {
				// Log error
				log.error('Schedule: job not cancelled', this.stack[i])
			}
		}

		// Log based on results
		if (this.job.length > 0) {
			// Log error
			log.error('Schedule: jobs not stopped', { job: this.job })
		} else {
			// Log info
			log.info('Schedule: stopped')
		}
	}

	/*
	 * Job property getter
	 */
	public getJob(): Job[] {
		return this.job
	}

	/*
	 * Stack property getter
	 */
	public getStack(): (AbstractTask | AbstractTaskGroup)[] {
		return this.stack
	}
}
