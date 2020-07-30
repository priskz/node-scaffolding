import { config } from '~/config'
import { Session } from '~/app/domain'
import { SessionService } from '~/app/service/data'
import { time } from '~/lib/util'

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
		// Determine expiration
		const expiresAt = time
			.now()
			.plus({ days: config.session.duration.guest })
			.toJSDate()

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
		await this.session.update({ id, activeAt: time.now().toJSDate() })
	}
}
