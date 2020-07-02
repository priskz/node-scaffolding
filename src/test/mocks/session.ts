import moment from 'moment'
import { Cookie } from 'tough-cookie'
import cookieSignature from 'cookie-signature'
import { Session, User } from '~/app/domain'
import { config } from '~/config'

async function create(options: CreateOptions = {}): Promise<Session> {
	// Set default prop values and then update with given overrides
	const option: CreateOptions = {
		browserAgent: 'Test Agent',
		ipAddress: 'Test IP',
		expires: moment()
			.add(config.session.duration.guest, 'days')
			.toDate(),
		...options
	}

	// Init mock as an extended interface with props exposed as iterable
	const mockSession = new Session() as TestSession

	// Set props
	for (const key in option) {
		mockSession[key] = option[key]
	}

	// Save
	return await mockSession.save()
}

async function destroy(mockSession: Session | string): Promise<void> {
	if (mockSession && typeof mockSession !== 'string') {
		await mockSession.remove()
	} else {
		const session = new Session()

		session.id = mockSession

		await session.remove()
	}
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
	browserAgent?: string
	ipAddress?: string
	expires?: Date
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
