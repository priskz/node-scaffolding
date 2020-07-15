import { expect } from 'chai'
import { MockSession, MockUser } from '~/test/mocks'
import { AxiosResponse } from 'axios'
import { appRequest } from '~/test/util'
import { getSessionIdFromHeader } from '~/test/util'

//----- Tests -----//

describe('app/api/auth/register', () => {
	// Guest user data
	let guestData = MockUser.guest()

	after(async () => {
		// Clean up
		await MockUser.destroyByEmail(guestData.email)
	})

	describe('valid input', () => {
		it('should return 204 No Content', async () => {
			// Test
			const result: AxiosResponse = await appRequest.post('/auth/register', {
				...guestData,
				pass: guestData.password
			})

			// Extract session id
			const validSessionId = getSessionIdFromHeader(
				result.headers['set-cookie'][0]
			)

			// Clean Up
			MockSession.destroy(validSessionId)

			// Assertions
			expect(result.status).to.equal(204)
		})
	})

	describe('existing user', () => {
		it('should return 400 Bad Request', async () => {
			// Test
			const result: AxiosResponse = await appRequest.post('/auth/register', {
				...guestData,
				pass: guestData.password
			})

			// Extract session id
			const validSessionId = getSessionIdFromHeader(
				result.headers['set-cookie'][0]
			)

			// Clean Up
			MockSession.destroy(validSessionId)

			// Assertions
			expect(result.status).to.equal(400)
		})
	})

	describe('invalid input', () => {
		it('email.email should return 400 Bad Request', async () => {
			// Test
			const result: AxiosResponse = await appRequest.post('/auth/register', {
				...guestData,
				email: 'invalidemailformat',
				pass: '12345'
			})

			// Extract session id
			const validSessionId = getSessionIdFromHeader(
				result.headers['set-cookie'][0]
			)

			// Clean Up
			MockSession.destroy(validSessionId)

			// Assertions
			expect(result.status).to.equal(400)
		})

		it('email.required should return 400 Bad Request', async () => {
			// Test
			const result: AxiosResponse = await appRequest.post('/auth/register', {
				...guestData,
				email: undefined,
				pass: '12345'
			})

			// Extract session id
			const validSessionId = getSessionIdFromHeader(
				result.headers['set-cookie'][0]
			)

			// Clean Up
			MockSession.destroy(validSessionId)

			// Assertions
			expect(result.status).to.equal(400)
		})

		it('pass.required should return 400 Bad Request', async () => {
			// Test
			const result: AxiosResponse = await appRequest.post(
				'/auth/register',
				guestData
			)

			// Extract session id
			const validSessionId = getSessionIdFromHeader(
				result.headers['set-cookie'][0]
			)

			// Clean Up
			MockSession.destroy(validSessionId)

			// Assertions
			expect(result.status).to.equal(400)
		})

		it('pass.minLength should return 400 Bad Request', async () => {
			// Test
			const result: AxiosResponse = await appRequest.post('/auth/register', {
				...guestData,
				pass: '12345'
			})

			// Extract session id
			const validSessionId = getSessionIdFromHeader(
				result.headers['set-cookie'][0]
			)

			// Clean Up
			MockSession.destroy(validSessionId)

			// Assertions
			expect(result.status).to.equal(400)
		})
	})
})
