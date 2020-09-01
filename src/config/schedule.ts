import { JobScheduleConfig, LogMemoryUsage } from '~/lib/util/schedule'

export const schedule: ScheduleConfig = {
	enable: true,
	jobs: [
		{
			execute: new LogMemoryUsage(),
			schedule: '* * * * *'
		}
	]
}

export interface ScheduleConfig {
	enable: boolean
	jobs: JobScheduleConfig[]
}
