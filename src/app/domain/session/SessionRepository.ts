import { getRepository } from 'typeorm'
import { TypeORMRepository } from '~/lib/domain/TypeORMRepository'
import { Session } from './Session'

export class SessionRepository extends TypeORMRepository<Session> {
	/**
	 * Construct
	 */
	constructor() {
		super(getRepository(Session))
	}
}
