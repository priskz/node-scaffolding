import { expect } from 'chai'
import { AbstractTask, RUN_STATUS, TASK_STATUS } from './'

//----- Data -----//

const testTaskName = 'test-task'
const testTaskDescription = 'Test Task Description'

class TestTask extends AbstractTask {
	/*
	 * Task Name
	 */
	protected name = testTaskName

	/*
	 * Task Description
	 */
	public description = testTaskDescription

	/*
	 * Execute
	 */
	protected async execute(): Promise<void> {
		console.log('Test AbstractTaskGroup Anon Task')
	}
}

//----- Tests -----//

describe('lib/util/schedule/AbstractTask', () => {
	describe('constructor method', () => {
		it('should return new instance of AbstractTask', async () => {
			// Test
			const result = new TestTask()

			// Assertions
			expect(result).to.be.an.instanceOf(AbstractTask)
		})
	})

	describe('set && get schedule property methods', () => {
		it('should equal test schedule value', async () => {
			// Data
			const testTask = new TestTask()
			const schedule = '59 * * * *'

			// Call setter
			testTask.setSchedule(schedule)

			// Test
			const result = testTask.getSchedule()

			// Assertions
			expect(result).to.equal(schedule)
		})
	})

	describe('getName() method', () => {
		it('should return name property', async () => {
			// Data
			const testTask = new TestTask()

			// Test
			const result = testTask.getName()

			// Assertions
			expect(result).to.equal(testTaskName)
		})
	})

	describe('getDescription() method', () => {
		it('should return description property', async () => {
			// Data
			const testTask = new TestTask()

			// Test
			const result = testTask.getDescription()

			// Assertions
			expect(result).to.equal(testTaskDescription)
		})
	})

	describe('run() method', () => {
		it('should return success/finished results', async () => {
			// Data
			const testTask = new TestTask()

			// Test
			const result = await testTask.run()

			// Assertions
			expect(result.state).to.equal(RUN_STATUS.FINISHED)
			expect(result.status).to.equal(TASK_STATUS.SUCCESS)
		})
	})
})
