import { DataService } from '~/lib/service/DataService'
import { User, UserRepository } from '~/app/domain/user'

export class UserService extends DataService<User> {
	/*
	 * Construct
	 */
	constructor() {
		super(new UserRepository())
	}

	/*
	 * Construct
	 */
	public async getOneByEmail(email: string): Promise<User | undefined> {
		return await this.repository.getOne({ email })
	}
}
