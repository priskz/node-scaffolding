import { expect } from 'chai'
import { AnonTask, RUN_STATUS, TASK_STATUS } from './'

//----- Tests -----//

describe('lib/util/schedule/AnonTask', () => {
	describe('constructor method', () => {
		it('should return new instance of AnonTask', async () => {
			// Test
			const result = new AnonTask(() => {
				console.log('Test Anon Task')
			})

			// Assertions
			expect(result).to.be.an.instanceOf(AnonTask)
		})
	})

	describe('run method', () => {
		it('should return success TaskResult', async () => {
			// Setup
			const task = new AnonTask(() => {
				console.log('Test Anon Task')
			})

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

	describe('error during execution', () => {
		it('should return fail TaskResult', async () => {
			// Error message
			const message = 'Forced Test Error'

			// Setup
			const task = new AnonTask(() => {
				throw Error(message)
			})

			// Test
			const result = await task.run()

			// Assertions
			expect(result)
				.to.have.property('status')
				.equal(TASK_STATUS.FAIL)
			expect(result)
				.to.have.property('error')
				.equal(message)
			expect(result)
				.to.have.property('state')
				.equal(RUN_STATUS.FINISHED)
		})
	})
})
