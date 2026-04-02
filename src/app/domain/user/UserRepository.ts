import { PrismaRepository } from '~/lib/domain'
import { User } from '~/generated/prisma/client'

export class UserRepository extends PrismaRepository<User> {
	/*
	 * Prisma model name
	 */
	protected modelName = 'user'

	/*
	 * Soft deletes
	 */
	protected softDeletes = true
}
