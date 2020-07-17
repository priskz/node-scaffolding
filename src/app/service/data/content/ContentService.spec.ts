import { expect } from 'chai'
import { MockContent } from '~/test/mocks'
import { Content } from '~/app/domain'
import { ContentService } from './'

//----- Data -----//

let service: ContentService

//----- Tests -----//

describe('app/service/data/content/ContentService', () => {
	before(async () => {
		// Add seed data
		await MockContent.addSeeds()
	})

	after(async () => {
		// Delete seed data
		await MockContent.removeSeeds()
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
		it('if found should return Content', async () => {
			const seed = MockContent.getSeeds()[0]

			// Test
			const result = await service.getOneById(seed.id as string)

			// Assertions
			expect(result)
				.to.have.property('id')
				.to.equal(seed.id as string)
		})

		it('if NOT found should return undefined', async () => {
			// Test
			const reuslt = await service.getOneById('id-does-not-exist-in-db')

			// Assertions
			expect(reuslt).to.be.undefined
		})
	})
})
