import { expect } from 'chai'
import { search } from './'
import { SearchClient } from './'

//----- Tests -----//

describe('lib/util/search', () => {
	describe('when client function is called prior to init', () => {
		it('should return undefined', async () => {
			// Test
			const result = await search.client()

			// Assertions
			expect(result).to.be.undefined
		})
	})

	describe('when init function is called', () => {
		it('should return true', async () => {
			// Test
			const result = await search.init()

			// Assertions
			expect(result).to.be.true
		})
	})

	describe('when init function has alreay been called more than once', () => {
		it('should return false', async () => {
			// Test
			const result = await search.init()

			// Assertions
			expect(result).to.be.false
		})
	})

	describe('when client function is called', () => {
		it('should return global Client instance', async () => {
			// Test
			const result = search.client()

			// Assertions
			expect(result).to.be.instanceOf(SearchClient)
			expect(result.getIndex()).to.equal('global-index')
		})
	})
})
