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

	describe('touch method', () => {
		it('should update Session activateAt and return void', async () => {
			// Current session
			const beforeSession = (await service.getOneById(
				mockSession.id
			)) as Session

			// Test1
			const result1 = await service.touch(beforeSession.id)

			// Test2
			const result2 = (await service.getOneById(mockSession.id)) as Session

			// Assertions
			expect(result1).to.be.undefined
			expect(result2.activeAt).to.not.equal(beforeSession.activeAt)
			expect(result2.updatedAt).to.not.equal(beforeSession.updatedAt)
		})
	})
})
