import { expect } from 'chai'
import { LogMemoryUsage, RUN_STATUS, TASK_STATUS } from './'

//----- Tests -----//

describe('lib/util/schedule/LogMemoryUsage', () => {
	describe('constructor method', () => {
		it('should return new instance of LogMemoryUsage', async () => {
			// Test
			const result = new LogMemoryUsage()

			// Assertions
			expect(result).to.be.an.instanceOf(LogMemoryUsage)
		})
	})

	describe('run method', () => {
		it('should return success TaskResult', async () => {
			// Setup
			const task = new LogMemoryUsage()

			// Test
			const result = await task.run()

			// Assertions
			expect(result)
				.to.have.property('status')
				.equal(TASK_STATUS.SUCCESS)
			expect(result)
				.to.have.property('state')
				.equal(RUN_STATUS.FINISHED)
		})
	})
})
