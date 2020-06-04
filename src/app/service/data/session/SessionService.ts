import moment from 'moment'
import { DataService } from '~/lib/service/DataService'
import { Session, SessionRepository } from '~/app/domain'

export class SessionService extends DataService<Session> {
	/*
	 * Construct
	 */
	constructor() {
		super(new SessionRepository())
	}

	/*
	 * Expire a Session
	 */
	public async expire(id: string): Promise<boolean> {
		return !!(await this.update({ id, expiresAt: moment().toDate() }))
	}
}
