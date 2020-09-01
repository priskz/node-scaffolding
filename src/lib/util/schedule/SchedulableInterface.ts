export interface SchedulableInterface {
	/*
	 * Name prop getter
	 */
	getName(): string

	/*
	 * Description prop getter
	 */
	getDescription(): string

	/*
	 * Schedule prop getter
	 */
	getSchedule(): string

	/*
	 * Schedule prop setter
	 */
	setSchedule(schedule: string): void
}
