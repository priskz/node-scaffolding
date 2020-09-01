import {
	AbstractTask,
	AbstractTaskGroup,
	JobScheduleConfig,
	Scheduler
} from './'

/*
 * Global Scheduler Instance
 */
let instance: Scheduler

/*
 * Init Scheduler
 */
function init(stack: (AbstractTask | AbstractTaskGroup)[]): void {
	// Init by stack
	instance = new Scheduler(stack)
}

/*
 * Config & Init Scheduler
 */
function config(schedule: JobScheduleConfig[]): void {
	// Init stack
	const stack: (AbstractTask | AbstractTaskGroup)[] = []

	// Iterate jobs
	for (let i = 0; i < schedule.length; i++) {
		// Get schedule item
		const item = schedule[i].execute
		const interval = schedule[i].schedule

		// Schedule override?
		if (interval) {
			item.setSchedule(interval)
		}

		// Add to stack
		stack.push(item)
	}

	// Initialize
	init(stack)
}

/*
 * Scheduler Instance Getter
 */
function scheduler(): Scheduler {
	return instance
}

/*
 * Start Scheduler
 */
async function start(): Promise<void> {
	return await instance.start()
}

/*
 * Stop Scheduler
 */
async function stop(): Promise<void> {
	return await instance.stop()
}

/*
 * Export Util
 */
export const schedule = {
	config,
	init,
	scheduler,
	start,
	stop
}
