import { expect } from 'chai'
import { AxiosResponse } from 'axios'
import { appRequest } from '~/test/util'

//----- Tests -----//

describe('api/admin/schedule/stop', () => {
	describe('POST request', () => {
		it('should return 204', async () => {
			// Test
			const result: AxiosResponse = await appRequest.post(
				'/admin/schedule/stop'
			)

			// Assertions
			expect(result.status).to.equal(204)
		})
	})
})
