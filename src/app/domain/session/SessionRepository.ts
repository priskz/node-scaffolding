import { PrismaRepository } from '~/lib/domain'
import { Session } from '~/generated/prisma/client'

export class SessionRepository extends PrismaRepository<Session> {
	/*
	 * Prisma model name
	 */
	protected modelName = 'session'

	/*
	 * Soft deletes
	 */
	protected softDeletes = true
}
