import { expect } from 'chai'
import mocks from 'node-mocks-http'
import { Responder } from './'

//----- Tests -----//

describe('util/Responder', () => {
	describe('when constructor is called', () => {
		it('should create a new instace of Responder', async () => {
			// Mocks
			const request = mocks.createRequest()
			const response = mocks.createResponse()

			// Test
			const responder = new Responder(request, response)

			// Assertions
			expect(responder).to.be.an.instanceOf(Responder)
		})
	})

	describe('when success is called with NO data', () => {
		it('should create 204 response', async () => {
			// Mocks
			const request = mocks.createRequest()
			const response = mocks.createResponse()

			// Test
			const responder = new Responder(request, response)

			// Use function
			responder.success()

			// Assertions
			expect(response.statusCode).to.equal(204)
		})
	})

	describe('when success is called WITH data', () => {
		it('should create 200 response with data', async () => {
			// Mocks
			const request = mocks.createRequest()
			const response = mocks.createResponse()

			// Response body
			const data = { testProp: 'testValue' }

			// Test
			const responder = new Responder(request, response)

			// Use function
			responder.success(data)

			// Assertions
			expect(response.statusCode).to.equal(200)
			expect(response._getJSONData().testProp).to.equal(data.testProp)
		})
	})

	describe('when succcess is called with code argument', () => {
		it('should create response with given status code ', async () => {
			// Mocks
			const request = mocks.createRequest()
			const response = mocks.createResponse()
			const code = 202

			// Test
			const responder = new Responder(request, response)

			// Use function
			responder.success(undefined, code)

			// Assertions
			expect(response.statusCode).to.equal(code)
		})
	})

	describe('when error is called with NO data', () => {
		it('should create 400 response', async () => {
			// Mocks
			const request = mocks.createRequest()
			const response = mocks.createResponse()

			// Test
			const responder = new Responder(request, response)

			// Use function
			responder.error()

			// Assertions
			expect(response.statusCode).to.equal(400)
		})
	})

	describe('when error is called WITH data', () => {
		it('should create 400 response with data', async () => {
			// Mocks
			const request = mocks.createRequest()
			const response = mocks.createResponse()

			// Response body
			const data = { testProp: 'testValue' }

			// Test
			const responder = new Responder(request, response)

			// Use function
			responder.error(data)

			// Assertions
			expect(response.statusCode).to.equal(400)
			expect(response._getJSONData().testProp).to.equal(data.testProp)
		})
	})

	describe('when error is called with code argument', () => {
		it('should create response with given status code ', async () => {
			// Mocks
			const request = mocks.createRequest()
			const response = mocks.createResponse()
			const code = 422

			// Test
			const responder = new Responder(request, response)

			// Use function
			responder.error(undefined, code)

			// Assertions
			expect(response.statusCode).to.equal(code)
		})
	})

	describe('when exception is called with NO data', () => {
		it('should create 500 response', async () => {
			// Mocks
			const request = mocks.createRequest()
			const response = mocks.createResponse()

			// Test
			const responder = new Responder(request, response)

			// Use function
			responder.exception()

			// Assertions
			expect(response.statusCode).to.equal(500)
		})
	})

	describe('when exception is called WITH data', () => {
		it('should create 500 response with body', async () => {
			// Mocks
			const request = mocks.createRequest()
			const response = mocks.createResponse()

			// Response body
			const data = { testProp: 'testValue' }

			// Test
			const responder = new Responder(request, response)

			// Use function
			responder.exception(data)

			// Assertions
			expect(response.statusCode).to.equal(500)
			expect(response._getJSONData().testProp).to.equal(data.testProp)
		})
	})

	describe('when exception is called with code argument', () => {
		it('should create response with given status code ', async () => {
			// Mocks
			const request = mocks.createRequest()
			const response = mocks.createResponse()
			const code = 502

			// Test
			const responder = new Responder(request, response)

			// Use function
			responder.exception(undefined, code)

			// Assertions
			expect(response.statusCode).to.equal(code)
		})
	})

	describe('when redirect is called', () => {
		it('should create temporary 302 response', async () => {
			// Mocks
			const request = mocks.createRequest()
			const response = mocks.createResponse()

			// Redirect url
			const url = '/somewhere-else'

			// Test
			const responder = new Responder(request, response)

			// Use function
			responder.redirect(url)

			// Assertions
			expect(response.statusCode).to.equal(302)
			expect(response.header('Location')).to.equal(url)
		})
	})

	describe('when redirect is called with optional permanent flag', () => {
		it('should create permanent 301 response', async () => {
			// Mocks
			const request = mocks.createRequest()
			const response = mocks.createResponse()

			// Redirect url
			const url = '/somewhere-else'

			// Test
			const responder = new Responder(request, response)

			// Use function
			responder.redirect(url, true)

			// Assertions
			expect(response.statusCode).to.equal(301)
			expect(response.header('Location')).to.equal(url)
		})
	})

	describe('when send is given a valid http code', () => {
		it('should create response with given http code', async () => {
			// Mocks
			const request = mocks.createRequest()
			const response = mocks.createResponse()

			// Test
			const responder = new Responder(request, response)

			// Use function
			responder.send(418)

			// Assertions
			expect(response.statusCode).to.equal(418)
			expect(response._getData()).to.be.empty
		})
	})

	describe('when send is given a valid http code WITH data', () => {
		it('should create response with given http code and data', async () => {
			// Mocks
			const request = mocks.createRequest()
			const response = mocks.createResponse()

			// Response body
			const data = { testProp: 'testValue' }

			// Test
			const responder = new Responder(request, response)

			// Use function
			responder.send(418, data)

			// Assertions
			expect(response.statusCode).to.equal(418)
			expect(response._getJSONData().testProp).to.equal(data.testProp)
		})
	})
})
