import { DataService } from '~/lib/service/DataService'
import { Session, SessionRepository } from '~/app/domain'

export class SessionService extends DataService<Session> {
	/*
	 * Construct
	 */
	constructor() {
		super(new SessionRepository())
	}
}
