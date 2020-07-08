const primaryMockUserData: PrimaryMockUserData = {
	email: 'zachary.prisk@gmail.com',
	firstName: 'Zachary',
	lastName: 'Prisk',
	country: 'USA',
	birthdate: new Date('01/01/1969'),
	password: 'test123456'
}

/**
 *  Get seeds
 */
const seeds: UserSeedData[] = [
	{
		email: primaryMockUserData.email,
		firstName: primaryMockUserData.firstName,
		lastName: primaryMockUserData.lastName,
		country: primaryMockUserData.country,
		birthdate: primaryMockUserData.birthdate
	}
]

/**
 *  Get seeds
 */
function getSeeds(): UserSeedData[] {
	return seeds
}

/**
 *  Get all priamry mock user data
 */
function getPrimaryMockUserData(): PrimaryMockUserData {
	return primaryMockUserData
}

export const UserSeed = {
	getSeeds,
	getPrimaryMockUserData
}

interface UserSeedData {
	email: string
	firstName: string
	lastName: string
	country?: string
	birthdate?: Date
}

interface PrimaryMockUserData {
	email: string
	password: string
	firstName: string
	lastName: string
	country?: string
	birthdate?: Date
}
