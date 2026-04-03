import { list } from './job'
import { stack } from './stack'
import { start } from './start'
import { stop } from './stop'

export const ScheduleApi = {
	job: list,
	stack,
	start,
	stop
}
