import { User } from '~/app/domain'
import { SessionService, UserService } from '~/app/service/data'

export class SessionRoot {
	/*
	 * Aggregate Services
	 */
	protected session: SessionService

	/*
	 * Construct
	 */
	constructor() {
		this.session = new SessionService()
	}

	/*
	 *
	 */
	public async attachUser(sessionId: string): Promise<Boolean> {
		// Expire session
		return await this.session.expire(sessionId)
	}
}
