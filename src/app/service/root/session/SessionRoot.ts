import moment from 'moment'
import { config } from '~/config'
import { Session } from '~/app/domain'
import { SessionService } from '~/app/service/data'

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
	 * Generate a new Session
	 */
	public async generate(
		agent: string,
		ipAddress?: string
	): Promise<Session | undefined> {
		// TODO: Clean up time logic
		// Current time
		const now = new Date()

		// Create expiresAt
		const expiresAt = new Date(now)

		// Add session duration to value
		expiresAt.setDate(now.getDate() + config.session.duration.guest)

		// Create
		return await this.session.create({
			agent,
			ipAddress,
			expiresAt
		})
	}

	/*
	 * Get a single Session by id
	 */
	public async getOneById(id: string): Promise<Session | undefined> {
		return await this.session.getOne({ where: { id }, embed: ['user'] })
	}

	/*
	 * Updates Session's activateAt with current time stamp
	 */
	public async touch(id: string): Promise<void> {
		await this.session.update({ id, activeAt: moment().toDate() })
	}
}
