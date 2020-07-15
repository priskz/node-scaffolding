import { expect } from 'chai'
import { AxiosResponse } from 'axios'
import { appRequest } from '~/test/util'
import { MockSession, MockUser } from '~/test/mocks'
import { getSessionIdFromHeader } from '~/test/util'
import { crypt } from '~/lib/util'
import { Session } from '~/app/domain'

//----- Tests -----//

describe('api/auth/login', () => {
	// Guest user data
	let guestData = MockUser.guest()

	before(async () => {
		// Clean up
		await MockUser.create({
			...guestData,
			password: await crypt.hash.make(guestData.password)
		})
	})

	after(async () => {
		// Clean up
		await MockUser.destroyByEmail(guestData.email)
	})

	describe('valid credentials && session cookie is provided', () => {
		// Mock
		let session: Session

		// Cookie
		let cookie: string

		before(async () => {
			// Create
			session = (await MockSession.create()) as Session

			// Generate cookie
			cookie = MockSession.getCookie(session.id)
		})

		after(async () => {
			// Clean Up
			await MockSession.destroy(session.id)
		})

		it('should return 204 No Content', async () => {
			// Test
			const result: AxiosResponse = await appRequest.post(
				'/auth/login',
				{
					email: guestData.email,
					pass: guestData.password
				},
				{
					headers: { cookie }
				}
			)

			// Update cookie
			cookie = result.headers['set-cookie'][0]

			// Assertions
			expect(result.status).to.equal(204)
		})

		it('already logged in cookie should return 400 Bad Request', async () => {
			// Test
			const result: AxiosResponse = await appRequest.post(
				'/auth/login',
				{
					email: guestData.email,
					pass: guestData.password
				},
				{
					headers: { cookie }
				}
			)

			// Assertions
			expect(result.status).to.equal(400)
		})
	})

	describe('valid credentials && NO cookie is provided', () => {
		it('should return a new session cookie && status 204 No Content', async () => {
			// Test
			const result: AxiosResponse = await appRequest.post('/auth/login', {
				email: guestData.email,
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

	describe('invalid login credentials are provided', () => {
		it('should return 401 Unauthorized', async () => {
			// Test
			const result: AxiosResponse = await appRequest.post('/auth/login', {
				email: guestData.email,
				pass: 'invalidpass'
			})

			// Extract session id
			const validSessionId = getSessionIdFromHeader(
				result.headers['set-cookie'][0]
			)

			// Clean Up
			MockSession.destroy(validSessionId)

			// Assertions
			expect(result.status).to.equal(401)
		})
	})

	describe('email input is NOT a valid email', () => {
		it('should return 401 Unauthorized', async () => {
			// Test
			const result: AxiosResponse = await appRequest.post('/auth/login', {
				email: 'thisIsNotAnEmail',
				pass: 'anypass'
			})

			// Extract session id
			const validSessionId = getSessionIdFromHeader(
				result.headers['set-cookie'][0]
			)

			// Clean Up
			MockSession.destroy(validSessionId)

			// Assertions
			result.status.should.equal(401)
		})
	})

	describe('email input is NOT provided', () => {
		it('should return 401 Unauthorized', async () => {
			// Test
			const result: AxiosResponse = await appRequest.post('/auth/login', {
				pass: 'anypass'
			})

			// Extract session id
			const validSessionId = getSessionIdFromHeader(
				result.headers['set-cookie'][0]
			)

			// Clean Up
			MockSession.destroy(validSessionId)

			// Assertions
			expect(result.status).to.equal(401)
		})
	})

	describe('password input is NOT provided', () => {
		it('should return 401 Unauthorized', async () => {
			// Test
			const result: AxiosResponse = await appRequest.post('/auth/login', {
				email: 'any-email@test.com'
			})

			// Extract session id
			const validSessionId = getSessionIdFromHeader(
				result.headers['set-cookie'][0]
			)

			// Clean Up
			MockSession.destroy(validSessionId)

			// Assertions
			expect(result.status).to.equal(401)
		})
	})
})
