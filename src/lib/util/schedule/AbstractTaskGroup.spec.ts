import { expect } from 'chai'
import { AbstractTaskGroup, AnonTask, RUN_STATUS, TASK_STATUS } from './'

//----- Data -----//

const testTaskGroupName = 'test-task-group'
const testTaskGroupDescription = 'Test Task Group Description'

class TestTaskGroup extends AbstractTaskGroup {
	/*
	 * Task Group Name
	 */
	protected name = testTaskGroupName

	/*
	 * Task Group Description
	 */
	protected description = testTaskGroupDescription
}

const task = new AnonTask(() => {
	console.log('Test AbstractTaskGroup Anon Task')
})

//----- Tests -----//

describe('lib/util/schedule/AbstractTaskGroup', () => {
	describe('constructor method', () => {
		it('should return new instance of AbstractTaskGroup', async () => {
			// Test
			const result = new TestTaskGroup([task])

			// Assertions
			expect(result).to.be.an.instanceOf(AbstractTaskGroup)
		})
	})

	describe('set && get schedule property methods', () => {
		it('should equal test schedule value', async () => {
			// Data
			const testTaskGroup = new TestTaskGroup([task])
			const schedule = '59 * * * *'

			// Call setter
			testTaskGroup.setSchedule(schedule)

			// Test
			const result = testTaskGroup.getSchedule()

			// Assertions
			expect(result).to.equal(schedule)
		})
	})

	describe('getName() method', () => {
		it('should return name property', async () => {
			// Data
			const testTaskGroup = new TestTaskGroup([task])

			// Test
			const result = testTaskGroup.getName()

			// Assertions
			expect(result).to.equal(testTaskGroupName)
		})
	})

	describe('getDescription() method', () => {
		it('should return description property', async () => {
			// Data
			const testTaskGroup = new TestTaskGroup([task])

			// Test
			const result = testTaskGroup.getDescription()

			// Assertions
			expect(result).to.equal(testTaskGroupDescription)
		})
	})

	describe('run() method', () => {
		it('should return success/finished results', async () => {
			// Data
			const testTask = new TestTaskGroup([task, task])

			// Test
			const result = await testTask.run()

			// Assertions
			expect(result[0].state).to.equal(RUN_STATUS.FINISHED)
			expect(result[0].status).to.equal(TASK_STATUS.SUCCESS)
			expect(result[1].state).to.equal(RUN_STATUS.FINISHED)
			expect(result[1].status).to.equal(TASK_STATUS.SUCCESS)
		})
	})
})
