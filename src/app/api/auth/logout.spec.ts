import { expect } from 'chai'
import { AxiosResponse } from 'axios'
import { appRequest } from '~/test/util'
import { MockSession, MockUser } from '~/test/mocks'
import { getSessionIdFromHeader } from '~/test/util'

//----- Tests -----//

describe('api/auth/logout', () => {
	// Guest user data
	let guestData = MockUser.guest()

	after(async () => {
		// Clean up
		await MockUser.destroy(guestData.email)
	})

	describe('valid cookie is provided', () => {
		it('should return 204 No Content', async () => {
			// Register a user
			const register: AxiosResponse = await appRequest.post('/auth/register', {
				...guestData,
				pass: guestData.password
			})

			// Extract session id
			const registerSessionId = getSessionIdFromHeader(
				register.headers['set-cookie'][0]
			)

			// Get cookie from register
			const cookie = MockSession.getCookie(registerSessionId)

			// Log user in
			await appRequest.post(
				'/auth/login',
				{
					email: guestData.email,
					pass: guestData.password
				},
				{
					headers: { cookie }
				}
			)

			// Test
			const result: AxiosResponse = await appRequest.post(
				'/auth/logout',
				{},
				{
					headers: { cookie }
				}
			)

			// Assertions
			expect(result.status).to.equal(204)
		})
	})

	describe.skip('invalid cookie is provided', () => {
		it('should return 400 Bad Request', async () => {
			//
		})
	})

	describe.skip('failed logout', () => {
		it('should return 500 Bad Request', async () => {
			//
		})
	})
})
