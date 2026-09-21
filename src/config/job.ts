import { env } from '~/lib/util/env'
import { logMemoryUsage } from '~/lib/util/job/jobs'
import type { JobDefinition } from '~/lib/util/job'

export const jobConfig: JobConfig = {
	enabled: env.JOB_ENABLED === 'true',
	boardEnabled: env.JOB_BOARD_ENABLED === 'true',
	boardPath: env.JOB_BOARD_PATH,
	jobs: [
		logMemoryUsage,
	],
}

export interface JobConfig
{
	enabled: boolean
	boardEnabled: boolean
	boardPath: string
	jobs: JobDefinition[]
}
