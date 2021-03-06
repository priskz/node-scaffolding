import { expect } from 'chai'
import { AxiosResponse } from 'axios'
import { MockSession } from '~/test/mocks'
import { appRequest } from '~/test/util'
import { getSessionIdFromHeader } from '~/test/util'

//----- Tests -----//

describe('middleware/session', () => {
	describe('cookie is tampered with', () => {
		it('should return 401 Not Authorized', async () => {
			// Make request to generate session
			const request: AxiosResponse = await appRequest.get('/session')

			// Extract session id
			const validSessionId = getSessionIdFromHeader(
				request.headers['set-cookie'][0]
			)

			// Get cookie and tamper with it
			const cookie = MockSession.getCookie(validSessionId).replace(
				's:',
				's:invalid'
			)

			// Test
			const result: AxiosResponse = await appRequest.get('/session', {
				headers: { cookie }
			})

			// Clean up
			await MockSession.destroy(validSessionId)

			// Assertions
			expect(result.status).to.equal(401)
		})
	})

	describe('valid cookie is given, but does not exist', () => {
		it('should return 404', async () => {
			// Make request to generate session
			const request: AxiosResponse = await appRequest.get('/session')

			// Extract session id
			const validSessionId = getSessionIdFromHeader(
				request.headers['set-cookie'][0]
			)

			// Get cookie
			const cookie = MockSession.getCookie(validSessionId)

			// Remove the session
			await MockSession.destroy(validSessionId)

			// Test
			const result: AxiosResponse = await appRequest.get('/session', {
				headers: { cookie }
			})

			// Assertions
			expect(result.status).to.equal(404)
		})
	})

	describe('no cookie is provided a new session should be created', () => {
		it('should return 204 No Content with signed session cookie in header', async () => {
			// Test
			const request: AxiosResponse = await appRequest.get('/session')

			// Extract session id
			const result = getSessionIdFromHeader(request.headers['set-cookie'][0])

			// Clean up
			await MockSession.destroy(result)

			// Assertions
			expect(result.length).to.equal(36)
			expect(request.headers['set-cookie'][0]).to.include('session=s%')
		})
	})

	describe('valid cookie is present', () => {
		it('should update session activeAt && return 204 No Content', async () => {
			// Test
			const request: AxiosResponse = await appRequest.get('/session')

			// Extract session id
			const sessionId = getSessionIdFromHeader(request.headers['set-cookie'][0])

			// Get cookie
			const cookie = MockSession.getCookie(sessionId)

			// Test
			const result: AxiosResponse = await appRequest.get('/session', {
				headers: { cookie }
			})

			// Clean up
			await MockSession.destroy(sessionId)

			// Assertions
			expect(result.status).to.equal(204)
		})
	})
})
