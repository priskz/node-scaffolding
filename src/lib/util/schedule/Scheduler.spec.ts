import { expect } from 'chai'
import { AbstractTask, Scheduler } from './'

//----- Data -----//

class TestTask extends AbstractTask {
	/*
	 * Task Name
	 */
	protected name = 'test-task'

	/*
	 * Task Description
	 */
	public description = 'Test Task Description'

	/*
	 * Execute
	 */
	protected async execute(): Promise<void> {
		console.log('Test AbstractTask Anon Task')
	}
}

//----- Tests -----//

describe('lib/util/schedule/Scheduler', () => {
	describe('constructor method', () => {
		it('should return new instance of Scheduler', async () => {
			// Test
			const result = new Scheduler()

			// Assertions
			expect(result).to.be.an.instanceOf(Scheduler)
		})
	})

	describe('start() && stop() methods', () => {
		// Setup
		const scheduler = new Scheduler([new TestTask()])

		it('should start the scheduler', async () => {
			// Test
			await scheduler.start()

			// Assertions
			expect(scheduler.getJob().length).to.equal(1)
			expect(scheduler.getStack().length).to.equal(1)
		})

		it('should stop the scheduler', async () => {
			// Test
			await scheduler.stop()

			// Assertions
			expect(scheduler.getJob().length).to.equal(0)
			expect(scheduler.getStack().length).to.equal(1)
		})
	})
})
