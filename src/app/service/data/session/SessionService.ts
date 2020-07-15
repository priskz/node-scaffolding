import moment from 'moment'
import { DataService } from '~/lib/service/DataService'
import { Session, SessionRepository } from '~/app/domain'
import { getCustomRepository } from 'typeorm'

export class SessionService extends DataService<Session> {
	/*
	 * Construct
	 */
	constructor() {
		super(getCustomRepository(SessionRepository))
	}

	/*
	 * Get a single Session by id
	 */
	public async getOneById(id: string): Promise<Session | undefined> {
		return await this.getOne({ where: { id } })
	}

	/*
	 * Expire a Session
	 */
	public async expire(id: string): Promise<boolean> {
		return !!(await this.repository.update({
			id,
			expiresAt: moment().toDate()
		}))
	}
}
