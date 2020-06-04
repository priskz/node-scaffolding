import { crypt } from '~/lib/util'
import { User } from '~/app/domain'
import { SessionService, UserService } from '~/app/service/data'

export class AuthRootService {
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
		// Hash password before saving
		data.password = await crypt.hash.make(data.password)

		// Create
		const user = await this.user.create(data)

		// Return
		if (user) return user
	}

	/*
	 * Log User In
	 */
	public async login(
		email: string,
		password: string
	): Promise<User | undefined> {
		// Get user
		const user = await this.user.getOneByEmail(email)

		// Compare password
		const valid = user && (await crypt.hash.check(password, user.password))

		// Return
		if (valid) return user
	}

	/*
	 * Log User Out
	 */
	public async logout(sessionId: string): Promise<Boolean> {
		// Expire session
		return await this.session.expire(sessionId)
	}
}
