import { UserSeed } from '~/test/seeds'
import { User } from '~/app/domain'

/**
 *  Get primary mock user email
 */
function getPrimaryMockUserData(): ExistingUser {
	return UserSeed.getPrimaryMockUserData()
}

/**
 *  Get primary mock user email
 */
function getPrimaryMockUserEmail(): string {
	return UserSeed.getPrimaryMockUserData().email
}

/**
 *  Get primary mock user passwordword
 */
function getPrimaryMockUserPassword(): string {
	return UserSeed.getPrimaryMockUserData().password
}

/**
 * Create a user in the database
 */
async function create(options: CreateOptions = {}): Promise<User> {
	// Set default prop values and then update with given overrides
	const option: CreateOptions = {
		email: 'test@email.com',
		firstName: 'Test',
		lastName: 'User',
		country: 'USA',
		birthdate: new Date('05/01/1975'),
		...options
	}

	// Init mock as an extended interface with props exposed as iterable
	const mockUser = new User() as TestUser

	// Set props
	for (const key in option) {
		mockUser[key] = option[key]
	}

	// Save
	return await mockUser.save()
}

/**
 * Delete a user from the database by id or email
 */
async function destroy(id: number | string): Promise<void> {
	if (typeof id == 'number') {
		// Delete by email
		const user = new User()

		user.id = id

		await user.remove()
	} else if (typeof id == 'string') {
		// Delete by email
		const user = await User.find({
			where: { email: id }
		})

		await user[0].remove()
	}
}

/**
 * Create random Guest data (not persisted)
 */
function guest(): GuestUser {
	const characters = 'abcdefghijklmnopqrstuvwxyz'

	let randomUsername = ''

	// Generate a random username
	for (let i = 0; i < 10; i++) {
		randomUsername += characters.charAt(
			Math.floor(Math.random() * characters.length)
		)
	}

	return {
		email: `${randomUsername}@unit-test.com`,
		password: 'test123456',
		firstName: randomUsername,
		lastName: 'UnitTest',
		country: 'USA',
		birthdate: new Date('05-01-1975')
	}
}

/**
 * Add predictable user data
 */
export async function createSeeds(limit = 0): Promise<void> {
	// Get seeds
	const seed = UserSeed.getSeeds()

	// All or limited amount of seeds?
	const max = limit === 0 || limit >= seed.length ? seed.length : limit

	// Iterate user data
	for (let i = 0; i < max; i++) {
		await create({
			email: seed[i].email,
			firstName: seed[i].firstName,
			lastName: seed[i].lastName,
			country: seed[i].country,
			birthdate: seed[i].birthdate
		})
	}
}

/**
 * Remove seeded users
 */
async function deleteSeeds(): Promise<void> {
	// Get seeds
	const seed = UserSeed.getSeeds()

	// Iterate user data
	for (let i = 0; i < seed.length; i++) {
		await destroy(seed[i].email)
	}
}

/**
 * Retrieve a user by email that was created from seed data. Defaults to primary mock user.
 */
async function getSeededUser(
	email: string = getPrimaryMockUserEmail()
): Promise<User> {
	const user = await User.findOne({
		where: { email: email },
		relations: [],
		loadEagerRelations: true
	})

	if (!user) {
		throw Error('Seeded user data does not exist!')
	}

	return user
}

interface CreateOptions {
	id?: number
	email?: string
	firstName?: string
	lastName?: string
	country?: string
	birthdate?: Date
	lastEntitlementSync?: Date
	[key: string]: unknown
}

interface TestUser extends User {
	[key: string]: unknown
}

export interface GuestUser {
	email: string
	password: string
	firstName: string
	lastName: string
	country?: string
	birthdate?: Date
}

export interface ExistingUser extends GuestUser {
	id?: number
}

export const MockUser = {
	create,
	guest,
	destroy,
	createSeeds,
	deleteSeeds,
	getSeededUser,
	getPrimaryMockUserData,
	getPrimaryMockUserEmail,
	getPrimaryMockUserPassword
}
