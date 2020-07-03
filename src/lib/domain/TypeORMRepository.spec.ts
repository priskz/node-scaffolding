import { expect } from 'chai'
import { MockUser } from '~/test/mocks'
import { getRepository } from 'typeorm'
import { TypeORMRepository } from './TypeORMRepository'
import { User } from '~/app/domain'

describe('lib/domain/TypeORMRepository', () => {
	// Mock Data
	const mockUserData = {
		email: 'typeormrepository@unit-test.com',
		firstName: 'Unit',
		lastName: 'Test',
		country: 'USA',
		password: 'test-password',
		birthdate: '01-01-1990'
	}

	// Mock User
	let mockUser: User

	after(async () => {
		// Clean up
		await MockUser.destroy(mockUser.id)
	})

	describe('when constructor is called', () => {
		it('should return new intance of TypeORMRepository', async () => {
			// Test
			const result = new TypeORMRepository(getRepository(User))

			// Assertions
			expect(result).to.be.an.instanceOf(TypeORMRepository)
		})
	})

	describe('when create function is given valid data', () => {
		it('should create a new User record', async () => {
			// Setup
			const repo = new TypeORMRepository(getRepository(User))

			// Test
			mockUser = (await repo.create(mockUserData)) as User

			// Assertions
			expect(mockUser.id).to.be.not.null
			expect(mockUser.email).to.equal(mockUserData.email)
			expect(mockUser.firstName).to.equal(mockUserData.firstName)
			expect(mockUser.lastName).to.equal(mockUserData.lastName)
			expect(mockUser.country).to.equal(mockUserData.country)
			expect(mockUser.password).to.equal(mockUserData.password)
			expect(mockUser.birthdate).to.equal(mockUserData.birthdate)
			expect(mockUser.createdAt).to.be.not.null
			expect(mockUser.updatedAt).to.be.null
			expect(mockUser.deletedAt).to.be.null
		})
	})

	describe('when update function is given valid data', () => {
		it('should update an existing User record', async () => {
			const newFirstName = 'Updated'

			// Modify mock data
			mockUserData.firstName = newFirstName

			// Setup
			const repo = new TypeORMRepository(getRepository(User))

			// Test
			mockUser = (await repo.update(mockUser)) as User

			// Assertions
			expect(mockUser.firstName).to.equal(newFirstName)
		})
	})

	describe.skip('Todo', () => {
		it('Todo', async () => {
			//
		})
	})
})
