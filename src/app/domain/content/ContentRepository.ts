import { PrismaRepository } from '~/lib/domain'
import { Content } from '~/generated/prisma/client'

export class ContentRepository extends PrismaRepository<Content> {
	/*
	 * Prisma model name
	 */
	protected modelName = 'content'

	/*
	 * Soft deletes
	 */
	protected softDeletes = true

	/*
	 * Eager loading
	 */
	protected eager: string[] = ['category', 'image', 'tags']
}
