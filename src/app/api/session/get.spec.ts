import { expect } from 'chai'
import { AxiosResponse } from 'axios'
import { appRequest } from '~/test/util'
import { MockSession } from '~/test/mocks'
import { getSessionIdFromHeader } from '~/test/util'

//----- Tests -----//

describe('app/api/session/get', () => {
	describe('cookie does not exist', () => {
		it('should return 204 with new cookie session in cookie header', async () => {
			// Test
			const result: AxiosResponse = await appRequest.get('/session')

			// Extract session id
			const validSessionId = getSessionIdFromHeader(
				result.headers['set-cookie'][0]
			)

			// Clean Up
			await MockSession.destroy(validSessionId)

			// Assertions
			expect(result.status).equal(204)
		})
	})
})
