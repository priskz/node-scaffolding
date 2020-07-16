import { EntityRepository } from 'typeorm'
import { TypeORMRepository } from '~/lib/domain/TypeORMRepository'
import { Content } from './Content'

@EntityRepository(Content)
export class ContentRepository extends TypeORMRepository<Content> {
	/*
	 * Eager loading configuration.
	 */
	protected eager: string[] = ['category', 'image', 'tag']
}
