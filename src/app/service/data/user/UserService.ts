import { DataService } from '~/lib/service/DataService'
import { User, UserRepository } from '~/app/domain'
import { getCustomRepository } from 'typeorm'

export class UserService extends DataService<User> {
	/*
	 * Construct
	 */
	constructor() {
		super(getCustomRepository(UserRepository))
	}

	/*
	 * Get a single user by email address
	 */
	public async getOneByEmail(email: string): Promise<User | undefined> {
		return await this.getOne({ where: { email } })
	}
}
