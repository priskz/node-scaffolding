import { getRepository } from 'typeorm'
import { TypeORMRepository } from '~/lib/domain/TypeORMRepository'
import { User } from './User'
import { UserCache } from './UserCache'

export class UserRepository extends TypeORMRepository<User> {
	/**
	 * Construct
	 */
	constructor() {
		super(getRepository(User))
	}
}
