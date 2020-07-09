import { expect } from 'chai'
import { AxiosResponse } from 'axios'
import { appRequest } from '~/test/util'

//----- Tests -----//

describe('api/aux/error', () => {
	describe('empty POST request', () => {
		it('should return 500', async () => {
			// Test
			const result: AxiosResponse = await appRequest.post('/error')

			// Assertions
			expect(result.status).to.equal(500)
		})
	})

	describe('message data POST request', () => {
		it('should return 500 with given message in body', async () => {
			const message = 'Unit Test Message'

			// Test
			const result: AxiosResponse = await appRequest.post('/error', {
				message
			})

			// Assertions
			expect(result.status).to.equal(500)
			expect(result.data).to.equal(message)
		})
	})
})
