import { expect } from 'chai'
import { SessionService } from './'

describe('app/service/data/session/SessionService', () => {
	// Unit
	let service: SessionService

	describe('constructor method', () => {
		it('should return new instance of SessionService', async () => {
			// Test
			service = new SessionService()

			// Assertions
			expect(service).to.be.an.instanceOf(SessionService)
		})
	})

	describe.skip('expire method', () => {
		it('success update should return true', async () => {
			// // Test
			// const result = await service.getOneById(mockSession.id)
			// // Assertions
			// expect(result)
			// 	.to.have.property('id')
			// 	.to.equal(mockSession.id)
		})

		it('failure to update should return false', async () => {
			// // Test
			// const result = await service.getOneById(mockSession.id)
			// // Assertions
			// expect(result)
			// 	.to.have.property('id')
			// 	.to.equal(mockSession.id)
		})
	})
})
