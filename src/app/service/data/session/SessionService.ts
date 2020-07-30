import { getCustomRepository } from 'typeorm'
import { DataService } from '~/lib/service/DataService'
import { time } from '~/lib/util'
import { Session, SessionRepository } from '~/app/domain'

export class SessionService extends DataService<Session> {
	/*
	 * Construct
	 */
	constructor() {
		super(getCustomRepository(SessionRepository))
	}

	/*
	 * Get a Session by id
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
			expiresAt: time.now().toJSDate()
		}))
	}
}
