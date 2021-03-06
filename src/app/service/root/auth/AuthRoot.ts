import { crypt } from '~/lib/util'
import { Session, User } from '~/app/domain'
import { SessionService, UserService } from '~/app/service/data'

export class AuthRoot {
	/*
	 * Aggregate Services
	 */
	protected session: SessionService
	protected user: UserService

	/*
	 * Construct
	 */
	constructor() {
		this.session = new SessionService()
		this.user = new UserService()
	}

	/*
	 * Register New User
	 */
	public async register(data: any): Promise<User | undefined> {
		// Check if exists
		const registered = await this.user.getOneByEmail(data.email)

		// Stop if registered
		if (registered) return

		// Hash pass
		const password = await crypt.hash.make(data.pass)

		//  Attempt
		return await this.user.create({
			...data,
			password
		})
	}

	/*
	 * Login a User
	 */
	public async login(
		session: Session,
		email: string,
		password: string
	): Promise<Session | undefined> {
		// Find user
		const user = await this.user.getOneByEmail(email)

		// Not found?
		if (!user) return

		// Compare password
		const valid = await crypt.hash.check(password, user.password)

		// Return
		if (!valid) return

		// TODO: Update expiresAt to config.session.duration.user
		// Attach user to session
		return await this.session.update({ id: session.id, userId: user.id })
	}

	/*
	 * Log User Out
	 */
	public async logout(session: Session): Promise<Boolean> {
		// Expire session
		return await this.session.expire(session.id)
	}
}
