import { expect } from 'chai'
import { AxiosResponse } from 'axios'
import { appRequest } from '~/test/util'
import { MockSession, MockUser } from '~/test/mocks'
import { getSessionIdFromHeader } from '~/test/util'
import { config } from '~/config'

//----- Tests -----//

describe('api/auth/logout', () => {
	// Guest user data
	let guestData = MockUser.guest()

	let register: AxiosResponse

	let registerSessionId: string

	before(async () => {
		// Register a user
		register = await appRequest.post('/auth/register', {
			...guestData,
			pass: guestData.password
		})

		// Extract session id
		registerSessionId = getSessionIdFromHeader(
			register.headers['set-cookie'][0]
		)
	})

	after(async () => {
		// Clean up
		await MockSession.destroy(registerSessionId)
		await MockUser.destroy(guestData.email)
	})

	describe('valid cookie is provided', () => {
		it('should return 204 No Content', async () => {
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

	describe('session cookie is not provided', () => {
		it('should return 400 Bad Request', async () => {
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
			const result: AxiosResponse = await appRequest.post('/auth/logout')

			// Extract new session id
			const newSessionId = getSessionIdFromHeader(
				result.headers['set-cookie'][0]
			)

			// Clean up
			await MockSession.destroy(newSessionId)

			// Assertions
			expect(result.status).to.equal(400)
		})
	})
})
