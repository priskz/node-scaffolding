import { expect } from 'chai'
import { MockSession } from '~/test/mocks'
import { Session } from '~/app/domain'
import { SessionRoot } from './'

describe('app/service/root/session/SessionRoot', () => {
	// Unit
	let service: SessionRoot

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
		it('should return new instance of SessionRoot', async () => {
			// Test
			service = new SessionRoot()

			// Assertions
			expect(service).to.be.an.instanceOf(SessionRoot)
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

	describe.skip('updateActiveAt method', () => {
		it('shoudl update Session activateAt and return void', async () => {
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

	describe.skip('attachUser method', () => {
		it('success should return Session with userId populated', async () => {
			// // Test
			// const result = await service.getOneById(mockSession.id)
			// // Assertions
			// expect(result)
			// 	.to.have.property('id')
			// 	.to.equal(mockSession.id)
		})
	})
})
