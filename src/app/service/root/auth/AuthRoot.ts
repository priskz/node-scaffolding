import { crypt } from '~/lib/util'
import { User } from '~/app/domain'
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

		// Hash pass and attempt
		return await this.user.create({
			...data,
			password: await crypt.hash.make(data.password)
		})
	}

	/*
	 * Login a User
	 */
	public async login(
		email: string,
		password: string
	): Promise<User | undefined> {
		// Find user
		const user = await this.user.getOneByEmail(email)

		// Not found?
		if (!user) return

		// Compare password
		const valid = await crypt.hash.check(password, user.password)

		// Return
		if (!valid) return

		// Return user
		return user
	}

	/*
	 * Log User Out
	 */
	public async logout(sessionId: string): Promise<Boolean> {
		// Expire session
		// TODO:
		// return await this.session.expire(sessionId)
		return false
	}
}
