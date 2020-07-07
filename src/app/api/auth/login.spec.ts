import { expect } from 'chai'
import { AxiosResponse } from 'axios'
import { appRequest } from '~/test/util'

//----- Tests -----//

describe('api/auth/login', () => {
	describe.skip('valid credentials && cookie is provided', () => {
		it('should return 204 No Content', async () => {
			// Assertions
			// expect(result.status).to.equal(204)
		})
	})

	describe.skip('when valid credentials && NO cookie is provided', () => {
		it('should return a new cookie && status 204 No Content', async () => {
			// Assertions
			// expect(result.status).to.equal(204)
		})
	})

	describe('invalid login credentials are provided', () => {
		it('should return 401 Unauthorized', async () => {
			// Test
			const result: AxiosResponse = await appRequest.post('/auth/login')

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

			// Assertions
			expect(result.status).to.equal(401)
		})
	})
})
