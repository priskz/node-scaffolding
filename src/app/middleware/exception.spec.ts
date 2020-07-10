import { expect } from 'chai'
import { AxiosResponse } from 'axios'
import { appRequest } from '~/test/util'

//----- Tests -----//

describe('middleware/exception', () => {
	// ENV start value
	const debugMode = process.env.DEBUG_MODE

	describe('error is thrown', () => {
		it('should catch error, log, handle gracefully, and return 500', async () => {
			// Test
			const result: AxiosResponse = await appRequest.post('/error')

			// Assertions
			expect(result.status).to.equal(500)
		})
	})

	describe('error is thrown while env DEBUG_MODE true', () => {
		it('should return 500 with detail in body', async () => {
			// Set env
			process.env.DEBUG_MODE = 'true'

			// Test
			const result: AxiosResponse = await appRequest.post('/error')

			// Clean Up
			process.env.DEBUG_MODE = debugMode

			// Assertions
			expect(result.status).to.equal(500)
			expect(result.data).to.not.be.empty
		})
	})

	describe('error is thrown while env DEBUG_MODE false', () => {
		it('should return 500 with empty body', async () => {
			// Set env
			process.env.DEBUG_MODE = 'false'

			// Test
			const result: AxiosResponse = await appRequest.post('/error')

			// Clean Up
			process.env.DEBUG_MODE = debugMode

			// Assertions
			expect(result.status).to.equal(500)
			expect(result.data).to.be.empty
		})
	})
})
