import { expect } from 'chai'
import { AxiosResponse } from 'axios'
import { appRequest } from '~/test/util'

//----- Tests -----//

describe('api/aux/error', () => {
	// ENV start value
	const debugMode = process.env.DEBUG_MODE

	describe('empty POST request', () => {
		it('should return 500', async () => {
			// Test
			const result: AxiosResponse = await appRequest.post('/error')

			// Assertions
			expect(result.status).to.equal(500)
		})
	})

	describe('message data POST request', () => {
		// Message to send
		const message = 'Unit Test Message'

		it('should return 500 with given message in body while env DEBUG_MODE true', async () => {
			// Set env
			process.env.DEBUG_MODE = 'true'

			// Test
			const result: AxiosResponse = await appRequest.post('/error', {
				message
			})

			// Clean Up
			process.env.DEBUG_MODE = debugMode

			// Assertions
			expect(result.status).to.equal(500)
			expect(result.data).to.equal(message)
		})

		it('should return 500 with empty body while env DEBUG_MODE false', async () => {
			// Set env
			process.env.DEBUG_MODE = 'false'

			// Test
			const result: AxiosResponse = await appRequest.post('/error', {
				message
			})

			// Clean Up
			process.env.DEBUG_MODE = debugMode

			// Assertions
			expect(result.status).to.equal(500)
			expect(result.data).to.not.equal(message)
		})
	})
})
