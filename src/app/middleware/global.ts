import { Request, Response, NextFunction } from 'express'
import { Session, User } from '~/app/domain'

/**
 * Default req.context object/data
 */
const _default = {
	session: undefined
}

export async function global(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	// Add interface defined request helper functions
	Object.defineProperties(req, {
		context: {
			value: _default
		},
		setSession: {
			value: function(session: Session): void {
				this.context.session = session
			}
		},
		getSession: {
			value: function(): Session | undefined {
				if (this.context) return this.context.session
			}
		},
		getUser: {
			value: function(): User | undefined {
				if (this.context.session && this.context.session) {
					return this.context.session.user
				}
			}
		}
	})

	next()
}
