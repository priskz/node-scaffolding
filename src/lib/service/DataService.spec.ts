import { expect } from 'chai'
import { getCustomRepository } from 'typeorm'
import { MockUser } from '~/test/mocks'
import { UserRepository } from '~/app/domain'
import { DataService } from './DataService'
import { User } from '~/app/domain'

describe('lib/service/DataService', () => {
	// Mock Data
	const mockData = {
		email: 'dataservice@unit-test.com',
		firstName: 'Unit',
		lastName: 'Test',
		country: 'USA',
		password: 'test-password'
	}

	// Mock Record
	let mockUser: User

	// Test Unit
	let service: DataService<User>

	after(async () => {
		// Clean up
		await MockUser.destroy(mockUser.id)
	})

	describe('when constructor is called', () => {
		it('should return new instance of DataService', async () => {
			// Test
			service = new DataService(getCustomRepository(UserRepository))

			// Assertions
			expect(service).to.be.an.instanceOf(DataService)
		})
	})

	describe('when create method is given valid data', () => {
		it('should create a new User record', async () => {
			// Test
			mockUser = (await service.create(mockData)) as User

			// Assertions
			expect(mockUser).to.have.keys(Object.keys(mockData))
			expect(mockUser).to.include(mockData)
		})
	})

	describe('when update method is given valid data', () => {
		it('should update an existing User record', async () => {
			const newFirstName = 'Updated'

			// Modify mock data
			mockData.firstName = newFirstName

			// Test
			mockUser = (await service.update(mockUser)) as User

			// Assertions
			expect(mockUser).to.have.property('firstName', newFirstName)
		})
	})

	describe('when get method is given no arguments ', () => {
		it('should return an array of records ', async () => {
			// Test
			const result = await service.get()

			// Assertions
			expect(result).to.have.lengthOf(1)
			expect(result[0]).to.have.keys(Object.keys(mockData))
			expect(result[0]).to.have.property('updatedAt').to.be.not.null
		})
	})

	describe('when getWithCount method is given no arguments', () => {
		it('should return a tuple with array of records at index 0 and the count at index 1', async () => {
			// Test
			const result = await service.getWithCount()

			// Assertions
			expect(result[0]).to.have.lengthOf(1)
			expect(result[0][0]).to.have.keys(Object.keys(mockData))
			expect(result[0][0]).to.have.property('updatedAt').to.be.not.null
			expect(result[1]).to.equal(1)
		})
	})

	describe('when getOne method is given no arguments ', () => {
		it('should return a single record ', async () => {
			// Test
			const result = await service.getOne()

			// Assertions
			expect(result).to.have.keys(Object.keys(mockData))
			expect(result).to.have.property('updatedAt').to.be.not.null
		})
	})

	describe('when delete method is given an existing id ', () => {
		it('should return true ', async () => {
			// Test
			const result = await service.delete(mockUser.id)

			// Assertions
			expect(result).to.be.true
		})
	})

	describe('when delete method is given an non existent id', () => {
		it('should return false ', async () => {
			// Test
			const result = await service.delete(999999)

			// Assertions
			expect(result).to.be.false
		})
	})
})
