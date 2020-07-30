import { Cookie } from 'tough-cookie'
import cookieSignature from 'cookie-signature'
import { Session, User } from '~/app/domain'
import { SessionService } from '~/app/service'
import { config } from '~/config'
import { time } from '~/lib/util'

async function create(
	options: CreateOptions = {}
): Promise<Session | undefined> {
	// Set default prop values and then update with given overrides
	const option: CreateOptions = {
		agent: 'Test Agent',
		ipAddress: 'Test IP',
		expiresAt: time
			.now()
			.plus({ days: config.session.duration.guest })
			.toJSDate(),
		...options
	}

	// Init
	const service = new SessionService()

	// Create
	return await service.create(option)
}

async function destroy(id: string): Promise<void> {
	// Init
	const service = new SessionService()

	// Delete
	return await service.delete(id)
}

function getCookie(sessionId: string): string {
	const cookieSecret = process.env.COOKIE_SECRET || 'test'
	const signedCookie = cookieSignature.sign(sessionId, cookieSecret)

	const cookie = new Cookie({
		key: config.session.cookie,
		value: encodeURI(`s:${signedCookie}`)
	})

	return cookie.toString()
}

interface CreateOptions {
	id?: string
	agent?: string
	ipAddress?: string
	expiresAt?: Date
	lastActive?: Date
	userId?: number
	user?: User
	[key: string]: unknown
}

interface TestSession extends Session {
	[key: string]: unknown
}

export const MockSession = {
	create,
	destroy,
	getCookie
}
