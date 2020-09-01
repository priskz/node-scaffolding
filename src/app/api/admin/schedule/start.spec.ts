import { expect } from 'chai'
import { AxiosResponse } from 'axios'
import { appRequest } from '~/test/util'

//----- Tests -----//

describe('api/admin/schedule/start', () => {
	describe('POST request', () => {
		it('should return 204', async () => {
			// Test
			const result: AxiosResponse = await appRequest.post(
				'/admin/schedule/start'
			)

			// Assertions
			expect(result.status).to.equal(204)
		})
	})
})
