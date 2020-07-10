import { expect } from 'chai'
import { MockSession } from '~/test/mocks'
import { Session } from '~/app/domain'
import { SessionService } from './'

describe('app/service/data/session/SessionService', () => {
	// Unit
	let service: SessionService

	// Mock Session
	let mockSession: Session

	before(async () => {
		// Clean up
		mockSession = await MockSession.create()
	})

	after(async () => {
		// Clean up
		await MockSession.destroy(mockSession.id)
	})

	describe('constructor method', () => {
		it('should return new instance of SessionService', async () => {
			// Test
			service = new SessionService()

			// Assertions
			expect(service).to.be.an.instanceOf(SessionService)
		})
	})

	describe('getOneById method', () => {
		it('if found should return Session', async () => {
			// Test
			const result = await service.getOneById(mockSession.id)

			// Assertions
			expect(result)
				.to.have.property('id')
				.to.equal(mockSession.id)
		})

		it('if NOT found should return undefined', async () => {
			// Test
			const reuslt = await service.getOneById('id-does-not-exist-in-db')

			// Assertions
			expect(reuslt).to.be.undefined
		})
	})

	describe('expire method', () => {
		it('should update Session expiresAt and return void', async () => {
			// Current session
			const beforeSession = (await service.getOneById(
				mockSession.id
			)) as Session

			// Test1
			const result1 = await service.expire(beforeSession.id)

			// Test2
			const result2 = (await service.getOneById(mockSession.id)) as Session

			// Assertions
			expect(result1).to.be.true
			expect(result2.expiresAt).to.not.equal(beforeSession.expiresAt)
			expect(result2.updatedAt).to.not.equal(beforeSession.updatedAt)
		})
	})
})
