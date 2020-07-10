import { expect } from 'chai'
import { MockSession, MockUser } from '~/test/mocks'
import { getRepository } from 'typeorm'
import { TypeORMRepository } from './TypeORMRepository'
import { User } from '~/app/domain'

describe('lib/domain/TypeORMRepository', () => {
	// Mock Data
	const mockData = {
		email: 'typeormrepository@unit-test.com',
		firstName: 'Unit',
		lastName: 'Test',
		country: 'USA',
		password: 'test-password'
	}

	// Mock Record
	let mockUser: User

	// Test Unit
	let repo: TypeORMRepository<User>
	let softDeleteRepo: TypeORMRepository<User>
	let eagerLoadRepo: TypeORMRepository<User>

	after(async () => {
		// Clean up
		await MockUser.destroy(mockUser.id)
	})

	describe('when constructor is called', () => {
		it('should return new instance of TypeORMRepository', async () => {
			// Test
			repo = new TypeORMRepository(getRepository(User))

			// Assertions
			expect(repo).to.be.an.instanceOf(TypeORMRepository)
		})

		it('with optional softDelete param it should return a new instance of TypeORMRepository', async () => {
			// Test
			softDeleteRepo = new TypeORMRepository(getRepository(User), true)

			// Assertions
			expect(repo).to.be.an.instanceOf(TypeORMRepository)
		})

		it('with optional eager param it should return a new instance of TypeORMRepository', async () => {
			// Test
			eagerLoadRepo = new TypeORMRepository(getRepository(User), false, [
				'session'
			])

			// Assertions
			expect(repo).to.be.an.instanceOf(TypeORMRepository)
		})
	})

	describe('when create method is given valid data', () => {
		it('should create a new User record', async () => {
			// Test
			mockUser = (await repo.create(mockData)) as User

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
			mockUser = (await repo.update(mockUser)) as User

			// Assertions
			expect(mockUser).to.have.property('firstName', newFirstName)
		})
	})

	describe('when get method is given no arguments', () => {
		it('should return an array of records ', async () => {
			// Test
			const result = await repo.get()

			// Assertions
			expect(result).to.have.lengthOf(1)
			expect(result[0]).to.have.keys(Object.keys(mockData))
			expect(result[0]).to.have.property('updatedAt').to.be.not.null
		})

		it('on eager loaded repo it should return an array of records that have a session field', async () => {
			// Create related record
			await MockSession.create({ userId: mockUser.id })

			// Test
			const result = await eagerLoadRepo.get()

			// Assertions
			expect(result).to.have.lengthOf(1)
			expect(result[0]).to.have.keys(Object.keys(mockData).concat('session'))
			expect(result[0]).to.have.property('updatedAt').to.be.not.null
		})
	})

	describe('when getWithCount method is given no arguments', () => {
		it('should return a tuple with array of records at index 0 and the count at index 1', async () => {
			// Test
			const result = await repo.getWithCount()

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
			const result = await repo.getOne()

			// Assertions
			expect(result).to.have.keys(Object.keys(mockData))
			expect(result).to.have.property('updatedAt').to.be.not.null
		})
	})

	describe('delete method when softDeletes property is true', () => {
		it('should return true when successfully deleted and update deletedAt', async () => {
			// Test1
			const result1 = await softDeleteRepo.delete(mockUser.id)

			// Test 2
			const result2 = await softDeleteRepo.getOne()

			// Assertions
			expect(result1).to.be.true
			expect(result2).to.be.undefined
		})

		it('should return false when not successfully deleted', async () => {
			// Test
			const result = await softDeleteRepo.delete(9999)

			// Assertions
			expect(result).to.be.false
		})
	})

	describe('when delete method is given an existing id ', () => {
		it('should return true ', async () => {
			// Test
			const result = await repo.delete(mockUser.id)

			// Assertions
			expect(result).to.be.true
		})
	})

	describe('when delete method is given an non existent id', () => {
		it('should return false ', async () => {
			// Test
			const result = await repo.delete(999999)

			// Assertions
			expect(result).to.be.false
		})
	})

	describe('get method query config', () => {
		// Mock data
		const mockRecord: User[] = []

		before(async () => {
			// Add mock data
			for (let i = 0; i < 10; i++) {
				const record = (await repo.create({
					email: `typeormrepository-${i}@unit-test.com`,
					firstName: `Unit${i}`,
					lastName: `Test${i}`,
					country: `USA`,
					password: `${i}`
				})) as User

				// Add to array
				mockRecord.push(record)
			}
		})

		it('basic where should return 1', async () => {
			// Tests
			const result = await repo.get({
				query: { where: { email: mockRecord[0].email } }
			})

			// Assertions
			expect(result).to.have.lengthOf(1)
		})

		it('loadEagerRleations set to true', async () => {
			// Tests
			const result = await repo.get({
				query: { where: { email: mockRecord[0].email }, embed: ['session'] },
				loadEagerRelations: true
			})

			// Assertions
			expect(result).to.have.lengthOf(1)
			expect(result[0]).to.have.property('session')
		})

		it('select option is given', async () => {
			// Tests
			const result = await repo.get({
				query: { select: ['id', 'firstName'] }
			})

			// Assertions
			expect(result).to.have.lengthOf(10)
			expect(result[0]).to.have.property('id')
			expect(result[0]).to.have.property('firstName')
			expect(result[0]).to.not.have.property('lasttName')
		})

		it('skip option is given without take', async () => {
			// Tests && Assertions
			expect(async function() {
				await repo.get({
					query: { skip: 2 }
				})
			}).to.throw
		})

		it('take option is given', async () => {
			// Tests
			const result = await repo.get({
				query: { take: 6 }
			})

			// Assertions
			expect(result).to.have.lengthOf(6)
		})

		it('skip && take options given', async () => {
			// Tests
			const result = await repo.get({
				query: { skip: 2, take: 3 }
			})

			// Assertions
			expect(result).to.have.lengthOf(3)
			expect(result[0])
				.to.have.property('id')
				.equal(mockRecord[2].id)
		})

		it('skip without take option given should throw', async () => {
			// Test & Assertions
			expect(async function() {
				await repo.get({
					query: { skip: 2 }
				})
			}).to.throw
		})

		it('order option is given', async () => {
			// Tests
			const result = await repo.get({
				query: { order: { id: 'DESC' } }
			})

			// Assertions
			expect(result).to.have.lengthOf(10)
			expect(result[0])
				.to.have.property('id')
				.equal(mockRecord[mockRecord.length - 1].id)
		})

		it('= equal to operator should return 10', async () => {
			// Tests
			const result = await repo.get({
				query: {
					where: { country: { operator: '=', value: mockRecord[0].country } }
				}
			})

			// Assertions
			expect(result).to.have.lengthOf(10)
		})

		it('multiple OR where conditions should return 2', async () => {
			// Tests
			const result = await repo.get({
				query: {
					where: [
						{ id: { operator: '=', value: mockRecord[0].id } },
						{ id: { operator: '=', value: mockRecord[1].id } }
					]
				}
			})

			// Assertions
			expect(result).to.have.lengthOf(2)
		})

		it('> greater than operator should return 9', async () => {
			// Tests
			const result = await repo.get({
				query: { where: { id: { operator: '>', value: mockRecord[0].id } } }
			})

			// Assertions
			expect(result).to.have.lengthOf(9)
		})

		it('>= greater than or equal to operator should return 10', async () => {
			// Tests
			const result = await repo.get({
				query: { where: { id: { operator: '>=', value: mockRecord[0].id } } }
			})

			// Assertions
			expect(result).to.have.lengthOf(10)
		})

		it('< less than operator should return 9', async () => {
			// Tests
			const result = await repo.get({
				query: {
					where: {
						id: { operator: '<', value: mockRecord[mockRecord.length - 1].id }
					}
				}
			})

			// Assertions
			expect(result).to.have.lengthOf(9)
		})

		it('<= less than or equal to operator should return 10', async () => {
			// Tests
			const result = await repo.get({
				query: {
					where: {
						id: { operator: '<=', value: mockRecord[mockRecord.length - 1].id }
					}
				}
			})

			// Assertions
			expect(result).to.have.lengthOf(10)
		})

		it('!= not equal operator should return 9', async () => {
			// Tests
			const result = await repo.get({
				query: {
					where: {
						id: { operator: '!=', value: mockRecord[0].id }
					}
				}
			})

			// Assertions
			expect(result).to.have.lengthOf(9)
		})

		it('<> not equal operator should return 9', async () => {
			// Tests
			const result = await repo.get({
				query: {
					where: {
						id: { operator: '<>', value: mockRecord[0].id }
					}
				}
			})

			// Assertions
			expect(result).to.have.lengthOf(9)
		})

		it('LIKE operator should return 1', async () => {
			// Tests
			const result = await repo.get({
				query: {
					where: {
						email: { operator: 'LIKE', value: `%0@unit-test.com` }
					}
				}
			})

			// Assertions
			expect(result).to.have.lengthOf(1)
		})

		it('BETWEEN operator should return 8', async () => {
			// Tests
			const result = await repo.get({
				query: {
					where: {
						id: {
							operator: 'BETWEEN',
							value: [mockRecord[1].id, mockRecord[mockRecord.length - 2].id]
						}
					}
				}
			})

			// Assertions
			expect(result).to.have.lengthOf(8)
		})

		it('IN operator should return 4', async () => {
			// Tests
			const result = await repo.get({
				query: {
					where: {
						id: {
							operator: 'IN',
							value: [
								mockRecord[0].id,
								mockRecord[1].id,
								mockRecord[2].id,
								mockRecord[3].id
							]
						}
					}
				}
			})

			// Assertions
			expect(result).to.have.lengthOf(4)
		})

		it('IS NULL operator should return 10', async () => {
			// Tests
			const result = await repo.get({
				query: {
					where: {
						updatedAt: { operator: 'IS NULL', value: undefined }
					}
				}
			})

			// Assertions
			expect(result).to.have.lengthOf(10)
		})

		it('IS NOT NULL operator should return 10', async () => {
			// Tests
			const result = await repo.get({
				query: {
					where: {
						createdAt: { operator: 'IS NOT NULL', value: undefined }
					}
				}
			})

			// Assertions
			expect(result).to.have.lengthOf(10)
		})

		it('RAW operator should return 1', async () => {
			// Tests
			const result = await repo.get({
				query: {
					where: {
						id: { operator: 'RAW', value: `${mockRecord[0].id} + 1` }
					}
				}
			})

			// Assertions
			expect(result).to.have.lengthOf(1)
			expect(result[0])
				.to.have.property('id')
				.equal(mockRecord[1].id)
		})

		after(async () => {
			// Clean up
			for (let i = 0; i < mockRecord.length; i++) {
				await MockUser.destroy(mockRecord[i].id)
			}
		})
	})
})
