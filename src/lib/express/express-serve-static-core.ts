import { Session, User } from '~/app/domain'

declare module 'express-serve-static-core' {
	interface Request {
		context: {
			session: Session | undefined
		}
		setSession: (value: Session) => void
		getSession: () => Session
		getUser: () => User
	}
}
