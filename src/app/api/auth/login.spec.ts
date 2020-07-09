import { expect } from 'chai'
import { AxiosResponse } from 'axios'
import { appRequest } from '~/test/util'
import { MockSession } from '~/test/mocks'
import { getSessionIdFromHeader } from '~/test/util'

//----- Tests -----//

describe('api/auth/login', () => {
	describe.skip('valid credentials && cookie is provided', () => {
		it('should return 204 No Content', async () => {
			// const cookie = MockSession.getCookie(validSessionId)
			// Assertions
			// expect(result.status).to.equal(204)
		})
	})

	describe.skip('when valid credentials && NO cookie is provided', () => {
		it('should return a new cookie && status 204 No Content', async () => {
			// const cookie = MockSession.getCookie(validSessionId)
			// Assertions
			// expect(result.status).to.equal(204)
		})
	})

	describe('invalid login credentials are provided', () => {
		it('should return 401 Unauthorized', async () => {
			// Test
			const result: AxiosResponse = await appRequest.post('/auth/login')

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

	describe('when user input is NOT a valid email', () => {
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

	describe('when user input is NOT provided', () => {
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

	describe('when password input is NOT provided', () => {
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
