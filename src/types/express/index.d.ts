import { Session, User } from '~/app/domain'
import { TokenPayload } from '~/lib/util'
import type { TenantRecord } from '~/lib/util/tenant'

declare module 'express-serve-static-core' {
	interface Request {
		context: {
			session: Session | undefined
		}
		setSession: (value: Session) => void
		getSession: () => Session
		getUser: () => User
		jwtPayload?: TokenPayload
		apiKeyPermissions?: string[]
		twoFactorVerified?: boolean
		tenantId?: string
		tenant?: TenantRecord
	}
}
