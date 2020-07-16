import { expect } from 'chai'
import { MockSession } from '~/test/mocks'
import { Session } from '~/app/domain'
import { ContentService } from './'

describe('app/service/data/content/ContentService', () => {
	// Unit
	let service: ContentService

	// Mock Session
	let mockSession: Session

	before(async () => {
		// Clean up
		mockSession = (await MockSession.create()) as Session
	})

	after(async () => {
		// Clean up
		await MockSession.destroy(mockSession.id)
	})

	describe('constructor method', () => {
		it('should return new instance of ContentService', async () => {
			// Test
			service = new ContentService()

			// Assertions
			expect(service).to.be.an.instanceOf(ContentService)
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
})
