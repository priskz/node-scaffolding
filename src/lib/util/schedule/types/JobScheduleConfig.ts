import { AbstractTask, AbstractTaskGroup } from '../'

export interface JobScheduleConfig {
	execute: AbstractTask | AbstractTaskGroup
	schedule?: string
}
