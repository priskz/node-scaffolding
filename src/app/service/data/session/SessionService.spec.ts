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
})
