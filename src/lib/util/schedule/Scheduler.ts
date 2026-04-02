import { Job } from 'node-schedule'
import { log } from '~/lib/util'
import { AbstractTask, AbstractTaskGroup } from './'

export class Scheduler
{
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
	constructor(stack: (AbstractTask | AbstractTaskGroup)[] = [])
	{
		this.stack = stack
	}

	/*
	 * Start Running Schedule
	 */
	public async start(): Promise<void>
	{
		log.info('Schedule starting')

		// Check if already running
		if(this.job.length > 0)
		{
			log.error('Schedule unable to start, jobs already running')
			return
		}

		// Iterate runnable stack
		for(let i = 0; i < this.stack.length; i++)
		{
			const job = this.stack[i]

			// Create cron job
			this.job[i] = new Job(job.getName(), () =>
			{
				job.run()
			})

			// Schedule job
			const scheduled = this.job[i].schedule(job.getSchedule())

			if(scheduled)
			{
				log.info(
					{ name: job.getName(), schedule: job.getSchedule(), description: job.getDescription() },
					'Schedule job scheduled'
				)
			}
		}

		if(this.job.length > 0 && this.stack.length === this.job.length)
		{
			log.info('Schedule started')
		}
	}

	/*
	 * Stop Running Schedule
	 */
	public async stop(): Promise<void>
	{
		log.info('Schedule stopping')

		for(let i = 0; i < this.job.length; i++)
		{
			const cancelled = this.job[i].cancel()

			if(cancelled)
			{
				this.job.splice(i, 1)
			}
			else
			{
				log.error({ task: this.stack[i]?.getName() }, 'Schedule job not cancelled')
			}
		}

		if(this.job.length > 0)
		{
			log.error({ remaining: this.job.length }, 'Schedule jobs not stopped')
		}
		else
		{
			log.info('Schedule stopped')
		}
	}

	/*
	 * Job property getter
	 */
	public getJob(): Job[]
	{
		return this.job
	}

	/*
	 * Stack property getter
	 */
	public getStack(): (AbstractTask | AbstractTaskGroup)[]
	{
		return this.stack
	}
}
