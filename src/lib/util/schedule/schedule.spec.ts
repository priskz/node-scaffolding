import { expect } from 'chai'
import { schedule, Scheduler } from './'

//----- Tests -----//

describe('lib/util/schedule/schedule', () => {
	describe('scheduler() method', () => {
		it('should return existing instance of Scheduler', async () => {
			// Test
			const result = schedule.scheduler()

			// Assertions
			expect(result).to.be.an.instanceOf(Scheduler)
		})
	})
})
