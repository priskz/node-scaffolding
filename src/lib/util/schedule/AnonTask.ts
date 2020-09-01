import { AbstractTask } from './'

export class AnonTask extends AbstractTask {
	/*
	 * Task name
	 */
	public name = 'task.anon'

	/*
	 * Closure
	 */
	protected closure: Function

	/*
	 * Construct
	 */
	constructor(closure: Function) {
		// Parent constructor
		super()

		// Set closure
		this.closure = closure
	}

	/*
	 * Execute
	 */
	protected async execute(): Promise<void> {
		try {
			// Attempt to run
			this.closure()
		} catch (error) {
			// Let error bubble up
			throw error
		}
	}
}

export const AnonTaskInstance = (closure: Function) => {
	return function() {
		return new AnonTask(closure).run()
	}
}
